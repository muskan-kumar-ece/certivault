import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminClient } from "@/server/admin";
import { claimJobs, markJobDone, markJobFailed, enqueueJob } from "@/server/jobs";
import { renderCertificate } from "@/server/pdf";
import { storageUpload } from "@/server/storage";
import { applyCreditDelta } from "@/server/payments";
import { buildExport } from "@/server/export";
import { generateInvoicePdf } from "@/server/invoices";
import { sendEmail } from "@/server/email";
import { colors } from "@/lib/tokens";

export const maxDuration = 60; // 60s execution limit

export async function POST(req: NextRequest) {
  // 1. Verify WORKER_SECRET authorization
  const authHeader = req.headers.get("authorization") || "";
  const expectedSecret = process.env.WORKER_SECRET || "dev_secret";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (process.env.NODE_ENV === "production" && token !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const timeBoxLimit = startTime + 45_000; // 45-second execution budget
  let processedCount = 0;

  try {
    const supabase = adminClient();

    // Loop through claimed job batches while within timebox
    while (Date.now() < timeBoxLimit) {
      const jobs = await claimJobs(4);
      if (!jobs || jobs.length === 0) break;

      for (const job of jobs) {
        if (Date.now() >= timeBoxLimit) break;

        try {
          if (job.type === "generate_chunk") {
            await handleGenerateChunk(job.payload, supabase);
            await markJobDone(job.id);
            processedCount++;
          } else if (job.type === "export") {
            const exportId = job.payload.export_id as string;
            if (exportId) {
              await buildExport(exportId);
            }
            await markJobDone(job.id);
            processedCount++;
          } else if (job.type === "cleanup") {
            await handleCleanup(supabase);
            await markJobDone(job.id);
            processedCount++;
          } else if (job.type === "invoice") {
            const paymentId = job.payload.payment_id as string;
            const orgId = job.payload.org_id as string;
            if (paymentId && orgId) {
              await generateInvoicePdf({ paymentId, orgId });
            }
            await markJobDone(job.id);
            processedCount++;
          } else if (job.type === "send_email_chunk") {
            await handleSendEmailChunk(job.payload, supabase);
            await markJobDone(job.id);
            processedCount++;
          } else {
            await markJobDone(job.id);
            processedCount++;
          }
        } catch (jobErr: unknown) {
          const errMessage = jobErr instanceof Error ? jobErr.message : "Job failed";
          console.error(`Worker job ${job.id} failed:`, jobErr);
          await markJobFailed(job.id, errMessage, job.attempts, 5);
        }
      }
    }

    const durationMs = Date.now() - startTime;

    // Self-retrigger if more queued jobs exist
    const { count } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "queued")
      .lte("run_at", new Date().toISOString());

    if (count && count > 0) {
      const selfUrl = req.nextUrl.clone();
      fetch(selfUrl.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${expectedSecret}`,
        },
      }).catch(() => {
        // Non-blocking background retrigger
      });
    }

    return NextResponse.json({
      status: "ok",
      processed: processedCount,
      durationMs,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Worker failure";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleGenerateChunk(
  payload: Record<string, unknown>,
  supabase: ReturnType<typeof adminClient>
) {
  const batchId = payload.batch_id as string;
  const certificateIds = (payload.certificate_ids as string[]) || [];

  if (!batchId || !certificateIds.length) return;

  // 1. Fetch batch details and template schema
  const { data: batch, error: batchError } = await supabase
    .from("batches")
    .select("id, org_id, template_id, delivery_mode")
    .eq("id", batchId)
    .single();

  if (batchError || !batch) {
    throw new Error(`Batch not found: ${batchError?.message || batchId}`);
  }

  const { data: template, error: tplError } = await supabase
    .from("templates")
    .select("schema")
    .eq("id", batch.template_id)
    .single();

  if (tplError || !template) {
    throw new Error(`Template not found: ${tplError?.message || batch.template_id}`);
  }

  const templateSchema = template.schema as Record<string, unknown>;

  // 2. Fetch org details
  const { data: org } = await supabase
    .from("orgs")
    .select("name, verify_subdomain")
    .eq("id", batch.org_id)
    .single();

  const orgName = org?.name || "CertiVault";

  const generatedCertIds: string[] = [];

  // 3. Process certificates in this chunk
  for (const certId of certificateIds) {
    const { data: cert, error: certError } = await supabase
      .from("certificates")
      .select("id, public_id, recipient_name, recipient_email, data, status")
      .eq("id", certId)
      .single();

    if (certError || !cert) continue;

    // Idempotency: skip if already issued
    if (cert.status === "issued") {
      generatedCertIds.push(cert.id);
      continue;
    }

    try {
      const verifyHost = org?.verify_subdomain || process.env.VERIFY_BASE_URL?.replace(/^https?:\/\//, "") || "certivault.venopai.in";
      const verifyUrl = `https://${verifyHost}/c/${cert.public_id}`;

      // Assemble PDF inputs
      const certData = (cert.data as Record<string, string>) || {};
      const pdfInput: Record<string, string> = {
        recipient_name: cert.recipient_name,
        id: cert.public_id,
        qr: verifyUrl,
        org_name: orgName,
        ...certData,
      };

      // Render PDF via high-performance cached engine
      const pdfBuffer = await renderCertificate(templateSchema, pdfInput);
      const sha256 = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

      // Upload to private certificates bucket
      const storagePath = `${batch.org_id}/${batchId}/${cert.public_id}.pdf`;
      await storageUpload("certificates", storagePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

      // Mark certificate as issued
      await supabase
        .from("certificates")
        .update({
          status: "issued",
          pdf_path: storagePath,
          pdf_sha256: sha256,
          issued_at: new Date().toISOString(),
          error: null,
        })
        .eq("id", cert.id);

      generatedCertIds.push(cert.id);

      // Increment batch generated counter atomically
      await supabase.rpc("increment_batch_counter", {
        _batch_id: batchId,
        _is_generated: true,
      });
    } catch (renderErr: unknown) {
      const errorMsg = renderErr instanceof Error ? renderErr.message : "Rendering failed";
      console.error(`Certificate ${cert.id} generation failed:`, renderErr);

      // Mark certificate as failed
      await supabase
        .from("certificates")
        .update({
          status: "failed",
          error: errorMsg,
        })
        .eq("id", cert.id);

      // Increment batch failed counter atomically
      await supabase.rpc("increment_batch_counter", {
        _batch_id: batchId,
        _is_generated: false,
      });

      // Automatic credit refund per TRD.md §6
      await applyCreditDelta(
        batch.org_id,
        1,
        "issue_refund",
        "certificate",
        cert.id
      ).catch((refErr) => {
        console.error(`Credit refund failed for cert ${cert.id}:`, refErr);
      });
    }
  }

  // 4. If delivery_mode is 'email', enqueue delivery for the generated certificates
  if (batch.delivery_mode === "email" && generatedCertIds.length > 0) {
    const emailChunkSize = 50;
    for (let i = 0; i < generatedCertIds.length; i += emailChunkSize) {
      const chunk = generatedCertIds.slice(i, i + emailChunkSize);
      await enqueueJob("send_email_chunk", {
        batch_id: batchId,
        certificate_ids: chunk,
      });
    }
  }

  // 5. Check if batch has finished all rows
  const { count: pendingCount } = await supabase
    .from("certificates")
    .select("*", { count: "exact", head: true })
    .eq("batch_id", batchId)
    .eq("status", "pending");

  if (pendingCount === 0) {
    const { count: issuedCount } = await supabase
      .from("certificates")
      .select("*", { count: "exact", head: true })
      .eq("batch_id", batchId)
      .eq("status", "issued");

    const { count: failedCount } = await supabase
      .from("certificates")
      .select("*", { count: "exact", head: true })
      .eq("batch_id", batchId)
      .eq("status", "failed");

    const finalStatus = (failedCount || 0) > 0 ? "completed_with_errors" : "completed";

    await supabase
      .from("batches")
      .update({
        status: finalStatus,
        generated: issuedCount || 0,
        failed: failedCount || 0,
        completed_at: new Date().toISOString(),
      })
      .eq("id", batchId);
  }
}

async function handleCleanup(supabase: ReturnType<typeof adminClient>) {
  // Expire stale exports past 7 days
  await supabase
    .from("exports")
    .update({ status: "expired" })
    .eq("status", "ready")
    .lt("expires_at", new Date().toISOString());
}

async function handleSendEmailChunk(
  payload: Record<string, unknown>,
  supabase: ReturnType<typeof adminClient>
) {
  const certificateIds = (payload.certificate_ids as string[]) || [];
  if (!certificateIds.length) return;

  const { data: certs } = await supabase
    .from("certificates")
    .select(`
      id,
      public_id,
      recipient_name,
      recipient_email,
      org_id,
      orgs (
        name,
        brand_color
      )
    `)
    .in("id", certificateIds)
    .eq("status", "issued");

  if (!certs || !certs.length) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://certivault.venopai.in";

  for (const cert of certs) {
    if (!cert.recipient_email) continue;
    const orgName = (cert.orgs as unknown as { name?: string })?.name || "Your Institution";
    const brandColor = (cert.orgs as unknown as { brand_color?: string })?.brand_color || colors.brand.primary;
    const verifyUrl = `${siteUrl}/c/${cert.public_id}`;

    try {
      const emailResult = await sendEmail({
        to: cert.recipient_email,
        subject: `Your certificate from ${orgName}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: ${colors.surface.light}; color: ${colors.ink.primary.light}; border-radius: 12px; border: 1px solid rgba(226, 232, 240, 0.8);">
            <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; color: ${colors.ink.primary.light};">Your Certificate is Available</h2>
            <p style="font-size: 14px; line-height: 1.6; color: ${colors.ink.secondary.light};">
              Hello <strong>${cert.recipient_name}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: ${colors.ink.secondary.light};">
              Your digital credential from <strong>${orgName}</strong> has been issued. You can view, download, and verify its authenticity using the secure link below:
            </p>
            <div style="margin: 28px 0; text-align: center;">
              <a href="${verifyUrl}" style="background-color: ${brandColor}; color: ${colors.surface.light}; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block;">
                View Certificate
              </a>
            </div>
            <p style="font-size: 12px; color: ${colors.ink.secondary.light}; line-height: 1.5; margin-top: 24px;">
              Certificate ID: <code style="font-family: monospace; background: ${colors.brand.soft}; padding: 2px 6px; border-radius: 4px;">${cert.public_id}</code><br/>
              Direct link: <a href="${verifyUrl}" style="color: ${brandColor};">${verifyUrl}</a>
            </p>
          </div>
        `,
      });

      await supabase
        .from("certificates")
        .update({
          email_status: emailResult.delivered ? "delivered" : "failed",
          delivered_at: emailResult.delivered ? new Date().toISOString() : null,
        })
        .eq("id", cert.id);
    } catch (sendErr) {
      console.error(`Failed to send email to cert ${cert.id}:`, sendErr);
      await supabase
        .from("certificates")
        .update({ email_status: "failed" })
        .eq("id", cert.id);
    }
  }
}

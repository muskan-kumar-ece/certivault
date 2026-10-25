import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminClient } from "@/server/admin";
import { claimJobs, markJobDone, markJobFailed } from "@/server/jobs";
import { renderCertificate } from "@/server/pdf";
import { storageUpload } from "@/server/storage";
import { applyCreditDelta } from "@/server/payments";

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
          } else {
            // Placeholder for future job types (send_email_chunk, export, invoice)
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

  // 3. Process certificates in this chunk
  for (const certId of certificateIds) {
    const { data: cert, error: certError } = await supabase
      .from("certificates")
      .select("id, public_id, recipient_name, data, status")
      .eq("id", certId)
      .single();

    if (certError || !cert) continue;

    // Idempotency: skip if already issued
    if (cert.status === "issued") continue;

    try {
      const verifyHost = org?.verify_subdomain || "certivault.in";
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

      // Increment batch generated counter
      await supabase.rpc("increment_batch_counter", {
        _batch_id: batchId,
        _is_generated: true,
      }).then(({ error: rpcErr }) => {
        if (rpcErr) {
          // Fallback manual increment
          return supabase
            .from("batches")
            .update({ generated: ((batch as unknown as Record<string, number>).generated || 0) + 1 })
            .eq("id", batchId);
        }
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

  // 4. Check if batch has finished all rows
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

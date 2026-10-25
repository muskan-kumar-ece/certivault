"use server";

import crypto from "crypto";
import { z } from "zod";
import { requireRole, audit } from "@/server/auth";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/server/admin";
import { enqueueJob } from "@/server/jobs";
import { renderCertificate } from "@/server/pdf";
import { storageUpload, getSignedUrl } from "@/server/storage";
import { exportKindSchema } from "@/server/export";
import { sendEmail } from "@/server/email";
import { colors } from "@/lib/tokens";
import { revalidatePath } from "next/cache";

const revokeCertificateSchema = z.object({
  certId: z.string().uuid(),
  reason: z.string().min(3, "Revocation reason must be at least 3 characters").max(500),
  showReason: z.boolean().default(false),
  notifyRecipient: z.boolean().default(false),
});

export async function revokeCertificateAction(
  orgId: string,
  rawInput: z.infer<typeof revokeCertificateSchema>
) {
  await requireRole(orgId, ["owner", "admin"]);
  const input = revokeCertificateSchema.parse(rawInput);

  const supabase = await createClient();

  // 1. Fetch certificate
  const { data: cert, error: fetchErr } = await supabase
    .from("certificates")
    .select("id, public_id, recipient_name, recipient_email, status, org_id")
    .eq("id", input.certId)
    .eq("org_id", orgId)
    .single();

  if (fetchErr || !cert) {
    throw new Error("Certificate not found.");
  }

  if (cert.status === "revoked") {
    throw new Error("Certificate is already revoked.");
  }

  // 2. Update certificate to revoked
  const revokedAt = new Date().toISOString();
  const { error: updateErr } = await supabase
    .from("certificates")
    .update({
      status: "revoked",
      revoked_at: revokedAt,
      revoked_reason: input.reason,
      show_revoked_reason: input.showReason,
    })
    .eq("id", cert.id);

  if (updateErr) {
    throw new Error(`Failed to revoke certificate: ${updateErr.message}`);
  }

  // 3. Audit log
  await audit(orgId, "certificate.revoke", "certificate", cert.id, {
    publicId: cert.public_id,
    reason: input.reason,
    showReason: input.showReason,
  });

  // 4. Optionally notify recipient via email
  if (input.notifyRecipient && cert.recipient_email) {
    await sendEmail({
      to: cert.recipient_email,
      subject: `Notice: Certificate ${cert.public_id} Revocation`,
      html: `
        <div style="font-family: -apple-system, sans-serif; padding: 24px; color: ${colors.ink.primary.light};">
          <h2 style="color: ${colors.danger.light};">Certificate Revocation Notice</h2>
          <p>Dear ${cert.recipient_name},</p>
          <p>This is to inform you that credential <strong>${cert.public_id}</strong> has been revoked by the issuing institution.</p>
          ${input.showReason ? `<p><strong>Reason:</strong> ${input.reason}</p>` : ""}
          <p style="font-size: 12px; color: ${colors.ink.secondary.light}; margin-top: 32px;">CertiVault Trust Engine</p>
        </div>
      `,
    }).catch((err) => {
      console.warn("Failed to send revocation notification email:", err);
    });
  }

  revalidatePath("/app/certificates");
  revalidatePath(`/app/certificates/${cert.id}`);
  return { success: true, revokedAt };
}

const correctCertificateSchema = z.object({
  certId: z.string().uuid(),
  newRecipientName: z.string().min(2, "Recipient name must be at least 2 characters").max(120),
  customData: z.record(z.string()).optional(),
});

export async function correctCertificateAction(
  orgId: string,
  rawInput: z.infer<typeof correctCertificateSchema>
) {
  await requireRole(orgId, ["owner", "admin"]);
  const input = correctCertificateSchema.parse(rawInput);

  const supabase = await createClient();
  const admin = adminClient();

  // 1. Fetch certificate, batch, template, and org
  const { data: cert, error: fetchErr } = await supabase
    .from("certificates")
    .select("id, public_id, recipient_name, data, pdf_path, pdf_sha256, template_id, batch_id, status, archived_pdfs")
    .eq("id", input.certId)
    .eq("org_id", orgId)
    .single();

  if (fetchErr || !cert) {
    throw new Error("Certificate not found.");
  }

  if (cert.status !== "issued") {
    throw new Error("Only issued certificates can be corrected and reissued.");
  }

  const { data: template } = await supabase
    .from("templates")
    .select("schema")
    .eq("id", cert.template_id)
    .single();

  if (!template) {
    throw new Error("Template not found for this certificate.");
  }

  const { data: org } = await supabase
    .from("orgs")
    .select("name, verify_subdomain")
    .eq("id", orgId)
    .single();

  // 2. Archive current PDF
  const existingArchives = (cert.archived_pdfs as Array<Record<string, unknown>>) || [];
  const updatedArchives = [
    ...existingArchives,
    {
      pdf_path: cert.pdf_path,
      pdf_sha256: cert.pdf_sha256,
      archived_at: new Date().toISOString(),
      recipient_name: cert.recipient_name,
    },
  ];

  // 3. Re-render PDF with the same public ID
  const verifyHost = org?.verify_subdomain || "certivault.in";
  const verifyUrl = `https://${verifyHost}/c/${cert.public_id}`;
  const mergedData = {
    ...((cert.data as Record<string, string>) || {}),
    ...(input.customData || {}),
  };

  const pdfInput: Record<string, string> = {
    recipient_name: input.newRecipientName,
    id: cert.public_id,
    qr: verifyUrl,
    org_name: org?.name || "CertiVault",
    ...mergedData,
  };

  const pdfBuffer = await renderCertificate(
    template.schema as Record<string, unknown>,
    pdfInput
  );
  const newSha256 = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

  // Storage path for corrected PDF
  const newStoragePath = `${orgId}/${cert.batch_id || "single"}/${cert.public_id}_v${updatedArchives.length + 1}.pdf`;
  await storageUpload("certificates", newStoragePath, pdfBuffer, {
    contentType: "application/pdf",
    upsert: true,
  });

  // 4. Update certificate record
  const { error: updateErr } = await admin
    .from("certificates")
    .update({
      recipient_name: input.newRecipientName,
      data: mergedData,
      pdf_path: newStoragePath,
      pdf_sha256: newSha256,
      archived_pdfs: updatedArchives,
    })
    .eq("id", cert.id);

  if (updateErr) {
    throw new Error(`Failed to update certificate: ${updateErr.message}`);
  }

  // 5. Audit log
  await audit(orgId, "certificate.correct", "certificate", cert.id, {
    publicId: cert.public_id,
    oldName: cert.recipient_name,
    newName: input.newRecipientName,
    version: updatedArchives.length + 1,
  });

  revalidatePath("/app/certificates");
  revalidatePath(`/app/certificates/${cert.id}`);
  return { success: true, publicId: cert.public_id };
}

const requestExportSchema = z.object({
  kind: exportKindSchema,
  batchId: z.string().uuid().optional(),
  filter: z.record(z.unknown()).optional(),
});

export async function requestExportAction(
  orgId: string,
  rawInput: z.infer<typeof requestExportSchema>
) {
  const user = await requireRole(orgId, ["owner", "admin", "issuer"]);
  const input = requestExportSchema.parse(rawInput);

  const supabase = await createClient();

  // 1. Insert export row
  const { data: exp, error: insertErr } = await supabase
    .from("exports")
    .insert({
      org_id: orgId,
      batch_id: input.batchId ?? null,
      kind: input.kind,
      filter: input.filter || {},
      requested_by: user.user.id,
      status: "queued",
    })
    .select("id, status, kind")
    .single();

  if (insertErr || !exp) {
    throw new Error(`Failed to create export request: ${insertErr?.message}`);
  }

  // 2. Enqueue background export job
  await enqueueJob("export", {
    export_id: exp.id,
    org_id: orgId,
  });

  // 3. Audit log
  await audit(orgId, "export.create", "export", exp.id, {
    kind: input.kind,
    batchId: input.batchId,
  });

  revalidatePath("/app/certificates");
  return { exportId: exp.id, status: exp.status, kind: exp.kind };
}

export async function getExportsListAction(orgId: string) {
  await requireRole(orgId, ["owner", "admin", "issuer", "viewer"]);
  const supabase = await createClient();

  const { data: exportsList, error } = await supabase
    .from("exports")
    .select("id, kind, status, parts, expires_at, created_at, batch_id")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Failed to fetch exports: ${error.message}`);
  }

  // Sign URLs for ready export files
  const enriched = await Promise.all(
    (exportsList || []).map(async (exp) => {
      const parts = (exp.parts as Array<{ path: string; sizeBytes: number; certificateCount: number }>) || [];
      const signedParts = await Promise.all(
        parts.map(async (part) => {
          let downloadUrl = "";
          if (exp.status === "ready" && part.path) {
            try {
              downloadUrl = await getSignedUrl("exports", part.path, 3600); // 1-hour signed URL
            } catch {
              // Ignore signing error
            }
          }
          return { ...part, downloadUrl };
        })
      );

      return {
        ...exp,
        parts: signedParts,
      };
    })
  );

  return enriched;
}

export async function retryFailedBatchAction(orgId: string, batchId: string) {
  await requireRole(orgId, ["owner", "admin", "issuer"]);
  const supabase = await createClient();

  // Find failed certificates in this batch
  const { data: failedCerts, error } = await supabase
    .from("certificates")
    .select("id")
    .eq("batch_id", batchId)
    .eq("org_id", orgId)
    .eq("status", "failed");

  if (error || !failedCerts || failedCerts.length === 0) {
    return { count: 0, message: "No failed certificates found to retry." };
  }

  const ids = failedCerts.map((c) => c.id);

  // Reset certificates to pending
  await supabase
    .from("certificates")
    .update({ status: "pending", error: null })
    .in("id", ids);

  // Update batch status to generating
  await supabase
    .from("batches")
    .update({ status: "generating" })
    .eq("id", batchId);

  // Chunk ids into batches of 20 and enqueue generate_chunk jobs
  const chunkSize = 20;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    await enqueueJob("generate_chunk", {
      batch_id: batchId,
      certificate_ids: chunk,
    });
  }

  await audit(orgId, "batch.retry_failed", "batch", batchId, {
    retriedCount: ids.length,
  });

  revalidatePath(`/app/certificates/batch/${batchId}`);
  return { count: ids.length, message: `Queued ${ids.length} certificates for retry.` };
}

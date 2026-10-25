"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole, audit } from "@/server/auth";
import { newPublicId, renderCertificate } from "@/server/pdf";
import { applyCreditDelta } from "@/server/payments";
import { enqueueJob } from "@/server/jobs";
import { sendEmail } from "@/server/email";
import { colors } from "@/lib/tokens";
import {
  saveDraftBatchSchema,
  issueBatchSchema,
  sendTestCertificateSchema,
  type SaveDraftBatchInput,
  type IssueBatchInput,
  type SendTestCertificateInput,
} from "@/lib/schemas/issue";

const CHUNK_SIZE = 20; // 20 certificates per generate_chunk job per ARCHITECTURE_LOCK.md §7

export async function saveDraftBatchAction(rawInput: SaveDraftBatchInput) {
  const input = saveDraftBatchSchema.parse(rawInput);
  const { user } = await requireRole(input.orgId, ["owner", "admin", "issuer"]);
  const supabase = await createClient();

  // Verify org is not suspended
  const { data: orgCheck } = await supabase
    .from("orgs")
    .select("suspended_at")
    .eq("id", input.orgId)
    .single();

  if (orgCheck?.suspended_at) {
    throw new Error("This organization is suspended. Creating or editing batches is disabled.");
  }

  // Verify template exists
  const { data: template, error: tplError } = await supabase
    .from("templates")
    .select("id, name")
    .eq("id", input.templateId)
    .single();

  if (tplError || !template) {
    throw new Error("Selected template was not found or is inaccessible.");
  }

  let batchId = input.batchId;

  if (batchId) {
    // Update existing draft
    const { error: updateError } = await supabase
      .from("batches")
      .update({
        template_id: input.templateId,
        name: input.name,
        delivery_mode: input.deliveryMode,
        email_subject: input.emailSubject || null,
        email_body: input.emailBody || null,
        total: input.recipients.length,
      })
      .eq("id", batchId)
      .eq("org_id", input.orgId)
      .eq("status", "draft");

    if (updateError) {
      throw new Error(`Failed to update batch: ${updateError.message}`);
    }

    // Clean up previous pending certificates for this draft batch
    await supabase
      .from("certificates")
      .delete()
      .eq("batch_id", batchId)
      .eq("status", "pending");
  } else {
    // Insert new draft
    const { data: newBatch, error: insertError } = await supabase
      .from("batches")
      .insert({
        org_id: input.orgId,
        template_id: input.templateId,
        name: input.name,
        delivery_mode: input.deliveryMode,
        email_subject: input.emailSubject || null,
        email_body: input.emailBody || null,
        total: input.recipients.length,
        status: "draft",
        created_by: user.id,
      })
      .select("id")
      .single();

    if (insertError || !newBatch) {
      throw new Error(`Failed to create draft batch: ${insertError?.message || "Unknown error"}`);
    }

    batchId = newBatch.id;
  }

  // Insert recipients into certificates in chunks of 500
  const certificateRows = input.recipients.map((r) => ({
    public_id: newPublicId(),
    org_id: input.orgId,
    batch_id: batchId,
    template_id: input.templateId,
    recipient_name: r.name,
    recipient_email: r.email || null,
    data: r.fields || {},
    status: "pending",
    email_status: input.deliveryMode === "email" && r.email ? "queued" : "none",
  }));

  const INSERT_CHUNK = 500;
  for (let i = 0; i < certificateRows.length; i += INSERT_CHUNK) {
    const chunk = certificateRows.slice(i, i + INSERT_CHUNK);
    const { error: certError } = await supabase.from("certificates").insert(chunk);
    if (certError) {
      throw new Error(`Failed to save recipient rows: ${certError.message}`);
    }
  }

  await audit(input.orgId, "batch.draft_saved", "batch", batchId, {
    recipient_count: input.recipients.length,
    name: input.name,
  });

  return { success: true, batchId, total: input.recipients.length };
}

export async function getDraftBatchAction(batchId: string, orgId: string) {
  await requireRole(orgId, ["owner", "admin", "issuer", "viewer"]);
  const supabase = await createClient();

  const { data: batch, error: batchError } = await supabase
    .from("batches")
    .select("*")
    .eq("id", batchId)
    .eq("org_id", orgId)
    .single();

  if (batchError || !batch) {
    throw new Error("Batch not found.");
  }

  const { data: certificates, error: certError } = await supabase
    .from("certificates")
    .select("id, recipient_name, recipient_email, data, status, error, public_id")
    .eq("batch_id", batchId)
    .limit(5000);

  if (certError) {
    throw new Error("Failed to load certificates for batch.");
  }

  return { batch, certificates: certificates || [] };
}

export async function issueBatchAction(rawInput: IssueBatchInput) {
  const input = issueBatchSchema.parse(rawInput);
  await requireRole(input.orgId, ["owner", "admin", "issuer"]);
  const supabase = await createClient();

  // 1. Fetch batch
  const { data: batch, error: batchError } = await supabase
    .from("batches")
    .select("id, status, total, delivery_mode, name")
    .eq("id", input.batchId)
    .eq("org_id", input.orgId)
    .single();

  if (batchError || !batch) {
    throw new Error("Batch not found.");
  }

  if (batch.status !== "draft") {
    throw new Error(`Cannot issue batch in status '${batch.status}'. Only draft batches can be issued.`);
  }

  if (batch.total <= 0) {
    throw new Error("Batch must contain at least 1 recipient before issuing.");
  }

  // 2. Check organization credits and suspension status
  const { data: org, error: orgError } = await supabase
    .from("orgs")
    .select("credit_balance, suspended_at")
    .eq("id", input.orgId)
    .single();

  if (orgError || !org) {
    throw new Error("Organization profile not found.");
  }

  if (org.suspended_at) {
    throw new Error("This organization is suspended. Issuing certificates is disabled.");
  }

  if (org.credit_balance < batch.total) {
    throw new Error(
      `Insufficient credits. This batch requires ${batch.total} credits, but your balance is ${org.credit_balance}. Please add credits to proceed.`
    );
  }

  // 3. Atomically reserve credits via apply_credit_delta
  await applyCreditDelta(
    input.orgId,
    -batch.total,
    "issue_reserve",
    "batch",
    input.batchId
  );

  // 4. Update batch status to 'queued'
  const { error: updateBatchError } = await supabase
    .from("batches")
    .update({
      status: "queued",
      credits_reserved: batch.total,
    })
    .eq("id", input.batchId);

  if (updateBatchError) {
    throw new Error(`Failed to update batch status: ${updateBatchError.message}`);
  }

  // 5. Fetch all pending certificate IDs
  const { data: certs, error: certsError } = await supabase
    .from("certificates")
    .select("id")
    .eq("batch_id", input.batchId)
    .eq("status", "pending");

  if (certsError || !certs || certs.length === 0) {
    throw new Error("No pending certificates found in this batch.");
  }

  const certIds = certs.map((c) => c.id);

  // 6. Enqueue generate_chunk jobs in chunks of 20
  for (let i = 0; i < certIds.length; i += CHUNK_SIZE) {
    const chunk = certIds.slice(i, i + CHUNK_SIZE);
    await enqueueJob("generate_chunk", {
      batch_id: input.batchId,
      certificate_ids: chunk,
    });
  }

  await audit(input.orgId, "batch.issued", "batch", input.batchId, {
    total: batch.total,
    credits_reserved: batch.total,
  });

  // 7. Fire-and-forget worker trigger (best-effort self wakeup)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const workerSecret = process.env.WORKER_SECRET || "dev_secret";
  fetch(`${appUrl}/api/worker`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${workerSecret}`,
    },
  }).catch(() => {
    // Non-blocking catch for local/offline environments
  });

  return { success: true, batchId: input.batchId, total: batch.total };
}

export async function sendTestCertificateAction(rawInput: SendTestCertificateInput) {
  const input = sendTestCertificateSchema.parse(rawInput);
  await requireRole(input.orgId, ["owner", "admin", "issuer"]);
  const supabase = await createClient();

  // Fetch template and org
  const { data: template, error: tplError } = await supabase
    .from("templates")
    .select("schema, name")
    .eq("id", input.templateId)
    .single();

  if (tplError || !template) {
    throw new Error("Template not found.");
  }

  const { data: org, error: orgError } = await supabase
    .from("orgs")
    .select("name, logo_path, suspended_at")
    .eq("id", input.orgId)
    .single();

  if (orgError || !org) {
    throw new Error("Organization not found.");
  }

  if (org.suspended_at) {
    throw new Error("This organization is suspended. Sending test certificates is disabled.");
  }

  const testPublicId = newPublicId();
  const verifyUrl = `https://certivault.in/c/${testPublicId}`;

  // Render PDF
  const tplSchema = template.schema as Record<string, unknown>;
  const pdfBuffer = await renderCertificate(tplSchema, {
    recipient_name: input.recipientName,
    id: testPublicId,
    qr: verifyUrl,
    org_name: org.name,
    ...input.fields,
  });

  // Send email test via server/email
  await sendEmail({
    to: input.email,
    subject: `Test Certificate: ${template.name}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: ${colors.ink.primary.light}; font-size: 20px;">Test Certificate Preview</h2>
        <p style="color: ${colors.ink.secondary.light}; font-size: 15px; line-height: 24px;">
          This is a sample test certificate generated for <strong>${input.recipientName}</strong> by <strong>${org.name}</strong>.
        </p>
        <div style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background-color: ${colors.accent.ultramarine.light}; color: ${colors.surface.light}; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 15px; display: inline-block;">
            View Verification Page
          </a>
        </div>
        <p style="color: ${colors.ink.secondary.light}; font-size: 13px;">Certificate ID: ${testPublicId}</p>
      </div>
    `,
  });

  return { success: true, publicId: testPublicId, pdfByteLength: pdfBuffer.byteLength };
}

export async function getBatchProgressAction(batchId: string, orgId: string) {
  await requireRole(orgId, ["owner", "admin", "issuer", "viewer"]);
  const supabase = await createClient();

  const { data: batch, error } = await supabase
    .from("batches")
    .select("id, name, status, total, generated, failed, delivered, delivery_mode, completed_at, credits_reserved")
    .eq("id", batchId)
    .eq("org_id", orgId)
    .single();

  if (error || !batch) {
    throw new Error("Batch not found.");
  }

  return batch;
}

"use server";

import { requireRole, audit, requireUser } from "@/server/auth";
import { createClient } from "@/lib/supabase/server";
import {
  createTemplateSchema,
  updateTemplateSchema,
  validateTemplateUsability,
  CreateTemplateInput,
  UpdateTemplateInput,
} from "@/lib/schemas/template";
import { renderCertificate } from "@/server/pdf";
import { revalidatePath } from "next/cache";

export interface TemplateRecord {
  id: string;
  org_id: string | null;
  name: string;
  page_size: string;
  schema: Record<string, unknown>;
  field_keys: string[];
  background_path: string | null;
  thumbnail_path: string | null;
  archived_at: string | null;
  created_at: string;
}

/**
 * Lists templates visible to the organization (its own custom templates + platform presets).
 */
export async function listTemplatesAction(
  orgId: string,
  filter: "all" | "mine" | "presets" = "all"
): Promise<TemplateRecord[]> {
  await requireRole(orgId, ["owner", "admin", "issuer", "viewer"]);
  const supabase = await createClient();

  let query = supabase
    .from("templates")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter === "mine") {
    query = query.eq("org_id", orgId).is("archived_at", null);
  } else if (filter === "presets") {
    query = query.is("org_id", null);
  } else {
    // Both org templates and presets
    query = query.or(`org_id.eq.${orgId},org_id.is.null`).is("archived_at", null);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to list templates: ${error.message}`);
  }

  return data as TemplateRecord[];
}

/**
 * Retrieves a single template by ID.
 */
export async function getTemplateByIdAction(
  templateId: string,
  orgId: string
): Promise<TemplateRecord> {
  await requireRole(orgId, ["owner", "admin", "issuer", "viewer"]);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", templateId)
    .or(`org_id.eq.${orgId},org_id.is.null`)
    .single();

  if (error || !data) {
    throw new Error("Template not found or access denied.");
  }

  return data as TemplateRecord;
}

/**
 * Creates a new custom template for the organization.
 * Enforces usability rules: QR code and ID fields are validated.
 * Requires role: 'owner', 'admin', or 'issuer'.
 */
export async function createTemplateAction(rawInput: CreateTemplateInput) {
  const input = createTemplateSchema.parse(rawInput);
  const { user } = await requireRole(input.orgId, ["owner", "admin", "issuer"]);

  // Validate usability
  const usability = validateTemplateUsability(input.schema);
  if (!usability.usable) {
    throw new Error(
      `Template cannot be created without required verification elements: ${usability.missingFields.join(", ")}.`
    );
  }

  const supabase = await createClient();

  const { data: template, error } = await supabase
    .from("templates")
    .insert({
      org_id: input.orgId,
      name: input.name,
      page_size: input.pageSize,
      schema: input.schema,
      field_keys: input.fieldKeys,
      background_path: input.backgroundPath || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error || !template) {
    throw new Error(`Failed to create template: ${error?.message || "Unknown error"}`);
  }

  await audit(input.orgId, "template.create", "template", template.id, {
    name: template.name,
    page_size: template.page_size,
  });

  revalidatePath("/app/templates");
  return { success: true, template: template as TemplateRecord };
}

/**
 * Updates an existing custom template.
 * Presets (org_id is null) are locked and cannot be edited.
 * Requires role: 'owner', 'admin', or 'issuer'.
 */
export async function updateTemplateAction(rawInput: UpdateTemplateInput) {
  const input = updateTemplateSchema.parse(rawInput);
  await requireRole(input.orgId, ["owner", "admin", "issuer"]);

  if (input.schema) {
    const usability = validateTemplateUsability(input.schema);
    if (!usability.usable) {
      throw new Error(
        `Template cannot be saved without required verification elements: ${usability.missingFields.join(", ")}.`
      );
    }
  }

  const supabase = await createClient();

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name) updatePayload.name = input.name;
  if (input.pageSize) updatePayload.page_size = input.pageSize;
  if (input.schema) updatePayload.schema = input.schema;
  if (input.fieldKeys) updatePayload.field_keys = input.fieldKeys;
  if (input.backgroundPath !== undefined) updatePayload.background_path = input.backgroundPath;
  if (input.archived !== undefined) {
    updatePayload.archived_at = input.archived ? new Date().toISOString() : null;
  }

  const { data: updated, error } = await supabase
    .from("templates")
    .update(updatePayload)
    .eq("id", input.id)
    .eq("org_id", input.orgId)
    .select()
    .single();

  if (error || !updated) {
    throw new Error(`Failed to update template: ${error?.message || "Unknown error"}`);
  }

  await audit(input.orgId, "template.update", "template", input.id, {
    name: updated.name,
  });

  revalidatePath("/app/templates");
  revalidatePath(`/app/templates/${input.id}`);
  return { success: true, template: updated as TemplateRecord };
}

/**
 * Duplicates a template (either a preset or an existing custom template) into the organization.
 */
export async function duplicateTemplateAction(
  templateId: string,
  orgId: string,
  newName?: string
) {
  const { user } = await requireRole(orgId, ["owner", "admin", "issuer"]);
  const supabase = await createClient();

  // Fetch source template
  const { data: source, error: sourceError } = await supabase
    .from("templates")
    .select("*")
    .eq("id", templateId)
    .or(`org_id.eq.${orgId},org_id.is.null`)
    .single();

  if (sourceError || !source) {
    throw new Error("Source template not found.");
  }

  const name = newName || `${source.name} (Copy)`;

  const { data: copy, error: copyError } = await supabase
    .from("templates")
    .insert({
      org_id: orgId,
      name,
      page_size: source.page_size,
      schema: source.schema,
      field_keys: source.field_keys,
      background_path: source.background_path,
      created_by: user.id,
    })
    .select()
    .single();

  if (copyError || !copy) {
    throw new Error(`Failed to duplicate template: ${copyError?.message}`);
  }

  await audit(orgId, "template.duplicate", "template", copy.id, {
    source_id: templateId,
    name: copy.name,
  });

  revalidatePath("/app/templates");
  return { success: true, template: copy as TemplateRecord };
}

/**
 * Renders a preview of a template schema with sample data, returning a base64 data URL.
 */
export async function renderTemplatePreviewAction(
  templateSchema: Record<string, unknown>,
  sampleInput: Record<string, string> = {}
): Promise<string> {
  await requireUser();

  const defaultSample: Record<string, string> = {
    header: "CERTIFICATE OF EXCELLENCE",
    recipient_name: "Aarav Sharma",
    title: "National Hackathon 2026 — 1st Place",
    position: "1st Place Winner",
    date: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    id: "CV-26-87HKL2P9",
    qr: `${process.env.VERIFY_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://certivault.venopai.in"}/c/CV-26-87HKL2P9`,
    org_name: "IEEE Student Branch",
    signatory_name: "Dr. Lakshmi Rao",
    signatory_title: "Dean of Academic Affairs",
    ...sampleInput,
  };

  const pdfBuffer = await renderCertificate(templateSchema, defaultSample);
  return `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
}

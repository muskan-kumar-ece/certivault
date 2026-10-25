"use server";

import { requireRole, audit } from "@/server/auth";
import { createClient } from "@/lib/supabase/server";
import { updateOrgSettingsSchema, UpdateOrgSettingsInput } from "@/lib/schemas/settings";
import { colors } from "@/lib/tokens";
import { revalidatePath } from "next/cache";

/**
 * Updates organization settings including brand color, logo, sender details, and retention.
 * Requires role: 'owner' or 'admin'.
 */
export async function updateOrgSettingsAction(orgId: string, rawInput: UpdateOrgSettingsInput) {
  // 1. Authorize: Only owner or admin can update settings
  await requireRole(orgId, ["owner", "admin"]);

  // 2. Validate input
  const input = updateOrgSettingsSchema.parse(rawInput);
  const supabase = await createClient();

  // Fetch existing org settings to preserve unrelated billing metadata
  const { data: existingOrg, error: fetchError } = await supabase
    .from("orgs")
    .select("billing")
    .eq("id", orgId)
    .single();

  if (fetchError || !existingOrg) {
    throw new Error("Organization not found.");
  }

  const existingBilling = (existingOrg.billing as Record<string, unknown>) || {};
  const updatedBilling = {
    ...existingBilling,
    sender_name: input.senderName || undefined,
    reply_to: input.replyTo || undefined,
    retention_days: input.retentionDays,
  };

  // 3. Act: Update org record
  const { data: updatedOrg, error: updateError } = await supabase
    .from("orgs")
    .update({
      name: input.name,
      brand_color: input.brandColor,
      logo_path: input.logoPath ?? undefined,
      billing: updatedBilling,
    })
    .eq("id", orgId)
    .select()
    .single();

  if (updateError || !updatedOrg) {
    throw new Error(`Failed to update organization settings: ${updateError?.message || "Unknown error"}`);
  }

  // 4. Audit: Record settings change
  await audit(orgId, "org.settings_update", "org", orgId, {
    name: input.name,
    brand_color: input.brandColor,
    retention_days: input.retentionDays,
  });

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { success: true, org: updatedOrg };
}

/**
 * Retrieves the full settings and details for an organization.
 */
export async function getOrgSettingsAction(orgId: string) {
  await requireRole(orgId, ["owner", "admin", "issuer", "viewer"]);
  const supabase = await createClient();

  const { data: org, error } = await supabase
    .from("orgs")
    .select("*")
    .eq("id", orgId)
    .single();

  if (error || !org) {
    throw new Error("Failed to load organization settings.");
  }

  const billing = (org.billing as Record<string, unknown>) || {};

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    kind: org.kind,
    brandColor: org.brand_color || colors.accent.ultramarine.light,
    logoPath: org.logo_path,
    senderName: (billing.sender_name as string) || "",
    replyTo: (billing.reply_to as string) || "",
    retentionDays: (billing.retention_days as number) || 0,
    creditBalance: org.credit_balance,
    plan: org.plan,
    verified: org.verified,
  };
}

"use server";

import { requireRole, audit } from "@/server/auth";
import { createClient } from "@/lib/supabase/server";
import {
  createSignatorySchema,
  updateSignatorySchema,
  CreateSignatoryInput,
  UpdateSignatoryInput,
} from "@/lib/schemas/signatory";
import { revalidatePath } from "next/cache";

export interface SignatoryItem {
  id: string;
  org_id: string;
  name: string;
  title: string | null;
  signature_path: string | null;
  created_at: string;
}

/**
 * Lists all signatories for an organization.
 */
export async function listSignatoriesAction(orgId: string): Promise<SignatoryItem[]> {
  await requireRole(orgId, ["owner", "admin", "issuer", "viewer"]);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("signatories")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to list signatories: ${error.message}`);
  }

  return data as SignatoryItem[];
}

/**
 * Creates a new signatory for the organization.
 * Requires role: 'owner' or 'admin'.
 */
export async function createSignatoryAction(rawInput: CreateSignatoryInput) {
  const input = createSignatorySchema.parse(rawInput);
  await requireRole(input.orgId, ["owner", "admin"]);
  const supabase = await createClient();

  const { data: signatory, error } = await supabase
    .from("signatories")
    .insert({
      org_id: input.orgId,
      name: input.name,
      title: input.title || null,
      signature_path: input.signaturePath || null,
    })
    .select()
    .single();

  if (error || !signatory) {
    throw new Error(`Failed to create signatory: ${error?.message || "Unknown error"}`);
  }

  await audit(input.orgId, "signatory.create", "signatory", signatory.id, {
    name: signatory.name,
    title: signatory.title,
  });

  revalidatePath("/app/settings");
  return { success: true, signatory: signatory as SignatoryItem };
}

/**
 * Updates an existing signatory.
 * Requires role: 'owner' or 'admin'.
 */
export async function updateSignatoryAction(rawInput: UpdateSignatoryInput) {
  const input = updateSignatorySchema.parse(rawInput);
  await requireRole(input.orgId, ["owner", "admin"]);
  const supabase = await createClient();

  const { data: signatory, error } = await supabase
    .from("signatories")
    .update({
      name: input.name,
      title: input.title || null,
      signature_path: input.signaturePath ?? undefined,
    })
    .eq("id", input.id)
    .eq("org_id", input.orgId)
    .select()
    .single();

  if (error || !signatory) {
    throw new Error(`Failed to update signatory: ${error?.message || "Unknown error"}`);
  }

  await audit(input.orgId, "signatory.update", "signatory", signatory.id, {
    name: signatory.name,
    title: signatory.title,
  });

  revalidatePath("/app/settings");
  return { success: true, signatory: signatory as SignatoryItem };
}

/**
 * Deletes a signatory.
 * Requires role: 'owner' or 'admin'.
 */
export async function deleteSignatoryAction(orgId: string, signatoryId: string) {
  await requireRole(orgId, ["owner", "admin"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("signatories")
    .delete()
    .eq("id", signatoryId)
    .eq("org_id", orgId);

  if (error) {
    throw new Error(`Failed to delete signatory: ${error.message}`);
  }

  await audit(orgId, "signatory.delete", "signatory", signatoryId);

  revalidatePath("/app/settings");
  return { success: true };
}

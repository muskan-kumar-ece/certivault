"use server";

import { requireUser, audit } from "@/server/auth";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/server/admin";
import { applyCreditDelta } from "@/server/payments";
import { createOrgSchema, CreateOrgInput } from "@/lib/schemas/org";
import { revalidatePath } from "next/cache";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base || "org"}-${randomSuffix}`;
}

/**
 * Server action to create a new organization.
 * The creator is automatically assigned as the 'owner'.
 */
export async function createOrganizationAction(rawInput: CreateOrgInput) {
  // 1. Authorize: User must be signed in
  const user = await requireUser();

  // 2. Validate input
  const input = createOrgSchema.parse(rawInput);
  const slug = slugify(input.name);

  const supabase = await createClient();

  // 3. Act: Insert organization
  const { data: org, error: orgError } = await supabase
    .from("orgs")
    .insert({
      name: input.name,
      slug,
      kind: input.kind,
      brand_color: input.brandColor,
      credit_balance: 0,
    })
    .select()
    .single();

  if (orgError || !org) {
    throw new Error(`Failed to create organization: ${orgError?.message || "Unknown error"}`);
  }

  // 4. Act: Assign creator as 'owner'
  const { error: memberError } = await supabase.from("org_members").insert({
    org_id: org.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) {
    // Fallback via admin client if initial RLS policy requires it
    const admin = adminClient();
    await admin.from("org_members").insert({
      org_id: org.id,
      user_id: user.id,
      role: "owner",
    });
  }

  // 5. Grant initial 50 free credits via apply_credit_delta (PRD §10, TRD §3)
  await applyCreditDelta(org.id, 50, "grant_free", "org", org.id);

  // 6. Audit: Log the organization creation
  await audit(org.id, "org.create", "org", org.id, {
    name: org.name,
    kind: org.kind,
    slug: org.slug,
  });

  revalidatePath("/app");
  return { success: true, org };
}

export interface UserOrgItem {
  role: string;
  org: {
    id: string;
    name: string;
    slug: string;
    kind: string;
    logo_path?: string | null;
    brand_color?: string | null;
    credit_balance: number;
    verified: boolean;
    plan: string;
  };
}

/**
 * Returns all organizations the current authenticated user belongs to.
 */
export async function getUserOrganizationsAction(): Promise<UserOrgItem[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("org_members")
    .select(`
      role,
      org:orgs (
        id,
        name,
        slug,
        kind,
        logo_path,
        brand_color,
        credit_balance,
        verified,
        plan
      )
    `)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to load organizations: ${error.message}`);
  }

  return ((data as unknown) as { role: string; org: UserOrgItem["org"] }[]) || [];
}

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/server/admin";

export type OrgRole = "owner" | "admin" | "issuer" | "viewer";

/**
 * Requires an authenticated user session.
 * Throws an unauthorized error if no valid session is present.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized: Please sign in to perform this action.");
  }

  return user;
}

/**
 * Verifies that the authenticated user possesses an allowed role in the specified organization.
 * Enforces server authority (never trust client-supplied roles or org IDs).
 */
export async function requireRole(orgId: string, allowedRoles: OrgRole[]) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: member, error } = await supabase
    .from("org_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (error || !member || !allowedRoles.includes(member.role as OrgRole)) {
    throw new Error("Forbidden: You do not have permission for this organization.");
  }

  return { user, role: member.role as OrgRole };
}

/**
 * Records an immutable audit log entry using the service role admin client.
 */
export async function audit(
  orgId: string | null,
  action: string,
  entityType?: string,
  entityId?: string,
  meta: Record<string, unknown> = {}
) {
  const user = await requireUser();
  const admin = adminClient();

  await admin.from("audit_logs").insert({
    org_id: orgId,
    actor_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    meta,
  });
}

/**
 * Checks whether a user is a platform administrator.
 */
export async function isPlatformAdmin(userId?: string): Promise<boolean> {
  const admin = adminClient();
  let id = userId;
  if (!id) {
    try {
      const user = await requireUser();
      id = user.id;
    } catch {
      return false;
    }
  }

  const { data, error } = await admin
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", id)
    .single();

  return !error && !!data;
}

/**
 * Requires the authenticated user to be a platform administrator.
 * Throws a forbidden error if the user is not in the platform_admins table.
 */
export async function requirePlatformAdmin() {
  const user = await requireUser();
  const isAdmin = await isPlatformAdmin(user.id);

  if (!isAdmin) {
    throw new Error("Forbidden: Platform administrator access required.");
  }

  return user;
}

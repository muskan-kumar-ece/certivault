"use server";

import crypto from "crypto";
import { requireUser, requireRole, audit } from "@/server/auth";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/server/admin";
import { sendEmail } from "@/server/email";
import { colors } from "@/lib/tokens";
import {
  inviteMemberSchema,
  updateMemberRoleSchema,
  removeMemberSchema,
  InviteMemberInput,
  UpdateMemberRoleInput,
  RemoveMemberInput,
  OrgRole,
} from "@/lib/schemas/team";
import { revalidatePath } from "next/cache";

export interface TeamMemberItem {
  user_id: string;
  email: string;
  role: OrgRole;
  created_at: string;
}

export interface InvitationItem {
  id: string;
  email: string;
  role: OrgRole;
  expires_at: string;
  created_at: string;
}

/**
 * Lists all team members and pending invitations for an organization.
 */
export async function listTeamMembersAction(orgId: string): Promise<{
  members: TeamMemberItem[];
  invitations: InvitationItem[];
}> {
  await requireRole(orgId, ["owner", "admin", "issuer", "viewer"]);
  const supabase = await createClient();
  const admin = adminClient();

  // 1. Fetch member rows
  const { data: memberRows, error: memberError } = await supabase
    .from("org_members")
    .select("user_id, role, created_at")
    .eq("org_id", orgId);

  if (memberError) {
    throw new Error(`Failed to list members: ${memberError.message}`);
  }

  // 2. Fetch user emails via admin client (auth.users cannot be joined directly across schemas in standard client)
  const userIds = memberRows.map((m) => m.user_id);
  const emailMap = new Map<string, string>();

  if (userIds.length > 0) {
    const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
      perPage: 100,
    });
    if (!usersError && usersData?.users) {
      for (const u of usersData.users) {
        if (u.email) {
          emailMap.set(u.id, u.email);
        }
      }
    }
  }

  const members: TeamMemberItem[] = memberRows.map((m) => ({
    user_id: m.user_id,
    email: emailMap.get(m.user_id) || "teammate@organization",
    role: m.role as OrgRole,
    created_at: m.created_at,
  }));

  // 3. Fetch pending, unexpired invitations
  const now = new Date().toISOString();
  const { data: inviteRows, error: inviteError } = await supabase
    .from("invitations")
    .select("id, email, role, expires_at, created_at")
    .eq("org_id", orgId)
    .is("accepted_at", null)
    .gt("expires_at", now)
    .order("created_at", { ascending: false });

  if (inviteError) {
    throw new Error(`Failed to list invitations: ${inviteError.message}`);
  }

  const invitations: InvitationItem[] = (inviteRows || []).map((inv) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role as OrgRole,
    expires_at: inv.expires_at,
    created_at: inv.created_at,
  }));

  return { members, invitations };
}

/**
 * Invites a new team member by email.
 * Requires role: 'owner' or 'admin'.
 */
export async function inviteMemberAction(rawInput: InviteMemberInput) {
  const input = inviteMemberSchema.parse(rawInput);
  await requireRole(input.orgId, ["owner", "admin"]);
  const supabase = await createClient();

  // 1. Check if user is already a member
  const { data: existingMembers } = await supabase
    .from("org_members")
    .select("user_id")
    .eq("org_id", input.orgId);

  const existingMemberIds = new Set((existingMembers || []).map((m) => m.user_id));
  const admin = adminClient();
  const { data: userData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const matchingUser = userData?.users.find((u) => u.email?.toLowerCase() === input.email);

  if (matchingUser && existingMemberIds.has(matchingUser.id)) {
    throw new Error(`${input.email} is already a member of this organization.`);
  }

  // 2. Generate a crypto-secure 32-byte token and hash it with sha256
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  // 3. Insert into invitations
  const { data: invitation, error } = await supabase
    .from("invitations")
    .insert({
      org_id: input.orgId,
      email: input.email,
      role: input.role,
      token_hash: tokenHash,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error || !invitation) {
    throw new Error(`Failed to create invitation: ${error?.message || "Unknown error"}`);
  }

  // 4. Fetch org details for the invitation email
  const { data: org } = await supabase
    .from("orgs")
    .select("name")
    .eq("id", input.orgId)
    .single();

  const orgName = org?.name || "CertiVault Organization";
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://certivault.venopai.in"}/invite/${rawToken}`;

  // 5. Send invitation email via sendEmail interface
  try {
    await sendEmail({
      to: input.email,
      subject: `Invitation to join ${orgName} on CertiVault`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: ${colors.ink.primary.light}; margin-bottom: 12px;">You've been invited to join ${orgName}</h2>
          <p style="color: ${colors.ink.secondary.light}; line-height: 1.5; margin-bottom: 24px;">
            You have been granted <strong>${input.role}</strong> access on CertiVault to collaborate on issuing and verifying certificates.
          </p>
          <a href="${inviteUrl}" style="background-color: ${colors.accent.ultramarine.light}; color: ${colors.surface.light}; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
            Accept Invitation
          </a>
          <p style="color: ${colors.ink.secondary.light}; font-size: 12px; margin-top: 32px;">
            This invitation will expire in 7 days. If you did not expect this invitation, you can ignore this email.
          </p>
        </div>
      `,
      text: `You have been invited to join ${orgName} as ${input.role}. Accept your invitation here: ${inviteUrl}`,
    });
  } catch (emailErr) {
    console.warn("Failed to dispatch invitation email via provider:", emailErr);
  }

  // 6. Audit: Log the dispatched invitation
  await audit(input.orgId, "team.invite", "invitation", invitation.id, {
    email: input.email,
    role: input.role,
  });

  revalidatePath("/app/team");
  return { success: true, invitationId: invitation.id };
}

/**
 * Accepts an invitation using a raw invitation token.
 */
export async function acceptInvitationAction(rawToken: string) {
  const user = await requireUser();
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const admin = adminClient();

  // 1. Locate valid, unexpired, unaccepted invitation
  const now = new Date().toISOString();
  const { data: invitation, error: findError } = await admin
    .from("invitations")
    .select("*")
    .eq("token_hash", tokenHash)
    .is("accepted_at", null)
    .gt("expires_at", now)
    .single();

  if (findError || !invitation) {
    throw new Error("This invitation is invalid or has expired.");
  }

  // Optional: check email match if user email is present
  if (user.email && user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new Error(
      `This invitation was sent to ${invitation.email}. You are currently signed in as ${user.email}.`
    );
  }

  // 2. Add or update member row in org_members
  const { error: memberError } = await admin.from("org_members").upsert(
    {
      org_id: invitation.org_id,
      user_id: user.id,
      role: invitation.role,
    },
    { onConflict: "org_id,user_id" }
  );

  if (memberError) {
    throw new Error(`Failed to join organization: ${memberError.message}`);
  }

  // 3. Mark invitation as accepted
  await admin
    .from("invitations")
    .update({ accepted_at: now })
    .eq("id", invitation.id);

  // 4. Audit acceptance
  await audit(invitation.org_id, "team.accept_invite", "invitation", invitation.id, {
    email: invitation.email,
    role: invitation.role,
    user_id: user.id,
  });

  revalidatePath("/app");
  return { success: true, orgId: invitation.org_id };
}

/**
 * Updates an existing team member's role.
 * Enforces sole-owner protection: cannot demote the only owner.
 * Requires role: 'owner' or 'admin'.
 */
export async function updateMemberRoleAction(rawInput: UpdateMemberRoleInput) {
  const input = updateMemberRoleSchema.parse(rawInput);
  await requireRole(input.orgId, ["owner", "admin"]);
  const supabase = await createClient();

  // 1. Check current role of target member
  const { data: targetMember, error: targetError } = await supabase
    .from("org_members")
    .select("role")
    .eq("org_id", input.orgId)
    .eq("user_id", input.userId)
    .single();

  if (targetError || !targetMember) {
    throw new Error("Member not found in this organization.");
  }

  // 2. Sole-owner demotion protection:
  // If target member is currently owner and being changed to another role,
  // verify there is at least one other owner.
  if (targetMember.role === "owner") {
    const { count, error: countError } = await supabase
      .from("org_members")
      .select("user_id", { count: "exact", head: true })
      .eq("org_id", input.orgId)
      .eq("role", "owner");

    if (countError || (count !== null && count <= 1)) {
      throw new Error("Cannot demote the organization's sole owner. Transfer ownership first.");
    }
  }

  // 3. Update the member's role
  const { error: updateError } = await supabase
    .from("org_members")
    .update({ role: input.role })
    .eq("org_id", input.orgId)
    .eq("user_id", input.userId);

  if (updateError) {
    throw new Error(`Failed to update role: ${updateError.message}`);
  }

  // 4. Audit role change
  await audit(input.orgId, "team.role_change", "org_member", input.userId, {
    old_role: targetMember.role,
    new_role: input.role,
  });

  revalidatePath("/app/team");
  return { success: true };
}

/**
 * Removes a member from the organization.
 * Enforces sole-owner protection: cannot remove the only owner.
 * Requires role: 'owner' or 'admin'.
 */
export async function removeMemberAction(rawInput: RemoveMemberInput) {
  const input = removeMemberSchema.parse(rawInput);
  await requireRole(input.orgId, ["owner", "admin"]);
  const supabase = await createClient();

  // 1. Check current role of target member
  const { data: targetMember, error: targetError } = await supabase
    .from("org_members")
    .select("role")
    .eq("org_id", input.orgId)
    .eq("user_id", input.userId)
    .single();

  if (targetError || !targetMember) {
    throw new Error("Member not found in this organization.");
  }

  // 2. Sole-owner removal protection
  if (targetMember.role === "owner") {
    const { count, error: countError } = await supabase
      .from("org_members")
      .select("user_id", { count: "exact", head: true })
      .eq("org_id", input.orgId)
      .eq("role", "owner");

    if (countError || (count !== null && count <= 1)) {
      throw new Error("Cannot remove the organization's sole owner.");
    }
  }

  // 3. Delete the member
  const { error: deleteError } = await supabase
    .from("org_members")
    .delete()
    .eq("org_id", input.orgId)
    .eq("user_id", input.userId);

  if (deleteError) {
    throw new Error(`Failed to remove member: ${deleteError.message}`);
  }

  // 4. Audit member removal
  await audit(input.orgId, "team.remove_member", "org_member", input.userId, {
    removed_role: targetMember.role,
  });

  revalidatePath("/app/team");
  return { success: true };
}

import { z } from "zod";

export const memberRoleEnum = z.enum(["admin", "issuer", "viewer"]);
export type AssignableRole = z.infer<typeof memberRoleEnum>;

export const allRolesEnum = z.enum(["owner", "admin", "issuer", "viewer"]);
export type OrgRole = z.infer<typeof allRolesEnum>;

export const inviteMemberSchema = z.object({
  orgId: z.string().uuid("Invalid organization ID"),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  role: memberRoleEnum,
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const updateMemberRoleSchema = z.object({
  orgId: z.string().uuid("Invalid organization ID"),
  userId: z.string().uuid("Invalid user ID"),
  role: memberRoleEnum,
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

export const removeMemberSchema = z.object({
  orgId: z.string().uuid("Invalid organization ID"),
  userId: z.string().uuid("Invalid user ID"),
});

export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;

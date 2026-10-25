"use client";

import React, { useState } from "react";
import { LargeTitleHeader } from "@/components/ui/large-title-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ListRow } from "@/components/ui/list-row";
import { useToast } from "@/components/ui/toast";
import {
  inviteMemberAction,
  updateMemberRoleAction,
  removeMemberAction,
  TeamMemberItem,
  InvitationItem,
} from "@/features/team/actions";
import { AssignableRole, OrgRole } from "@/lib/schemas/team";
import { UserPlus, Users, Trash2, Mail } from "lucide-react";

interface TeamClientViewProps {
  orgId: string;
  initialMembers: TeamMemberItem[];
  initialInvitations: InvitationItem[];
  userRole: string;
}

export function TeamClientView({
  orgId,
  initialMembers,
  initialInvitations,
  userRole,
}: TeamClientViewProps) {
  const { showToast } = useToast();
  const isPrivileged = userRole === "owner" || userRole === "admin";

  const [members, setMembers] = useState<TeamMemberItem[]>(initialMembers);
  const [invitations, setInvitations] = useState<InvitationItem[]>(initialInvitations);

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AssignableRole>("issuer");
  const [inviting, setInviting] = useState(false);

  // Handle Invite
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !isPrivileged) return;

    setInviting(true);
    try {
      await inviteMemberAction({
        orgId,
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
      });

      // Optimistic invitation addition
      const optimisticInvite: InvitationItem = {
        id: Math.random().toString(),
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      };

      setInvitations((prev) => [optimisticInvite, ...prev]);
      setInviteEmail("");
      setIsInviteOpen(false);

      showToast({
        title: "Invitation Dispatched",
        description: `Sent invitation link to ${inviteEmail}.`,
        variant: "success",
      });
    } catch (err: unknown) {
      showToast({
        title: "Invitation Failed",
        description: err instanceof Error ? err.message : "Error sending invitation.",
        variant: "error",
      });
    } finally {
      setInviting(false);
    }
  };

  // Handle Role Change
  const handleRoleChange = async (userId: string, newRole: AssignableRole) => {
    if (!isPrivileged) return;

    try {
      await updateMemberRoleAction({
        orgId,
        userId,
        role: newRole,
      });

      setMembers((prev) =>
        prev.map((m) => (m.user_id === userId ? { ...m, role: newRole } : m))
      );

      showToast({
        title: "Role Updated",
        description: `Member permission changed to ${newRole}.`,
        variant: "success",
      });
    } catch (err: unknown) {
      showToast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : "Could not update member role.",
        variant: "error",
      });
    }
  };

  // Handle Remove Member
  const handleRemoveMember = async (userId: string, email: string) => {
    if (!isPrivileged) return;

    try {
      await removeMemberAction({
        orgId,
        userId,
      });

      setMembers((prev) => prev.filter((m) => m.user_id !== userId));

      showToast({
        title: "Member Removed",
        description: `${email} has been removed from the organization.`,
        variant: "success",
      });
    } catch (err: unknown) {
      showToast({
        title: "Removal Blocked",
        description: err instanceof Error ? err.message : "Could not remove member.",
        variant: "error",
      });
    }
  };

  const getRoleBadgeVariant = (role: OrgRole) => {
    switch (role) {
      case "owner":
        return "accent";
      case "admin":
        return "verified";
      case "issuer":
        return "neutral";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <LargeTitleHeader
          title="Team & Roles"
          subtitle="Manage workspace members, role-based access, and invitations."
        />

        {isPrivileged && (
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button variant="primary" size="md" leftIcon={<UserPlus className="w-4 h-4" />}>
                Invite Teammate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a Teammate</DialogTitle>
                <DialogDescription>
                  Send an email invitation link with customized role permissions.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleInvite} className="space-y-4 mt-2">
                <Field
                  label="Email Address"
                  type="email"
                  required
                  placeholder="colleague@college.edu"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />

                <Select
                  label="Role Permission"
                  value={inviteRole}
                  onValueChange={(val) => setInviteRole(val as AssignableRole)}
                  options={[
                    {
                      value: "admin",
                      label: "Admin — Full management, team invites, and settings",
                    },
                    {
                      value: "issuer",
                      label: "Issuer — Issue certificates, edit templates, and export",
                    },
                    {
                      value: "viewer",
                      label: "Viewer — View-only access to registry and certificates",
                    },
                  ]}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsInviteOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={inviting}
                    disabled={!inviteEmail.trim()}
                  >
                    Send Invitation
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* 1. Active Members */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Active Members ({members.length})</h2>
        </div>

        <div className="overflow-hidden rounded-control border border-hairline bg-surface">
          {members.map((member) => (
            <ListRow
              key={member.user_id}
              title={member.email}
              subtitle={`Member since ${new Date(member.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}`}
              leftIcon={<Users className="w-4 h-4 text-ink-secondary" />}
              trailing={
                <div className="flex items-center gap-3">
                  {isPrivileged && member.role !== "owner" ? (
                    <div className="w-32">
                      <Select
                        value={member.role}
                        onValueChange={(val) =>
                          handleRoleChange(member.user_id, val as AssignableRole)
                        }
                        options={[
                          { value: "admin", label: "Admin" },
                          { value: "issuer", label: "Issuer" },
                          { value: "viewer", label: "Viewer" },
                        ]}
                      />
                    </div>
                  ) : (
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {member.role.toUpperCase()}
                    </Badge>
                  )}

                  {isPrivileged && member.role !== "owner" && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.user_id, member.email)}
                      className="rounded-control p-2 text-ink-secondary hover:text-danger press-feedback"
                      aria-label={`Remove ${member.email}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              }
            />
          ))}
        </div>
      </section>

      {/* 2. Pending Invitations */}
      {invitations.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-ink">Pending Invitations ({invitations.length})</h2>
          <div className="overflow-hidden rounded-control border border-hairline bg-surface">
            {invitations.map((inv) => (
              <ListRow
                key={inv.id}
                title={inv.email}
                subtitle={`Invited as ${inv.role} · Expires in 7 days`}
                leftIcon={<Mail className="w-4 h-4 text-accent" />}
                trailing={
                  <Badge variant="neutral">Pending Acceptance</Badge>
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

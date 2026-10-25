import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/server/admin";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { InviteAcceptClient } from "./accept-client";
import { ShieldCheck } from "lucide-react";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const admin = adminClient();

  // Find invitation
  const { data: invitation, error } = await admin
    .from("invitations")
    .select("id, org_id, email, role, expires_at, accepted_at")
    .eq("token_hash", tokenHash)
    .single();

  if (error || !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
        <div className="w-full max-w-md rounded-card border border-hairline bg-surface p-8 text-center space-y-4">
          <h1 className="text-xl font-bold text-ink">Invalid Invitation</h1>
          <p className="text-sm text-ink-secondary">
            This invitation link is invalid or does not exist.
          </p>
        </div>
      </div>
    );
  }

  if (invitation.accepted_at) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
        <div className="w-full max-w-md rounded-card border border-hairline bg-surface p-8 text-center space-y-4">
          <h1 className="text-xl font-bold text-ink">Already Accepted</h1>
          <p className="text-sm text-ink-secondary">
            This invitation has already been accepted.
          </p>
          <a
            href="/app"
            className="inline-block rounded-control bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
        <div className="w-full max-w-md rounded-card border border-hairline bg-surface p-8 text-center space-y-4">
          <h1 className="text-xl font-bold text-ink">Invitation Expired</h1>
          <p className="text-sm text-ink-secondary">
            This invitation expired on {new Date(invitation.expires_at).toLocaleDateString()}. Please request a new invite.
          </p>
        </div>
      </div>
    );
  }

  // Get Org name
  const { data: org } = await admin
    .from("orgs")
    .select("name, logo_path, brand_color")
    .eq("id", invitation.org_id)
    .single();

  // Check user session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login with return URL
    redirect(`/login?next=/invite/${token}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-md space-y-6 rounded-card border border-hairline bg-surface p-8 shadow-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-ink">Join {org?.name || "Organization"}</h1>
          <p className="text-sm text-ink-secondary">
            You have been invited as a <span className="font-semibold text-ink uppercase">{invitation.role}</span>.
          </p>
        </div>

        <div className="rounded-control border border-hairline bg-canvas p-3 text-xs text-ink-secondary">
          Signed in as <span className="font-medium text-ink">{user.email}</span>
        </div>

        <InviteAcceptClient token={token} />
      </div>
    </main>
  );
}

import { listTeamMembersAction } from "@/features/team/actions";
import { getUserOrganizationsAction } from "@/features/org/actions";
import { TeamClientView } from "./team-client";
import { redirect } from "next/navigation";

export default async function TeamPage() {
  const orgs = await getUserOrganizationsAction();
  if (orgs.length === 0) {
    redirect("/onboarding");
  }

  const currentOrg = orgs[0].org;
  const userRole = orgs[0].role;
  const { members, invitations } = await listTeamMembersAction(currentOrg.id);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <TeamClientView
        orgId={currentOrg.id}
        initialMembers={members}
        initialInvitations={invitations}
        userRole={userRole}
      />
    </div>
  );
}

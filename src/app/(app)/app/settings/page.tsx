import { getOrgSettingsAction } from "@/features/settings/actions";
import { listSignatoriesAction } from "@/features/signatories/actions";
import { getUserOrganizationsAction } from "@/features/org/actions";
import { SettingsClientView } from "./settings-client";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const orgs = await getUserOrganizationsAction();
  if (orgs.length === 0) {
    redirect("/onboarding");
  }

  const currentOrg = orgs[0].org;
  const settings = await getOrgSettingsAction(currentOrg.id);
  const signatories = await listSignatoriesAction(currentOrg.id);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <SettingsClientView
        orgId={currentOrg.id}
        initialSettings={settings}
        initialSignatories={signatories}
        userRole={orgs[0].role}
      />
    </div>
  );
}

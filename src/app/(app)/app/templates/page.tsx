import { listTemplatesAction } from "@/features/templates/actions";
import { getUserOrganizationsAction } from "@/features/org/actions";
import { TemplatesClientView } from "./templates-client";
import { PRESET_TEMPLATES } from "@/server/presets";
import { redirect } from "next/navigation";

export default async function TemplatesPage() {
  const orgs = await getUserOrganizationsAction();
  if (orgs.length === 0) {
    redirect("/onboarding");
  }

  const currentOrg = orgs[0].org;
  const userRole = orgs[0].role;
  const templates = await listTemplatesAction(currentOrg.id, "all");

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <TemplatesClientView
        orgId={currentOrg.id}
        initialTemplates={templates}
        presets={PRESET_TEMPLATES}
        userRole={userRole}
      />
    </div>
  );
}

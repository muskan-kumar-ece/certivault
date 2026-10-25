import { getTemplateByIdAction } from "@/features/templates/actions";
import { getUserOrganizationsAction } from "@/features/org/actions";
import { TemplateEditorClientView } from "./editor-client";
import { redirect } from "next/navigation";

export default async function TemplateEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orgs = await getUserOrganizationsAction();
  if (orgs.length === 0) {
    redirect("/onboarding");
  }

  const currentOrg = orgs[0].org;
  const userRole = orgs[0].role;
  const template = await getTemplateByIdAction(id, currentOrg.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <TemplateEditorClientView
        orgId={currentOrg.id}
        template={template}
        userRole={userRole}
      />
    </div>
  );
}

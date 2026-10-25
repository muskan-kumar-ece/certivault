import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IssueWizardClient } from "./issue-wizard-client";

export const metadata: Metadata = {
  title: "Issue Certificates | CertiVault",
  description: "Issue tamper-proof certificates in bulk with instant QR verification.",
};

export default async function IssuePage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; batchId?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get active organization membership
  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role, orgs(id, name, credit_balance, brand_color, logo_path)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!member || !member.orgs) {
    redirect("/onboarding");
  }

  const org = member.orgs as unknown as {
    id: string;
    name: string;
    credit_balance: number;
    brand_color: string;
    logo_path?: string;
  };

  // Fetch available templates (org templates + platform presets)
  const { data: templates } = await supabase
    .from("templates")
    .select("id, name, page_size, description, field_keys, thumbnail_path, org_id, schema")
    .or(`org_id.eq.${org.id},org_id.is.null`)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  const resolvedParams = await searchParams;

  return (
    <IssueWizardClient
      org={org}
      userRole={member.role}
      templates={templates || []}
      initialStep={resolvedParams.step ? parseInt(resolvedParams.step, 10) : 1}
      initialBatchId={resolvedParams.batchId}
    />
  );
}

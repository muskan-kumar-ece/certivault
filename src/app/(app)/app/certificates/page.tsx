import { redirect } from "next/navigation";
import { getUserOrganizationsAction } from "@/features/org/actions";
import { createClient } from "@/lib/supabase/server";
import { getExportsListAction } from "@/features/certificates/actions";
import { CertificatesClientView } from "./certificates-client";

export default async function CertificatesPage() {
  const orgs = await getUserOrganizationsAction();
  if (orgs.length === 0) {
    redirect("/onboarding");
  }

  const currentOrg = orgs[0].org;
  const userRole = orgs[0].role;
  const supabase = await createClient();

  // Fetch batches for this org
  const { data: batches } = await supabase
    .from("batches")
    .select(`
      id,
      name,
      status,
      total,
      generated,
      failed,
      delivered,
      delivery_mode,
      created_at,
      completed_at,
      template_id,
      templates (
        name
      )
    `)
    .eq("org_id", currentOrg.id)
    .order("created_at", { ascending: false });

  // Fetch initial certificates for this org
  const { data: certificates } = await supabase
    .from("certificates")
    .select(`
      id,
      public_id,
      recipient_name,
      recipient_email,
      status,
      email_status,
      issued_at,
      created_at,
      batch_id,
      data,
      batches (
        name
      )
    `)
    .eq("org_id", currentOrg.id)
    .order("created_at", { ascending: false })
    .limit(100);

  // Fetch exports history
  let exportsList: Array<{
    id: string;
    kind: string;
    status: string;
    parts: Array<{ path: string; sizeBytes: number; certificateCount: number; downloadUrl?: string }>;
    expires_at: string;
    created_at: string;
  }> = [];

  try {
    exportsList = (await getExportsListAction(currentOrg.id)) as typeof exportsList;
  } catch {
    // Graceful fallback if no exports
  }

  // Normalize joined relations from PostgREST array inference
  const normalizedBatches = (batches || []).map((b) => ({
    ...b,
    templates: Array.isArray(b.templates) ? b.templates[0] : b.templates,
  }));

  const normalizedCertificates = (certificates || []).map((c) => ({
    ...c,
    batches: Array.isArray(c.batches) ? c.batches[0] : c.batches,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <CertificatesClientView
        orgId={currentOrg.id}
        userRole={userRole}
        initialBatches={normalizedBatches}
        initialCertificates={normalizedCertificates}
        initialExports={exportsList}
      />
    </div>
  );
}

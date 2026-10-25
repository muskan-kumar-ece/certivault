import { notFound, redirect } from "next/navigation";
import { getUserOrganizationsAction } from "@/features/org/actions";
import { createClient } from "@/lib/supabase/server";
import { BatchDetailClientView } from "./batch-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BatchDetailPage({ params }: PageProps) {
  const { id: batchId } = await params;

  const orgs = await getUserOrganizationsAction();
  if (orgs.length === 0) {
    redirect("/onboarding");
  }

  const currentOrg = orgs[0].org;
  const userRole = orgs[0].role;
  const supabase = await createClient();

  // Fetch batch
  const { data: batch, error: batchErr } = await supabase
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
      email_subject,
      created_at,
      completed_at,
      template_id,
      templates (
        name
      )
    `)
    .eq("id", batchId)
    .eq("org_id", currentOrg.id)
    .single();

  if (batchErr || !batch) {
    notFound();
  }

  // Fetch certificates in this batch
  const { data: certificates } = await supabase
    .from("certificates")
    .select(`
      id,
      public_id,
      recipient_name,
      recipient_email,
      status,
      email_status,
      error,
      issued_at,
      created_at,
      download_count,
      verify_count
    `)
    .eq("batch_id", batchId)
    .order("created_at", { ascending: true });

  const normalizedBatch = {
    ...batch,
    templates: Array.isArray(batch.templates) ? batch.templates[0] : batch.templates,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <BatchDetailClientView
        orgId={currentOrg.id}
        userRole={userRole}
        batch={normalizedBatch}
        certificates={certificates || []}
      />
    </div>
  );
}

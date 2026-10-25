import { notFound, redirect } from "next/navigation";
import { getUserOrganizationsAction } from "@/features/org/actions";
import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/server/storage";
import { CertificateDetailClientView } from "./certificate-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CertificateDetailPage({ params }: PageProps) {
  const { id: certId } = await params;

  const orgs = await getUserOrganizationsAction();
  if (orgs.length === 0) {
    redirect("/onboarding");
  }

  const currentOrg = orgs[0].org;
  const userRole = orgs[0].role;
  const supabase = await createClient();

  // Fetch certificate with batch and template
  const { data: cert, error: certErr } = await supabase
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
      revoked_at,
      revoked_reason,
      show_revoked_reason,
      download_count,
      verify_count,
      pdf_path,
      pdf_sha256,
      data,
      archived_pdfs,
      created_at,
      batch_id,
      template_id,
      batches (
        name
      ),
      templates (
        name,
        page_size
      )
    `)
    .eq("id", certId)
    .eq("org_id", currentOrg.id)
    .single();

  if (certErr || !cert) {
    notFound();
  }

  // Generate a temporary signed URL for preview if PDF exists
  let previewPdfUrl: string | null = null;
  if (cert.pdf_path) {
    try {
      previewPdfUrl = await getSignedUrl("certificates", cert.pdf_path, 3600);
    } catch {
      // Fallback
    }
  }

  const normalizedCert = {
    ...cert,
    batches: Array.isArray(cert.batches) ? cert.batches[0] : cert.batches,
    templates: Array.isArray(cert.templates) ? cert.templates[0] : cert.templates,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <CertificateDetailClientView
        orgId={currentOrg.id}
        userRole={userRole}
        certificate={normalizedCert}
        previewPdfUrl={previewPdfUrl}
      />
    </div>
  );
}

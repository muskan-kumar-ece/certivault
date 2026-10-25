import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — CertiVault",
  description: "CertiVault privacy commitment, data security standards, and DPDP Act compliance.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-canvas text-ink py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink transition-colors mb-6 press-feedback"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-ink-secondary mt-2">Effective Date: October 25, 2026 · DPDP Act 2023 Aligned</p>
        </div>

        <section className="space-y-4 text-sm text-ink-secondary leading-relaxed bg-surface p-6 sm:p-8 rounded-card border border-hairline">
          <h2 className="text-base font-semibold text-ink">1. Data Minimization & Recipient Privacy</h2>
          <p>
            CertiVault adheres to strict data privacy principles. We treat recipient information with utmost care. Recipient email addresses uploaded in CSV manifests are utilized solely to dispatch the generated certificate link. Recipient emails are NEVER indexed, sold, marketed to, or exposed on public verification endpoints.
          </p>

          <h2 className="text-base font-semibold text-ink pt-4">2. Public Verification Data</h2>
          <p>
            When a credential is authenticated at <code>/c/[publicId]</code> or via QR code, only public credential metadata is displayed: the recipient&apos;s name as printed on the certificate, issuing organization, title, issuance date, and SHA-256 document fingerprint. No private internal IDs, passwords, or contact details are ever surfaced.
          </p>

          <h2 className="text-base font-semibold text-ink pt-4">3. Data Residency & Infrastructure</h2>
          <p>
            CertiVault hosts all primary database instances, cryptographic keys, and encrypted storage buckets strictly within the AWS Asia Pacific (Mumbai) region (<code>ap-south-1</code>) and edge compute nodes in Mumbai (<code>bom1</code>). All data in transit is protected using TLS 1.3, and data at rest is encrypted with AES-256.
          </p>

          <h2 className="text-base font-semibold text-ink pt-4">4. Organization Data Retention</h2>
          <p>
            Organizations can configure custom data retention windows for recipient manifest records. Certificate PDF copies and verification records remain archived to guarantee permanent verification integrity for student alumni, unless explicitly revoked by the issuing institution.
          </p>

          <h2 className="text-base font-semibold text-ink pt-4">5. Contact & Grievance Redressal</h2>
          <p>
            In accordance with the Digital Personal Data Protection Act (DPDP Act 2023) and Information Technology Rules, our designated Grievance Officer can be contacted at <code>privacy@certivault.in</code>.
          </p>
        </section>
      </div>
    </main>
  );
}

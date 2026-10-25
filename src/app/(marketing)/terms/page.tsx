import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — CertiVault",
  description: "Terms and conditions governing the use of CertiVault certificate issuance and verification platform.",
};

export default function TermsPage() {
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
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-ink-secondary mt-2">Effective Date: October 25, 2026 · Version 1.0</p>
        </div>

        <section className="space-y-4 text-sm text-ink-secondary leading-relaxed bg-surface p-6 sm:p-8 rounded-card border border-hairline">
          <h2 className="text-base font-semibold text-ink">1. Acceptance of Terms</h2>
          <p>
            By accessing or using CertiVault (&ldquo;the Service&rdquo;), operated in India, you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of an educational institution, college department, university, student club, or legal entity, you represent and warrant that you possess the requisite authority to bind such entity.
          </p>

          <h2 className="text-base font-semibold text-ink pt-4">2. Description of Service</h2>
          <p>
            CertiVault provides cryptographic digital certificate generation, bulk issuance, immutable verification registries, and delivery pipelines. CertiVault does not confer or validate academic accreditation; organizations are solely responsible for the authenticity and truthfulness of credentials issued under their name.
          </p>

          <h2 className="text-base font-semibold text-ink pt-4">3. Credit System & Invoicing</h2>
          <p>
            CertiVault operates on a prepaid credit model where one credit entitles the issuer to generate and dispatch one verified credential. Credits do not expire during an active subscription or 12 months from pack purchase. All pricing is subject to prevailing Indian Goods and Services Tax (GST at 18%). Tax invoices are issued per the Indian Financial Year convention.
          </p>

          <h2 className="text-base font-semibold text-ink pt-4">4. Acceptable Use & Zero Impersonation</h2>
          <p>
            You agree never to issue fraudulent credentials, misrepresent institutional affiliations, or forge official college seals. Certificates reported as fraudulent, defamatory, or infringing will be placed in our review queue and may be revoked immediately. Continued abuse will lead to permanent organization suspension.
          </p>

          <h2 className="text-base font-semibold text-ink pt-4">5. Governing Law & Dispute Resolution</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or related to this Service shall be subject to the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra.
          </p>
        </section>
      </div>
    </main>
  );
}

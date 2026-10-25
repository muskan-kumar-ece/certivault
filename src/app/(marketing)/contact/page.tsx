import React from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, MapPin, Building2 } from "lucide-react";

export const metadata = {
  title: "Contact & Support — CertiVault",
  description: "Reach the CertiVault operations, technical support, and institutional sales team in Mumbai.",
};

export default function ContactPage() {
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
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Contact Us</h1>
          <p className="text-sm text-ink-secondary mt-2">We typically respond within 4 business hours.</p>
        </div>

        {/* Contact channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-card border border-hairline bg-surface space-y-3">
            <Mail className="w-6 h-6 text-accent" />
            <h3 className="text-base font-semibold text-ink">General & Support</h3>
            <p className="text-xs text-ink-secondary">
              For batch queries, credit assistance, and technical questions:
            </p>
            <a
              href="mailto:support@certivault.in"
              className="text-sm font-semibold text-accent hover:underline block"
            >
              support@certivault.in
            </a>
          </div>

          <div className="p-6 rounded-card border border-hairline bg-surface space-y-3">
            <Building2 className="w-6 h-6 text-verified" />
            <h3 className="text-base font-semibold text-ink">Colleges & Procurement</h3>
            <p className="text-xs text-ink-secondary">
              For institutional Campus pilots, GST POs, or custom university subdomains:
            </p>
            <a
              href="mailto:institutions@certivault.in"
              className="text-sm font-semibold text-accent hover:underline block"
            >
              institutions@certivault.in
            </a>
          </div>
        </div>

        <section className="space-y-4 text-sm text-ink-secondary leading-relaxed bg-surface p-6 sm:p-8 rounded-card border border-hairline">
          <h2 className="text-base font-semibold text-ink flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" />
            <span>Operations & Hosting Node</span>
          </h2>
          <p>
            CertiVault Technologies<br />
            Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051, India.<br />
            Primary Data Engine: AWS / Supabase ap-south-1 (Mumbai)<br />
            Edge Ingestion: Vercel bom1 (Mumbai)
          </p>

          <h2 className="text-base font-semibold text-ink pt-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent" />
            <span>Abuse or Unauthorized Credentials</span>
          </h2>
          <p>
            To report suspected fraudulent certificates or unauthorized use of college insignias, please use the &ldquo;Report Credential&rdquo; button on any public certificate verification page (<code>/c/[publicId]</code>) or email <code>trust@certivault.in</code>.
          </p>
        </section>
      </div>
    </main>
  );
}

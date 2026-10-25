import React from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, ArrowRight, Globe } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-hairline bg-surface text-ink-secondary">
      {/* Main Multi-Column Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand & System Status Column (Spans 2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 press-feedback">
              <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white font-black text-xs shadow-xs">
                CV
              </span>
              <span className="font-extrabold text-ink text-base tracking-tight">CertiVault</span>
            </Link>

            <p className="text-xs text-ink-secondary leading-relaxed max-w-sm">
              Cryptographic credential infrastructure engineered for India&apos;s universities, colleges, and hackathons. Issue tamper-evident certificates with sub-second QR verification.
            </p>

            {/* Live Infrastructure Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-canvas border border-hairline text-[11px] font-medium text-ink">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-verified opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-verified"></span>
              </span>
              <span>All Systems Operational</span>
              <span className="text-ink-secondary">· Mumbai (ap-south-1)</span>
            </div>

            <div className="pt-1">
              <p className="text-[11px] text-ink-secondary">
                100% Indian Data Residency · AES-256 Storage · SHA-256 Hashes
              </p>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Product</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/verify" className="hover:text-ink transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-verified" />
                  <span>Public QR Verifier</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-ink transition-colors">
                  Batch Issuance Engine
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-ink transition-colors">
                  Multi-lingual Templates
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-ink transition-colors">
                  Crockford Base32 IDs
                </Link>
              </li>
              <li>
                <Link href="/dev/ui" className="hover:text-ink transition-colors text-ink-secondary/80">
                  UI Component Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Pricing & Billing Column */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Plans & Billing</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/pricing" className="hover:text-ink transition-colors font-medium text-ink flex items-center gap-1">
                  <span>Transparent Pricing</span>
                  <ArrowRight className="w-3 h-3 text-accent" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-ink transition-colors">
                  Starter Pack (Free 50 Credits)
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-ink transition-colors">
                  Event Pack (₹999 / 500 certs)
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-ink transition-colors">
                  Club Pack (₹2,999 / 2,000 certs)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-ink transition-colors">
                  Campus Institutional PO / NEFT
                </Link>
              </li>
              <li>
                <span className="text-[11px] text-ink-secondary">
                  18% GST Compliant Invoices
                </span>
              </li>
            </ul>
          </div>

          {/* Compliance & Legal Column */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Trust & Legal</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/terms" className="hover:text-ink transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-ink transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-ink transition-colors">
                  Cancellation & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-ink transition-colors">
                  Contact & Grievance Redressal
                </Link>
              </li>
              <li>
                <div className="flex items-center gap-1.5 text-[11px] text-verified pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Free Recruiter Verification</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sub-Footer / Bottom Bar */}
      <div className="border-t border-hairline bg-canvas/60 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-ink-secondary">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <p>© {new Date().getFullYear()} CertiVault Technologies Private Limited. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface border border-hairline font-medium text-ink">
              <Globe className="w-3 h-3 text-accent" />
              <span>India · INR (₹)</span>
            </span>
            <span>Razorpay 18% GST Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

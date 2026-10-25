import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  FileSpreadsheet,
  QrCode,
  Lock,
  ArrowRight,
  Award,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveCertificateDemo } from "@/components/marketing/live-demo";

export const metadata = {
  title: "CertiVault — Issue 1,000 Verified Certificates in 5 Minutes",
  description:
    "The modern certificate issuance and instant QR verification engine for Indian universities, colleges, and student organizations.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-accent/15">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-surface/80 border-b border-hairline px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-ink press-feedback">
            <span className="w-8 h-8 rounded-control bg-accent flex items-center justify-center text-white font-black text-sm shadow-sm">
              CV
            </span>
            <span className="tracking-tight">CertiVault</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-ink-secondary">
            <Link href="#demo" className="hover:text-ink transition-colors">
              Interactive Demo
            </Link>
            <Link href="#features" className="hover:text-ink transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-ink transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="hover:text-ink transition-colors">
              FAQ
            </Link>
            <Link
              href="/verify"
              className="inline-flex items-center gap-1.5 text-accent hover:underline font-semibold"
            >
              <QrCode className="w-3.5 h-3.5" />
              Verify Certificate
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link href="/login">
              <Button variant="secondary" size="sm" className="text-xs">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="primary" size="sm" className="text-xs">
                Start Free (50 Certs)
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-hairline text-ink-secondary text-xs font-medium shadow-xs">
          <span className="w-2 h-2 rounded-full bg-verified animate-pulse" />
          <span>Hosted in Mumbai (AWS & Edge) · Zero Recipient PII Leaks</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-ink max-w-4xl mx-auto leading-[1.12]">
          Issue 1,000 verified certificates in 5 minutes.
        </h1>

        <p className="text-base sm:text-xl text-ink-secondary max-w-2xl mx-auto font-normal leading-relaxed">
          No Canva copy-pasting. No fake certificates. Import any CSV or Excel sheet, preview live vector layouts, and deliver permanent QR-authenticated credentials in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" className="w-full sm:w-auto px-7 text-sm font-semibold shadow-md">
              Start Free (50 Complimentary Credits)
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/verify" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto px-6 text-sm font-medium">
              <QrCode className="w-4 h-4 mr-2 text-accent" />
              Scan / Verify a Credential
            </Button>
          </Link>
        </div>

        {/* Trust metrics */}
        <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-hairline text-left">
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-ink tabular-nums">40 ms</p>
            <p className="text-xs text-ink-secondary">PDF render latency</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-ink tabular-nums">&lt; 5 sec</p>
            <p className="text-xs text-ink-secondary">Public verification</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-ink tabular-nums">18% GST</p>
            <p className="text-xs text-ink-secondary">Automated FY tax invoices</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-ink tabular-nums">100% Free</p>
            <p className="text-xs text-ink-secondary">Verification for recruiters</p>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo */}
      <section id="demo" className="py-16 px-4 sm:px-6 lg:px-8 bg-surface/50 border-y border-hairline text-center">
        <div className="max-w-4xl mx-auto mb-10 space-y-2">
          <Badge variant="verified">Try It Live</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink">
            Experience the Vector PDF Engine
          </h2>
          <p className="text-sm text-ink-secondary max-w-xl mx-auto">
            Test how CertiVault combines dynamic recipient metadata, fonts (Latin, Devanagari, Telugu), and vector QR codes in real-time.
          </p>
        </div>

        <LiveCertificateDemo />
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink">
            Engineered for Student Clubs & Institutional Trust
          </h2>
          <p className="text-sm text-ink-secondary">
            Everything your hackathon, fest, or college exam cell needs to eliminate manual workflows and stop credential fraud.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-card border border-hairline bg-surface space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-control bg-accent/10 flex items-center justify-center text-accent">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-ink">Frictionless CSV & Excel Import</h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Client-side spreadsheet parsing with fuzzy column matching. Automatically maps names, emails, titles, ranks, and dates without upload failures.
            </p>
          </div>

          <div className="p-6 rounded-card border border-hairline bg-surface space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-control bg-verified/10 flex items-center justify-center text-verified">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-ink">Crockford Base32 Verification</h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Cryptographically unguessable IDs (e.g. <code>CV-26-XXXXXXXX</code>) with zero ambiguous characters (0, O, I, L removed). Instant verification via camera QR scan.
            </p>
          </div>

          <div className="p-6 rounded-card border border-hairline bg-surface space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-control bg-accent/10 flex items-center justify-center text-accent">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-ink">Bulk Export & Print Packs</h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              One-click downloads of streamed ZIP bundles, print-ready merged multi-page PDFs, and formulas-sanitized CSV distribution manifests.
            </p>
          </div>

          <div className="p-6 rounded-card border border-hairline bg-surface space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-control bg-verified/10 flex items-center justify-center text-verified">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-ink">Verified Issuer Accreditation</h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Colleges and authorized clubs undergo platform verification to display the official green seal, preventing rogue organizations from impersonating institutions.
            </p>
          </div>

          <div className="p-6 rounded-card border border-hairline bg-surface space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-control bg-accent/10 flex items-center justify-center text-accent">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-ink">Zero PII Leakage Architecture</h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Strict isolation ensures recipient email addresses and internal database UUIDs are never exposed on public lookup endpoints.
            </p>
          </div>

          <div className="p-6 rounded-card border border-hairline bg-surface space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-control bg-verified/10 flex items-center justify-center text-verified">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-ink">Indian Invoicing & UPI Checkout</h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Instant checkout via Google Pay, PhonePe, and cards. Automated GST tax invoices with SAC code 998313 generated sequentially per Indian Financial Year.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface/50 border-t border-hairline text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <Badge variant="verified">Simple Economics</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink">
            Pay Per Certificate, Never Per Seat
          </h2>
          <p className="text-sm text-ink-secondary max-w-xl mx-auto">
            Start with 50 complimentary credits. Self-serve packs start at ₹999 for 500 certificates. Verification is always 100% free forever.
          </p>
          <div className="pt-2">
            <Link href="/pricing">
              <Button variant="primary" size="lg" className="text-xs font-semibold">
                View All Plans & GST Breakdown
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink">Frequently Asked Questions</h2>
          <p className="text-sm text-ink-secondary">Common questions about verification, delivery, and institutional compliance.</p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-5 rounded-card border border-hairline bg-surface space-y-2">
            <h3 className="text-sm font-bold text-ink">Do recipients need to create an account to view or download?</h3>
            <p className="text-ink-secondary leading-relaxed">
              No. Recipients receive an email with their unique link (or scan the QR code) which opens their public verification page directly. They can view, verify the cryptographic fingerprint, and download the high-resolution PDF without registering.
            </p>
          </div>

          <div className="p-5 rounded-card border border-hairline bg-surface space-y-2">
            <h3 className="text-sm font-bold text-ink">How are fake or forged certificates prevented?</h3>
            <p className="text-ink-secondary leading-relaxed">
              Every certificate has a unique 40-bit random Base32 identifier and an immutable SHA-256 cryptographic document hash. If anyone tampers with a printed or downloaded PDF, scanning the QR code instantly displays the official record from our Mumbai database.
            </p>
          </div>

          <div className="p-5 rounded-card border border-hairline bg-surface space-y-2">
            <h3 className="text-sm font-bold text-ink">What happens if a student&apos;s name was misspelled?</h3>
            <p className="text-ink-secondary leading-relaxed">
              You can issue a correction directly from the Certificates registry. The original public ID is preserved, the corrected PDF is re-rendered, and the superseded version is permanently archived in the audit history.
            </p>
          </div>

          <div className="p-5 rounded-card border border-hairline bg-surface space-y-2">
            <h3 className="text-sm font-bold text-ink">Can colleges pay via official Purchase Order (PO) or NEFT?</h3>
            <p className="text-ink-secondary leading-relaxed">
              Yes. Universities and colleges can request a formal Proforma Invoice and remit payment via institutional bank transfer (NEFT/RTGS). Our platform administrators manually credit the account upon receipt.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-hairline bg-surface py-12 px-4 sm:px-6 lg:px-8 text-xs text-ink-secondary">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-control bg-accent flex items-center justify-center text-white font-bold text-xs">
              CV
            </span>
            <span className="font-bold text-ink text-sm">CertiVault</span>
            <span className="text-[11px] text-ink-secondary">
              · Cryptographic Credential Infrastructure
            </span>
          </div>

          {/* Legal and nav links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
            <Link href="/pricing" className="hover:text-ink transition-colors">
              Pricing
            </Link>
            <Link href="/verify" className="hover:text-ink transition-colors">
              Verify QR
            </Link>
            <Link href="/terms" className="hover:text-ink transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-ink transition-colors">
              Privacy Policy
            </Link>
            <Link href="/refund" className="hover:text-ink transition-colors">
              Refund Policy
            </Link>
            <Link href="/contact" className="hover:text-ink transition-colors">
              Contact & Support
            </Link>
          </div>

          <p className="text-[11px] text-ink-secondary">
            © {new Date().getFullYear()} CertiVault Technologies. Hosted in Mumbai (ap-south-1).
          </p>
        </div>
      </footer>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  FileSpreadsheet,
  QrCode,
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveCertificateDemo } from "@/components/marketing/live-demo";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata = {
  title: "CertiVault — Issue 1,000 Verified Certificates in 5 Minutes",
  description:
    "The modern certificate issuance and instant QR verification engine for Indian universities, colleges, and student organizations.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-accent/15">
      {/* Floating Frosted Capsule Navigation */}
      <header className="sticky top-4 z-50 px-4 max-w-5xl mx-auto w-full">
        <div className="backdrop-blur-xl bg-surface/85 border border-hairline/80 rounded-full px-4 sm:px-6 py-2.5 shadow-sm flex items-center justify-between transition-all">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base text-ink press-feedback">
            <span className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white font-black text-xs shadow-xs">
              CV
            </span>
            <span className="tracking-tight text-sm sm:text-base font-extrabold">CertiVault</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-ink-secondary">
            <Link href="#demo" className="hover:text-ink transition-colors">
              Live Studio
            </Link>
            <Link href="#features" className="hover:text-ink transition-colors">
              Bento Features
            </Link>
            <Link href="#how-it-works" className="hover:text-ink transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="hover:text-ink transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="hover:text-ink transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/verify"
              className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold px-2.5 py-1.5 rounded-full hover:bg-accent/10 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Verify QR</span>
            </Link>

            <Link href="/login">
              <Button variant="secondary" size="sm" className="text-xs h-8 px-3 rounded-full">
                Sign In
              </Button>
            </Link>

            <Link href="/login">
              <Button variant="primary" size="sm" className="text-xs h-8 px-3.5 rounded-full font-semibold shadow-xs">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 sm:pt-16 pb-10 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface border border-hairline text-ink-secondary text-xs font-medium shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-verified animate-pulse" />
          <span>Mumbai Region (ap-south-1) · 40ms Engine · Zero PII Leaks</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-ink leading-[1.08] max-w-3xl mx-auto">
          Issue 1,000 verified certificates in 5 minutes.
        </h1>

        <p className="text-base sm:text-lg text-ink-secondary max-w-2xl mx-auto font-normal leading-relaxed">
          No Canva copy-pasting. No credential fraud. Import any CSV or Excel sheet, preview live vector layouts, and deliver permanent QR-authenticated credentials in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" className="w-full sm:w-auto px-7 text-sm font-semibold rounded-full shadow-md">
              Start Free (50 Complimentary Credits)
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/verify" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto px-6 text-sm font-medium rounded-full">
              <QrCode className="w-4 h-4 mr-2 text-accent" />
              Scan / Verify a Credential
            </Button>
          </Link>
        </div>
      </section>

      {/* Heroic Live Certificate Studio Showcase */}
      <section id="demo" className="py-8 px-4 sm:px-6 lg:px-8 text-center">
        <LiveCertificateDemo />
      </section>

      {/* High-Contrast Stat Strip */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-hairline bg-surface/30">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4 text-left">
          <div className="space-y-1">
            <p className="text-3xl font-black text-ink tabular-nums">40 ms</p>
            <p className="text-xs text-ink-secondary font-medium">PDF render latency</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-ink tabular-nums">&lt; 1.2 s</p>
            <p className="text-xs text-ink-secondary font-medium">Public QR verification</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-ink tabular-nums">18% GST</p>
            <p className="text-xs text-ink-secondary font-medium">Automated FY tax invoices</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-ink tabular-nums">100% Free</p>
            <p className="text-xs text-ink-secondary font-medium">Verification for recruiters</p>
          </div>
        </div>
      </section>

      {/* Asymmetric Bento Grid Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="accent">Engineered for Indian Higher Ed</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
            Built for High-Stakes Campus Trust
          </h2>
          <p className="text-sm text-ink-secondary">
            Everything your hackathon, college fest, or exam cell needs to eliminate manual Canva assembly and permanently stop credential fraud.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Cell 1: Wide (2 columns) - CSV & Excel Spreadsheet Parser */}
          <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl border border-hairline bg-surface flex flex-col justify-between shadow-xs space-y-6 hover:border-accent/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-ink">
                Frictionless Client-Side Spreadsheet Parser
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary max-w-lg leading-relaxed">
                Parse 10,000-row Excel (.xlsx) and CSV files directly inside the browser using WebAssembly. Automatic fuzzy column mapping eliminates upload errors before spending a single credit.
              </p>
            </div>

            {/* Visual Column Mapping Interactive Preview */}
            <div className="p-4 rounded-xl bg-canvas border border-hairline space-y-3 text-xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-ink-secondary uppercase tracking-wider">
                <span>Spreadsheet Column</span>
                <span>Mapped Template Field</span>
                <span>Match Status</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-hairline">
                  <span className="text-ink">Full_Name_Student</span>
                  <span className="text-accent font-semibold">recipient_name</span>
                  <span className="inline-flex items-center gap-1 text-verified font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Match
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-hairline">
                  <span className="text-ink">Event_Category</span>
                  <span className="text-accent font-semibold">title</span>
                  <span className="inline-flex items-center gap-1 text-verified font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 98% Fuzzy
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-hairline">
                  <span className="text-ink">Student_Email</span>
                  <span className="text-accent font-semibold">email</span>
                  <span className="inline-flex items-center gap-1 text-verified font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Validated
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Cell 2: Standard (1 column) - Anti-Collision Base32 */}
          <div className="p-6 sm:p-8 rounded-2xl border border-hairline bg-surface flex flex-col justify-between shadow-xs space-y-6 hover:border-accent/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-verified/10 flex items-center justify-center text-verified">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-ink">
                Crockford Base32 Anti-Collision IDs
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Every certificate receives a 40-bit unguessable Crockford identifier. Zero ambiguous characters (0, O, I, L stripped), preventing accidental phone transcription errors.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-hairline text-center space-y-1.5">
              <p className="text-[10px] text-ink-secondary uppercase tracking-widest font-semibold">Unique Public Credential ID</p>
              <p className="font-mono text-base font-black text-ink tracking-widest">CV-26-7K3M9QXT</p>
              <p className="text-[10px] text-verified font-medium flex items-center justify-center gap-1">
                <Check className="w-3 h-3" /> Zero collision across 100k generated IDs
              </p>
            </div>
          </div>

          {/* Bento Cell 3: Standard (1 column) - Multi-Language Typography */}
          <div className="p-6 sm:p-8 rounded-2xl border border-hairline bg-surface flex flex-col justify-between shadow-xs space-y-6 hover:border-accent/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-ink">
                Multi-Lingual Vector Typography
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Native vector font embedding for Devanagari (Hindi) and Telugu scripts alongside classic serif & sans typography. Zero tofu character glyphs on any device.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-hairline space-y-2 text-xs">
              <div className="flex items-center justify-between text-ink border-b border-hairline pb-1.5">
                <span className="font-serif">Playfair Serif</span>
                <span className="text-[11px] text-ink-secondary">Honor Awards</span>
              </div>
              <div className="flex items-center justify-between text-ink border-b border-hairline pb-1.5">
                <span className="font-sans">Inter Sans</span>
                <span className="text-[11px] text-ink-secondary">Tech & Hackathons</span>
              </div>
              <div className="flex items-center justify-between text-ink">
                <span>देवनागरी & తెలుగు</span>
                <span className="text-[11px] text-verified font-semibold">Bilingual Presets</span>
              </div>
            </div>
          </div>

          {/* Bento Cell 4: Wide (2 columns) - Indian Tax Compliance & Accreditation */}
          <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl border border-hairline bg-surface flex flex-col justify-between shadow-xs space-y-6 hover:border-accent/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-verified/10 flex items-center justify-center text-verified">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-ink">
                Indian Tax Invoicing & Verified Accreditation
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary max-w-lg leading-relaxed">
                Instant UPI & card checkout via Razorpay with automated 18% GST invoice generation (SAC 998313). College audit cells get sequential FY tax invoices for Input Tax Credit (ITC).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-canvas border border-hairline space-y-1">
                <p className="font-bold text-ink flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-verified" />
                  SAC Code 998313 Invoices
                </p>
                <p className="text-ink-secondary text-[11px]">
                  Billed in INR with automated CGST, SGST, and IGST breakdowns.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-hairline space-y-1">
                <p className="font-bold text-ink flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-verified" />
                  Verified Issuer Accreditation
                </p>
                <p className="text-ink-secondary text-[11px]">
                  Institutional review displays official green badges on public verification links.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Verification Journey */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 border-y border-hairline bg-surface/30">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="accent">The Verification Workflow</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              How Instant Verification Works
            </h2>
            <p className="text-xs sm:text-sm text-ink-secondary">
              Three seamless steps from student achievement to permanent public employer verification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-surface border border-hairline space-y-3 relative shadow-xs">
              <span className="w-7 h-7 rounded-full bg-accent/10 text-accent font-black text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-ink">One-Click Batch Issuance</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Upload your CSV, preview vector cards, and trigger generation. Our background queue processes 1,000 certificates in seconds.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-hairline space-y-3 relative shadow-xs">
              <span className="w-7 h-7 rounded-full bg-accent/10 text-accent font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-ink">Link-First Email Delivery</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Recipients receive branded, mobile-first emails with their permanent public verification link and one-click PDF downloads.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-hairline space-y-3 relative shadow-xs">
              <span className="w-7 h-7 rounded-full bg-verified/10 text-verified font-black text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-ink">Instant Employer Scan</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Recruiters scan the QR code via smartphone camera. The public ledger authenticates the credential in under 1.2 seconds without logging in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded 3-Tier Pricing Comparison */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12 text-center">
        <div className="space-y-3 max-w-2xl mx-auto">
          <Badge variant="verified">Simple Indian Pricing</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
            Pay Per Certificate. Never Per Seat.
          </h2>
          <p className="text-sm text-ink-secondary">
            Start free with 50 credits. Self-serve packs start at ₹999 for 500 certificates. Verification is always 100% free forever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-stretch">
          {/* Starter Plan */}
          <div className="p-6 sm:p-7 rounded-2xl border border-hairline bg-surface flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-ink">Free Starter</h3>
                <p className="text-xs text-ink-secondary mt-0.5">For student club meetups & tests</p>
              </div>

              <div>
                <span className="text-3xl font-black text-ink">₹0</span>
                <span className="text-xs text-ink-secondary ml-1.5 font-medium">Free forever</span>
              </div>

              <div className="space-y-2.5 text-xs text-ink-secondary pt-2 border-t border-hairline">
                <div className="flex items-center gap-2 text-ink">
                  <Check className="w-4 h-4 text-verified" />
                  <span>50 complimentary credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-verified" />
                  <span>8 standard template presets</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-verified" />
                  <span>Public QR code verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-verified" />
                  <span>Client-side CSV parsing</span>
                </div>
              </div>
            </div>

            <Link href="/login">
              <Button variant="secondary" className="w-full text-xs font-semibold">
                Start Free (50 Credits)
              </Button>
            </Link>
          </div>

          {/* Event Pack */}
          <div className="p-6 sm:p-7 rounded-2xl border border-hairline bg-surface flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-ink">Event Pack</h3>
                <p className="text-xs text-ink-secondary mt-0.5">For single college fests & hackathons</p>
              </div>

              <div>
                <span className="text-3xl font-black text-ink">₹999</span>
                <span className="text-xs text-ink-secondary ml-1.5 font-medium">+ 18% GST</span>
              </div>

              <div className="space-y-2.5 text-xs text-ink-secondary pt-2 border-t border-hairline">
                <div className="flex items-center gap-2 text-ink font-semibold">
                  <Check className="w-4 h-4 text-verified" />
                  <span>500 certificates (₹2.00 / cert)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-verified" />
                  <span>12-month credit validity</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-verified" />
                  <span>Custom institution branding & logo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-verified" />
                  <span>Bulk ZIP and merged print PDF export</span>
                </div>
              </div>
            </div>

            <Link href="/login">
              <Button variant="secondary" className="w-full text-xs font-semibold">
                Buy Event Pack
              </Button>
            </Link>
          </div>

          {/* Club Pack - Featured */}
          <div className="p-6 sm:p-7 rounded-2xl border-2 border-accent bg-surface flex flex-col justify-between space-y-6 shadow-md relative">
            <div className="absolute -top-3 right-6 bg-accent text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
              Most Popular
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-ink">Club Pack</h3>
                <p className="text-xs text-ink-secondary mt-0.5">For active clubs & departments</p>
              </div>

              <div>
                <span className="text-3xl font-black text-ink">₹2,999</span>
                <span className="text-xs text-ink-secondary ml-1.5 font-medium">+ 18% GST</span>
              </div>

              <div className="space-y-2.5 text-xs text-ink-secondary pt-2 border-t border-hairline">
                <div className="flex items-center gap-2 text-ink font-semibold">
                  <Check className="w-4 h-4 text-verified" />
                  <span>2,000 certificates (₹1.50 / cert)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-verified" />
                  <span>Multi-lingual Hindi & Telugu fonts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-verified" />
                  <span>Automated 18% GST tax invoice</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-verified" />
                  <span>Multi-signatory digital signatures</span>
                </div>
              </div>
            </div>

            <Link href="/login">
              <Button variant="primary" className="w-full text-xs font-semibold shadow-xs">
                Buy Club Pack
              </Button>
            </Link>
          </div>
        </div>

        <div className="pt-2">
          <Link href="/pricing" className="text-xs text-accent hover:underline font-semibold inline-flex items-center gap-1.5">
            <span>Need an institutional Campus Annual Plan? View all plans & tax breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink">Frequently Asked Questions</h2>
          <p className="text-sm text-ink-secondary">Common questions about verification, delivery, and institutional compliance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left">
          <div className="p-5 rounded-2xl border border-hairline bg-surface space-y-2">
            <h3 className="text-sm font-bold text-ink">Do recipients need to create an account to view or download?</h3>
            <p className="text-ink-secondary leading-relaxed">
              No. Recipients receive an email with their unique link (or scan the QR code) which opens their public verification page directly. They can view, verify the cryptographic fingerprint, and download the high-resolution PDF without registering.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-hairline bg-surface space-y-2">
            <h3 className="text-sm font-bold text-ink">How are fake or forged certificates prevented?</h3>
            <p className="text-ink-secondary leading-relaxed">
              Every certificate has a unique 40-bit random Base32 identifier and an immutable SHA-256 cryptographic document hash. If anyone tampers with a printed or downloaded PDF, scanning the QR code instantly displays the official record from our Mumbai database.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-hairline bg-surface space-y-2">
            <h3 className="text-sm font-bold text-ink">What happens if a student&apos;s name was misspelled?</h3>
            <p className="text-ink-secondary leading-relaxed">
              You can issue a correction directly from the Certificates registry. The original public ID is preserved, the corrected PDF is re-rendered, and the superseded version is permanently archived in the audit history.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-hairline bg-surface space-y-2">
            <h3 className="text-sm font-bold text-ink">Can colleges pay via official Purchase Order (PO) or NEFT?</h3>
            <p className="text-ink-secondary leading-relaxed">
              Yes. Universities and colleges can request a formal Proforma Invoice and remit payment via institutional bank transfer (NEFT/RTGS). Our platform administrators manually credit the account upon receipt.
            </p>
          </div>
        </div>
      </section>

      {/* Closing Call to Action Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-surface border border-hairline shadow-md space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-verified/10 text-verified text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready in under 5 minutes</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-ink tracking-tight max-w-xl mx-auto">
            Issue your first 50 verified certificates today.
          </h2>

          <p className="text-sm text-ink-secondary max-w-lg mx-auto">
            No credit card required. Free 50 credits automatically included on your account on sign-up.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto px-8 text-sm font-semibold rounded-full shadow-md">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/verify" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto px-6 text-sm font-medium rounded-full">
                Verify a Demo ID
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Dedicated Site Footer */}
      <SiteFooter />
    </div>
  );
}

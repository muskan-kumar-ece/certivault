"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  FileSpreadsheet,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Check,
  Building2,
  Mail,
  SlidersHorizontal,
  ChevronDown,
  Award,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketingSidebar } from "@/components/navigation/marketing-sidebar";
import { HeroComposition3D } from "@/components/marketing/hero-composition-3d";
import { LiveCertificateDemo } from "@/components/marketing/live-demo";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqItems = [
    {
      q: "Do recipients need an account to view or download their certificate?",
      a: "No. Recipients receive an email with their unique link (or scan the QR code) which opens their public verification page directly. They can verify the cryptographic fingerprint and download the print-ready PDF without creating an account or logging in.",
    },
    {
      q: "How are forged or tampered certificates detected?",
      a: "Every certificate has a unique 40-bit random Crockford Base32 identifier and an immutable SHA-256 cryptographic document hash. When anyone scans the QR code or looks up the ID, CertiVault validates the record directly against our official database in Mumbai. If someone edits a printed or downloaded PDF, the hash will not match the official record.",
    },
    {
      q: "What happens when a student's name is misspelled or an error occurs?",
      a: "You can issue a correction directly from the Certificates management dashboard. The original public ID is retained, the corrected PDF is regenerated, and the superseded version is permanently archived in the audit history.",
    },
    {
      q: "Can colleges pay through institutional Purchase Orders (PO) or NEFT/RTGS?",
      a: "Yes. Universities and colleges can request an official Proforma Invoice with our GSTIN and remit payment via institutional bank transfer (NEFT/RTGS). Our administrators credit the account manually upon payment confirmation.",
    },
    {
      q: "How does the public certificate verification work?",
      a: "Verification runs via the lightweight get_public_certificate RPC endpoint. Verifiers can scan the on-certificate QR code using any phone camera or type the public ID at /verify. It returns the recipient name, issuing institution, event title, issue date, and SHA-256 document fingerprint.",
    },
    {
      q: "What spreadsheet formats are supported for bulk batch imports?",
      a: "CertiVault supports standard Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv) spreadsheets. Our client-side parser parses up to 10,000 rows in under 2 seconds and helps you map columns to certificate variables.",
    },
    {
      q: "How are certificates delivered to students and participants?",
      a: "CertiVault uses a link-first email delivery model. Recipients receive an email with their personal link and view the certificate in high resolution. This prevents spam filters and mailbox quota blocks associated with heavy attachments.",
    },
    {
      q: "How are credits calculated and do unused credits expire?",
      a: "1 credit = 1 issued certificate. Unused credits purchased through Event or Club packs remain valid for 12 months. Verification by recruiters and recipients is 100% free and never consumes any credits.",
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans selection:bg-accent/15">
      {/* Fixed Left Sidebar on Desktop */}
      <MarketingSidebar />

      {/* Main Content Area (Offset by sidebar width on desktop) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Utility Bar (Desktop) */}
        <header className="hidden lg:flex items-center justify-end gap-3 px-8 py-4 bg-canvas/80 backdrop-blur-md sticky top-0 z-30 border-b border-hairline/60">
          <Link href="/verify">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full text-xs font-semibold px-4 h-9 shadow-xs press-feedback"
            >
              <QrCode className="w-3.5 h-3.5 mr-1.5 text-accent" />
              <span>Verify Certificate</span>
            </Button>
          </Link>

          <Link href="/login">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full text-xs font-semibold px-4 h-9 press-feedback"
            >
              <span>Sign In</span>
            </Button>
          </Link>

          <Link href="/login">
            <Button
              variant="primary"
              size="sm"
              className="rounded-full text-xs font-semibold px-5 h-9 bg-accent hover:bg-accent-hover text-white shadow-md shadow-accent/20 press-feedback"
            >
              <span>Start for Free</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </header>

        {/* HERO SECTION */}
        <section className="relative px-4 sm:px-8 lg:px-12 pt-8 sm:pt-14 pb-16 sm:pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline, Description & CTAs */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-hairline shadow-xs">
                <span className="text-sm">🇮🇳</span>
                <span className="text-xs font-bold text-ink">Engineered for Indian Higher Education</span>
              </div>

              {/* Main Headline with Blue-Violet Gradient Accent */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-ink tracking-tight leading-[1.08]">
                Issue Verified{" "}
                <span className="bg-gradient-to-r from-accent via-brand-violet to-accent bg-clip-text text-transparent">
                  Certificates
                </span>{" "}
                in Minutes
              </h1>

              {/* Supporting Description */}
              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed max-w-xl">
                Automate certificate creation, verification and delivery for hackathons, college
                fests, workshops, exams and more. No Canva copy-paste. No manual work. Zero
                credential fraud.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="primary"
                    className="w-full sm:w-auto px-7 py-3 rounded-full text-xs sm:text-sm font-bold bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/25 press-feedback"
                  >
                    <span>Start Free (50 Credits)</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <Link href="/verify">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-surface border border-hairline shadow-xs hover:bg-canvas press-feedback"
                  >
                    <QrCode className="w-4 h-4 mr-2 text-accent" />
                    <span>Verify a Certificate</span>
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators Checklist */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-ink-secondary pt-2">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-verified" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-verified" />
                  <span>Free 50 credits</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-verified" />
                  <span>Set up in 2 minutes</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Product & Podium Composition */}
            <div className="lg:col-span-6 flex justify-center">
              <HeroComposition3D />
            </div>
          </div>
        </section>

        {/* 4 METRIC STATS STRIP (Matching Uploaded Image) */}
        <section className="px-4 sm:px-8 lg:px-12 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat 1 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-hairline shadow-xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-violet/10 text-brand-violet flex items-center justify-center shadow-xs flex-shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-ink tracking-tight">500+</div>
                  <div className="text-xs text-ink-secondary font-medium">Institutions</div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-hairline shadow-xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shadow-xs flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-ink tracking-tight">1M+</div>
                  <div className="text-xs text-ink-secondary font-medium">Certificates Issued</div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-hairline shadow-xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-verified/10 text-verified flex items-center justify-center shadow-xs flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-ink tracking-tight">Zero</div>
                  <div className="text-xs text-ink-secondary font-medium">Credential Fraud</div>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-hairline shadow-xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-xs flex-shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-ink tracking-tight">&lt; 5 min</div>
                  <div className="text-xs text-ink-secondary font-medium">Setup Time</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 CORE FEATURE CARDS (Matching Uploaded Image) */}
        <section id="features" className="px-4 sm:px-8 lg:px-12 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1 */}
              <div className="p-6 rounded-2xl bg-surface border border-hairline shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-violet/10 text-brand-violet flex items-center justify-center flex-shrink-0 shadow-xs">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-ink">Bulk Certificate Creation</h3>
                    <p className="text-xs text-ink-secondary leading-relaxed">
                      Upload your Excel or CSV file and generate thousands of certificates in seconds.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <div className="w-7 h-7 rounded-full bg-canvas text-ink-secondary group-hover:bg-accent group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-2xl bg-surface border border-hairline shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-verified/10 text-verified flex items-center justify-center flex-shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-ink">Tamper-Proof Verification</h3>
                    <p className="text-xs text-ink-secondary leading-relaxed">
                      Every certificate has a unique QR code and immutable hash to prevent forgery.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <div className="w-7 h-7 rounded-full bg-canvas text-ink-secondary group-hover:bg-accent group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-2xl bg-surface border border-hairline shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-ink">Instant Delivery</h3>
                    <p className="text-xs text-ink-secondary leading-relaxed">
                      Recipients get their certificates directly via email with a public verification link.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <div className="w-7 h-7 rounded-full bg-canvas text-ink-secondary group-hover:bg-accent group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SIGNATURE FEATURE: INTERACTIVE LIVE STUDIO */}
        <section id="studio" className="px-4 sm:px-8 lg:px-12 py-16 sm:py-20 border-t border-hairline/80 bg-surface/50">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <Badge variant="accent">Signature Feature</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
                Interactive Certificate Studio
              </h2>
              <p className="text-sm text-ink-secondary">
                Switch styles, personalize credentials, and test the sub-second cryptographic verification engine in real time.
              </p>
            </div>

            {/* Live Interactive Studio */}
            <LiveCertificateDemo />
          </div>
        </section>

        {/* COMPREHENSIVE 6-PILLAR FEATURE SHOWCASE */}
        <section className="px-4 sm:px-8 lg:px-12 py-16 sm:py-20 border-t border-hairline/80">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <Badge variant="neutral">Architecture & Capabilities</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
                Engineered for High-Stakes Credentials
              </h2>
              <p className="text-sm text-ink-secondary">
                Everything Indian universities, autonomous colleges, and tech symposiums need to replace insecure paper certificates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-surface border border-hairline shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-ink">1. Bulk Batch Generation</h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Generate up to 10,000 PDF certificates concurrently. Our streaming chunk worker renders 1,000 certificates in under 5 minutes without browser lag.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-surface border border-hairline shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-verified/10 text-verified flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-ink">2. Crockford Base32 & QR Verification</h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Every credential receives a 40-bit non-sequential ID that eliminates transcription errors (e.g. O/0 and I/1 ambiguity) and an immutable SHA-256 fingerprint.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-surface border border-hairline shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-violet/10 text-brand-violet flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-ink">3. Link-First Email Delivery</h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Email delivery with high inbox deliverability. Recipients receive their verified web view link directly without inbox quota size limits.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-surface border border-hairline shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-ink">4. Client-Side Spreadsheet Intelligence</h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Smart automatic column mapping parses your CSV or Excel file right in your browser, validating recipient emails and identifying row errors before generation.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-2xl bg-surface border border-hairline shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-ink">5. Correction & Supersede Workflows</h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Fix typos easily. Re-issuing updates the official record while maintaining the original public verification URL and logging the full audit trail.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-2xl bg-surface border border-hairline shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-ink">6. Institutional Compliance & 18% GST</h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Official Indian tax invoices with automatic HSN code and GSTIN breakdown. Downloadable PDF receipts for university accounting cells.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS 5-STEP SECTION */}
        <section id="how-it-works" className="px-4 sm:px-8 lg:px-12 py-16 sm:py-20 border-t border-hairline/80 bg-surface/30">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <Badge variant="verified">Simple 5-Step Process</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
                How CertiVault Works
              </h2>
              <p className="text-sm text-ink-secondary">
                From student list to verified credentials in under five minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Step 1 */}
              <div className="p-5 rounded-2xl bg-surface border border-hairline shadow-xs space-y-3 relative">
                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  1
                </div>
                <h4 className="text-sm font-bold text-ink">Upload Template</h4>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Select a preset or upload your institution&apos;s custom PDF design.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-2xl bg-surface border border-hairline shadow-xs space-y-3 relative">
                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  2
                </div>
                <h4 className="text-sm font-bold text-ink">Import Spreadsheet</h4>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Drop your Excel or CSV list of recipients, ranks, and events.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-2xl bg-surface border border-hairline shadow-xs space-y-3 relative">
                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  3
                </div>
                <h4 className="text-sm font-bold text-ink">Map & Validate</h4>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Match spreadsheet columns to certificate placeholder coordinates.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-5 rounded-2xl bg-surface border border-hairline shadow-xs space-y-3 relative">
                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  4
                </div>
                <h4 className="text-sm font-bold text-ink">Batch Generate</h4>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Our worker generates PDFs with vector QR codes at 40ms per certificate.
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-5 rounded-2xl bg-surface border border-hairline shadow-xs space-y-3 relative">
                <div className="w-8 h-8 rounded-full bg-verified text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  5
                </div>
                <h4 className="text-sm font-bold text-ink">Deliver & Verify</h4>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Automated email delivery with instant QR camera verification.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="px-4 sm:px-8 lg:px-12 py-16 sm:py-20 border-t border-hairline/80">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <Badge variant="verified">Indian Rupee Pricing</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
                Simple, Credit-Based Plans
              </h2>
              <p className="text-sm text-ink-secondary">
                1 credit = 1 issued certificate. Verification and re-verification are always 100% free.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Free Starter */}
              <div className="p-7 rounded-2xl bg-surface border border-hairline shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-ink">Free Starter</h3>
                    <p className="text-xs text-ink-secondary mt-0.5">For small workshops & evaluation</p>
                  </div>
                  <div>
                    <span className="text-3xl font-black text-ink">₹0</span>
                    <span className="text-xs text-ink-secondary ml-1.5 font-medium">Free forever</span>
                  </div>
                  <div className="space-y-2.5 text-xs text-ink-secondary pt-2 border-t border-hairline">
                    <div className="flex items-center gap-2 text-ink font-semibold">
                      <Check className="w-4 h-4 text-verified" />
                      <span>50 complimentary credits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-verified" />
                      <span>Standard templates & QR codes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-verified" />
                      <span>Public recruiter verification</span>
                    </div>
                  </div>
                </div>

                <Link href="/login">
                  <Button variant="secondary" className="w-full text-xs font-semibold rounded-xl">
                    Start Free
                  </Button>
                </Link>
              </div>

              {/* Event Pack */}
              <div className="p-7 rounded-2xl bg-surface border border-hairline shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-ink">Event Pack</h3>
                    <p className="text-xs text-ink-secondary mt-0.5">For college fests & single symposiums</p>
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
                      <span>Custom institutional branding</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-verified" />
                      <span>Automated 18% GST tax invoice</span>
                    </div>
                  </div>
                </div>

                <Link href="/login">
                  <Button variant="secondary" className="w-full text-xs font-semibold rounded-xl">
                    Buy Event Pack
                  </Button>
                </Link>
              </div>

              {/* Club Pack (Featured) */}
              <div className="p-7 rounded-2xl bg-surface border-2 border-accent shadow-lg shadow-accent/10 flex flex-col justify-between space-y-6 relative">
                <div className="absolute -top-3 right-6 bg-accent text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                  Most Popular
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-ink">Club Pack</h3>
                    <p className="text-xs text-ink-secondary mt-0.5">For active departments & clubs</p>
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
                  <Button variant="primary" className="w-full text-xs font-semibold rounded-xl bg-accent text-white shadow-md">
                    Buy Club Pack
                  </Button>
                </Link>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link href="/pricing" className="text-xs text-accent hover:underline font-semibold inline-flex items-center gap-1.5">
                <span>Need a Campus Annual Plan with custom university subdomain? View all details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section id="faq" className="px-4 sm:px-8 lg:px-12 py-16 sm:py-20 border-t border-hairline/80 bg-surface/30">
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="text-center space-y-3">
              <Badge variant="neutral">Got Questions?</Badge>
              <h2 className="text-3xl font-extrabold tracking-tight text-ink">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-ink-secondary">
                Clear answers regarding security, compliance, delivery, and pricing.
              </p>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-hairline bg-surface overflow-hidden shadow-xs transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-sm font-bold text-ink hover:text-accent transition-colors"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-ink-secondary flex-shrink-0 transition-transform duration-200 ${
                          isOpen ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs text-ink-secondary leading-relaxed border-t border-hairline/60">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CLOSING CALL TO ACTION BANNER */}
        <section className="px-4 sm:px-8 lg:px-12 py-16">
          <div className="max-w-4xl mx-auto text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-surface to-canvas border border-hairline shadow-lg space-y-6">
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
                <Button size="lg" variant="primary" className="w-full sm:w-auto px-8 text-sm font-bold rounded-full bg-accent text-white shadow-md">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/verify" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto px-6 text-sm font-medium rounded-full bg-surface border border-hairline">
                  Verify a Certificate
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* SITE FOOTER */}
        <SiteFooter />
      </div>
    </div>
  );
}

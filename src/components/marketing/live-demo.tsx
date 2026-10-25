"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  QrCode,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Layers,
  Award,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type DemoTheme = "gold" | "navy" | "minimal" | "bilingual";

export function LiveCertificateDemo() {
  const [recipientName, setRecipientName] = useState("Aarav Sharma");
  const [title, setTitle] = useState("National Hackathon 2026 — 1st Place Winner");
  const [orgName, setOrgName] = useState("IIT Bombay Techfest");
  const [templateTheme, setTemplateTheme] = useState<DemoTheme>("gold");

  const sampleId = "CV-26-7K3M9QXT";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Studio Control Toolbar */}
      <div className="bg-surface rounded-2xl border border-hairline p-3.5 sm:p-5 shadow-xs space-y-4 text-left">
        {/* Top Preset Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-verified animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-ink-secondary">
              Interactive Studio
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              40ms Vector Render
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: "gold", label: "Honor Gold", icon: Award },
                { id: "navy", label: "Classic Navy", icon: ShieldCheck },
                { id: "minimal", label: "Modern Clean", icon: Layers },
                { id: "bilingual", label: "हिन्दी / Bilingual", icon: Sparkles },
              ] as const
            ).map((th) => {
              const Icon = th.icon;
              const isActive = templateTheme === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => {
                    setTemplateTheme(th.id);
                    if (th.id === "bilingual" && recipientName === "Aarav Sharma") {
                      setRecipientName("आरव शर्मा (Aarav Sharma)");
                      setTitle("राष्ट्रीय तकनीकी महोत्सव — प्रथम स्थान विजेता");
                      setOrgName("भारतीय प्रौद्योगिकी संस्थान (IIT)");
                    } else if (th.id !== "bilingual" && recipientName.includes("आरव")) {
                      setRecipientName("Aarav Sharma");
                      setTitle("National Hackathon 2026 — 1st Place Winner");
                      setOrgName("IIT Bombay Techfest");
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium transition-all press-feedback whitespace-nowrap ${
                    isActive
                      ? "bg-accent text-white font-semibold shadow-xs"
                      : "bg-surface-raised border border-hairline text-ink-secondary hover:text-ink"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{th.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Responsive Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="demo-recipient-name"
              className="block text-[11px] font-semibold uppercase tracking-wider text-ink-secondary mb-1"
            >
              Recipient Name
            </label>
            <input
              id="demo-recipient-name"
              name="recipientName"
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-control bg-canvas border border-hairline text-ink focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="e.g. Aarav Sharma"
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="demo-award-title"
              className="block text-[11px] font-semibold uppercase tracking-wider text-ink-secondary mb-1"
            >
              Distinction / Title
            </label>
            <input
              id="demo-award-title"
              name="awardTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-control bg-canvas border border-hairline text-ink focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="e.g. Hackathon Winner"
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="demo-org-name"
              className="block text-[11px] font-semibold uppercase tracking-wider text-ink-secondary mb-1"
            >
              Issuing Organization
            </label>
            <input
              id="demo-org-name"
              name="orgName"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-control bg-canvas border border-hairline text-ink focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="e.g. College Name"
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      {/* Floating Dimensional Certificate Canvas */}
      <div className="flex justify-center p-1 sm:p-2">
        <div
          className={`w-full max-w-3xl aspect-[1.414/1] rounded-2xl p-6 sm:p-10 flex flex-col justify-between border transition-all duration-300 relative overflow-hidden shadow-2xl ${
            templateTheme === "navy"
              ? "bg-surface border-accent/40 text-ink ring-1 ring-accent/20"
              : templateTheme === "gold"
              ? "bg-surface border-verified/40 text-ink ring-1 ring-verified/20"
              : templateTheme === "bilingual"
              ? "bg-surface-raised border-accent/30 text-ink ring-1 ring-hairline"
              : "bg-surface border-hairline text-ink"
          }`}
        >
          {/* Subtle Security Guilloche Pattern */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Ornate Framing Borders */}
          <div className="absolute inset-3 sm:inset-4 border-2 border-current opacity-20 rounded-lg pointer-events-none" />
          <div className="absolute inset-4 sm:inset-5 border border-current opacity-10 rounded-md pointer-events-none" />

          {/* Corner Flourishes */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-current opacity-40 pointer-events-none" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-current opacity-40 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-current opacity-40 pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-current opacity-40 pointer-events-none" />

          {/* Top Issuer Section */}
          <div className="flex items-start justify-between relative z-10">
            <div className="text-left space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-base tracking-wider uppercase text-ink">
                  {orgName || "CertiVault Organization"}
                </span>
                <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-verified flex-shrink-0" />
              </div>
              <p className="text-[10px] sm:text-xs text-ink-secondary flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3 text-verified" />
                Accredited Verified Issuer · Mumbai ap-south-1
              </p>
            </div>

            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-current border-opacity-20 bg-canvas/40 flex items-center justify-center font-black text-xs sm:text-sm tracking-tight text-ink shadow-xs">
              CV
            </div>
          </div>

          {/* Central Award Block */}
          <div className="text-center my-auto py-3 sm:py-6 relative z-10 space-y-2 sm:space-y-3">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-ink-secondary font-bold">
              {templateTheme === "bilingual" ? "प्रमाण पत्र · Certificate of Excellence" : "Certificate of Excellence"}
            </p>
            <p className="text-xs sm:text-sm text-ink-secondary italic font-serif">
              {templateTheme === "bilingual" ? "यह प्रमाणित किया जाता है कि · Proudly presented to" : "This credential is proudly presented to"}
            </p>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-ink py-1">
              {recipientName || "Recipient Name"}
            </h2>

            <div className="w-20 sm:w-28 h-0.5 bg-accent mx-auto opacity-70 rounded-full" />

            <p className="text-xs sm:text-base font-medium text-ink-secondary max-w-lg mx-auto line-clamp-2 leading-relaxed">
              {title || "For outstanding achievement, verified contribution, and active participation."}
            </p>
          </div>

          {/* Bottom Footprint: Signatory, Seal, and Vector QR */}
          <div className="flex items-end justify-between pt-3 sm:pt-4 border-t border-current border-opacity-15 relative z-10 text-[10px] sm:text-xs">
            <div className="text-left space-y-1">
              <div className="w-24 sm:w-36 border-b border-current opacity-40" />
              <p className="font-bold text-ink">Authorized Signatory</p>
              <p className="text-[10px] text-ink-secondary">Dean / Event Controller</p>
            </div>

            {/* Official Metallic Seal */}
            <div className="hidden sm:flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-current opacity-30 flex items-center justify-center text-[8px] font-bold uppercase text-center p-1 leading-tight">
                Official Seal
              </div>
            </div>

            {/* Vector QR & Cryptographic Crockford ID */}
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block space-y-0.5">
                <p className="font-mono font-bold text-[11px] text-ink">{sampleId}</p>
                <p className="text-[9px] text-ink-secondary uppercase tracking-wider font-medium">Scan to Verify</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white p-1.5 rounded-lg border border-hairline shadow-sm flex items-center justify-center flex-shrink-0">
                <QrCode className="w-full h-full text-slate-900" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Studio Action Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 pt-1 text-xs text-ink-secondary">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-verified" />
          <span>Vector PDF rendered with embedded Crockford Base32 ID & ISO QR Code.</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/verify"
            className="text-accent hover:underline flex items-center gap-1 font-semibold press-feedback"
          >
            <span>Test Public Verification Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/login">
            <Button size="sm" variant="primary" className="text-xs">
              Start Free (50 Credits)
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

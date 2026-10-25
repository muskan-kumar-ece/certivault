"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BadgeCheck, QrCode, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function LiveCertificateDemo() {
  const [recipientName, setRecipientName] = useState("Aarav Sharma");
  const [title, setTitle] = useState("National Hackathon 2026 — 1st Place Winner");
  const [orgName, setOrgName] = useState("IIT Bombay Techfest");
  const [templateTheme, setTemplateTheme] = useState<"navy" | "gold" | "minimal">("navy");

  const sampleId = "CV-26-DEMO8492";

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      {/* Interactive Controls */}
      <div className="lg:col-span-5 space-y-5 bg-surface p-6 sm:p-7 rounded-card border border-hairline shadow-sm text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-verified animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-ink-secondary">
              Interactive Live Demo
            </span>
          </div>
          <Badge variant="verified" className="text-[10px]">
            Instant Preview
          </Badge>
        </div>

        <p className="text-xs text-ink-secondary">
          Try typing below. CertiVault renders vector-crisp certificates and cryptographic QR codes in real-time.
        </p>

        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-ink mb-1">Recipient Full Name</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-control bg-canvas border border-hairline text-ink focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="e.g. Aarav Sharma"
            />
          </div>

          <div>
            <label className="block font-medium text-ink mb-1">Award / Course Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-control bg-canvas border border-hairline text-ink focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="e.g. Hackathon Winner"
            />
          </div>

          <div>
            <label className="block font-medium text-ink mb-1">Issuing Organization</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-control bg-canvas border border-hairline text-ink focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="e.g. College Name"
            />
          </div>

          <div>
            <label className="block font-medium text-ink mb-1.5">Template Style</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "navy", label: "Classic Navy" },
                  { id: "gold", label: "Honor Gold" },
                  { id: "minimal", label: "Modern Clean" },
                ] as const
              ).map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setTemplateTheme(th.id)}
                  className={`py-1.5 px-2 rounded-control text-[11px] font-medium border transition-all press-feedback ${
                    templateTheme === th.id
                      ? "border-accent bg-accent/10 text-accent font-semibold"
                      : "border-hairline bg-surface text-ink-secondary hover:text-ink"
                  }`}
                >
                  {th.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-hairline flex items-center justify-between">
          <Link
            href="/verify"
            className="text-xs text-accent hover:underline flex items-center gap-1 font-medium press-feedback"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Test QR Scanner</span>
          </Link>
          <Link href="/login">
            <Button size="sm" variant="primary" className="text-xs">
              Issue Your Batch Free
            </Button>
          </Link>
        </div>
      </div>

      {/* Live Rendered Certificate Card */}
      <div className="lg:col-span-7 flex justify-center">
        <div
          className={`w-full max-w-lg aspect-[1.414/1] rounded-card p-6 sm:p-8 flex flex-col justify-between border shadow-lg transition-all relative overflow-hidden ${
            templateTheme === "navy"
              ? "bg-surface border-accent/30 text-ink"
              : templateTheme === "gold"
              ? "bg-surface-raised border-verified/30 text-ink"
              : "bg-surface border-hairline text-ink"
          }`}
        >
          {/* Subtle Inner Border Frame */}
          <div className="absolute inset-2 sm:inset-3 border border-current opacity-15 rounded-sm pointer-events-none" />

          {/* Top Issuer Header */}
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm tracking-wide uppercase">
                  {orgName || "CertiVault Organization"}
                </span>
                <BadgeCheck className="w-4 h-4 text-verified flex-shrink-0" />
              </div>
              <p className="text-[10px] opacity-70">Official Verified Credential</p>
            </div>

            <div className="w-9 h-9 rounded-full bg-current opacity-10 flex items-center justify-center font-bold text-xs">
              CV
            </div>
          </div>

          {/* Central Award Block */}
          <div className="text-center my-auto py-2 relative z-10">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest opacity-60 font-semibold mb-1">
              Certificate of Excellence
            </p>
            <p className="text-[11px] opacity-70 italic mb-2">This is proudly presented to</p>

            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-ink py-1">
              {recipientName || "Recipient Name"}
            </h2>

            <div className="w-16 h-0.5 bg-accent mx-auto my-2 opacity-80" />

            <p className="text-xs sm:text-sm font-medium opacity-90 max-w-sm mx-auto line-clamp-2">
              {title || "For outstanding achievement and participation"}
            </p>
          </div>

          {/* Bottom Row: Signatory & QR Footprint */}
          <div className="flex items-end justify-between pt-2 border-t border-current border-opacity-15 relative z-10 text-[10px]">
            <div>
              <div className="w-20 sm:w-28 border-b border-current opacity-40 mb-1" />
              <p className="font-bold">Authorized Signatory</p>
              <p className="opacity-60 text-[9px]">Exam Controller / Lead</p>
            </div>

            {/* Live Vector QR Placeholder */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="font-mono font-bold text-[10px]">{sampleId}</p>
                <p className="text-[9px] opacity-60">Scan to verify</p>
              </div>
              <div className="w-12 h-12 bg-white p-1 rounded-sm border border-hairline shadow-xs flex items-center justify-center">
                <QrCode className="w-10 h-10 text-slate-900" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

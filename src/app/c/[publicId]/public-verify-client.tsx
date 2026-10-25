"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Flag,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { submitAbuseReportAction } from "@/features/verification/actions";

interface PublicCertData {
  public_id: string;
  recipient_name: string;
  title: string;
  issued_at: string;
  status: "issued" | "revoked";
  revoked_at?: string | null;
  revoked_reason?: string | null;
  org_name: string;
  org_verified?: boolean;
  org_logo?: string | null;
  brand_color?: string | null;
  pdf_sha256?: string | null;
}

interface PublicVerifyClientProps {
  publicId: string;
  certificate: PublicCertData | null;
}

export function PublicVerifyClient({
  publicId,
  certificate,
}: PublicVerifyClientProps) {
  const { showToast } = useToast();
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<
    "fraudulent" | "incorrect_info" | "impersonation" | "offensive" | "other"
  >("fraudulent");
  const [reportDetails, setReportDetails] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleCopyFingerprint = () => {
    if (!certificate?.pdf_sha256) return;
    navigator.clipboard.writeText(certificate.pdf_sha256);
    setCopiedFingerprint(true);
    showToast({ title: "Copied", description: "SHA-256 fingerprint copied to clipboard.", variant: "success" });
    setTimeout(() => setCopiedFingerprint(false), 2000);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);

    try {
      await submitAbuseReportAction({
        publicId,
        reason: reportReason,
        details: reportDetails,
        contactEmail: reportEmail || undefined,
      });

      setReportModalOpen(false);
      showToast({
        title: "Report Submitted",
        description: "Thank you. Our compliance team and the issuing institution have been alerted.",
        variant: "success",
      });
    } catch {
      showToast({
        title: "Submission failed",
        description: "Could not submit report. Please try again later.",
        variant: "error",
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // 1. STATE: NOT FOUND
  if (!certificate) {
    return (
      <div className="w-full max-w-md bg-surface rounded-card border border-hairline p-8 text-center shadow-sm">
        <div className="w-14 h-14 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-bold text-ink mb-2">Certificate Not Found</h1>
        <p className="text-sm text-ink-secondary mb-6 leading-relaxed">
          We couldn&apos;t find a certificate registered with ID <strong className="font-mono text-ink">{publicId}</strong>.
          Please double check the ID for typos (e.g. 0 vs O, 1 vs I).
        </p>

        <div className="pt-4 border-t border-hairline">
          <a
            href="/verify"
            className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-control bg-accent text-surface text-sm font-semibold press-feedback"
          >
            <Search className="w-4 h-4" />
            <span>Search or Scan Another ID</span>
          </a>
        </div>
      </div>
    );
  }

  // 2. STATE: REVOKED
  if (certificate.status === "revoked") {
    const revokedDate = certificate.revoked_at
      ? new Date(certificate.revoked_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "an earlier date";

    return (
      <div className="w-full max-w-lg bg-surface rounded-card border border-danger/30 p-8 shadow-sm text-center">
        <div className="w-14 h-14 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <Badge variant="danger" className="mb-3">
          Certificate Revoked
        </Badge>

        <h1 className="text-2xl font-bold text-ink mb-2">
          This Certificate Has Been Revoked
        </h1>
        <p className="text-sm text-ink-secondary mb-6">
          This credential was revoked by <strong>{certificate.org_name}</strong> on {revokedDate}. It is no longer valid.
        </p>

        {certificate.revoked_reason && (
          <div className="p-4 rounded-control bg-canvas border border-hairline text-left text-sm mb-6">
            <span className="text-xs font-semibold text-ink-secondary block mb-1">
              Reason for Revocation:
            </span>
            <span className="text-ink">{certificate.revoked_reason}</span>
          </div>
        )}

        <div className="p-4 bg-canvas rounded-control text-xs text-ink-secondary space-y-1 font-mono text-left">
          <div>ID: {certificate.public_id}</div>
          <div>Issued to: {certificate.recipient_name}</div>
        </div>
      </div>
    );
  }

  // 3. STATE: VALID & VERIFIED
  const issuedDate = new Date(certificate.issued_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full max-w-xl">
      <div className="bg-surface rounded-card border border-hairline shadow-md overflow-hidden">
        {/* Verification Banner */}
        <div className="bg-seal/10 border-b border-seal/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-8 h-8 rounded-full bg-seal text-surface flex items-center justify-center shrink-0 shadow-sm"
            >
              <CheckCircle className="w-5 h-5 text-surface" />
            </motion.div>
            <div>
              <div className="text-sm font-bold text-seal flex items-center gap-1.5">
                <span>Verified Authentic</span>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs text-ink-secondary">
                CertiVault Cryptographic Trust Registry
              </div>
            </div>
          </div>

          <Badge variant="verified">Official Credential</Badge>
        </div>

        {/* Certificate Primary Information */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider block mb-1">
              Issued To
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              {certificate.recipient_name}
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-control bg-canvas border border-hairline">
            <div>
              <span className="text-xs text-ink-secondary block">Certificate Title</span>
              <span className="text-sm font-semibold text-ink">{certificate.title}</span>
            </div>
            <div>
              <span className="text-xs text-ink-secondary block">Issuing Organization</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-semibold text-ink">{certificate.org_name}</span>
                {certificate.org_verified && (
                  <CheckCircle className="w-3.5 h-3.5 text-seal shrink-0" />
                )}
              </div>
            </div>
            <div>
              <span className="text-xs text-ink-secondary block">Date of Issue</span>
              <span className="text-sm font-medium text-ink">{issuedDate}</span>
            </div>
            <div>
              <span className="text-xs text-ink-secondary block">Certificate ID</span>
              <span className="text-sm font-mono font-bold text-ink">{certificate.public_id}</span>
            </div>
          </div>

          {/* Cryptographic Document Fingerprint */}
          {certificate.pdf_sha256 && (
            <div className="p-3 bg-canvas/60 rounded-control border border-hairline text-xs flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="text-ink-secondary">SHA-256: </span>
                <span className="font-mono text-ink text-[11px] truncate">
                  {certificate.pdf_sha256}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyFingerprint}
                className="p-1.5 rounded-control text-ink-secondary hover:text-ink shrink-0 press-feedback"
                aria-label="Copy SHA-256 fingerprint"
              >
                {copiedFingerprint ? (
                  <Check className="w-3.5 h-3.5 text-seal" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={`/api/download?id=${certificate.public_id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-control bg-accent hover:bg-accent/90 text-surface text-sm font-semibold shadow-sm press-feedback"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </a>

            <Button
              variant="secondary"
              onClick={() => setReportModalOpen(true)}
              className="flex items-center justify-center gap-2"
            >
              <Flag className="w-4 h-4 text-ink-secondary" />
              <span>Report an Issue</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center mt-6 text-xs text-ink-secondary flex items-center justify-center gap-1.5">
        <span>Verified by</span>
        <a
          href="https://certivault.in"
          className="font-semibold text-ink hover:underline inline-flex items-center gap-0.5"
        >
          <span>CertiVault</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Abuse Report Dialog */}
      <Dialog
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        title="Report a Problem"
        description="Submit a report if this certificate contains fraudulent information, incorrect claims, or violates policies."
      >
        <form onSubmit={handleSubmitReport} className="space-y-4 py-2">
          <div>
            <label htmlFor="report-reason" className="text-xs font-semibold text-ink block mb-1">
              Reason for Report
            </label>
            <select
              id="report-reason"
              name="reportReason"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value as "fraudulent" | "incorrect_info" | "impersonation" | "offensive" | "other")}
              className="w-full h-10 px-3 text-sm rounded-control border border-hairline bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="fraudulent">Fraudulent or forged credential</option>
              <option value="incorrect_info">Incorrect name or completion details</option>
              <option value="impersonation">Identity impersonation</option>
              <option value="offensive">Inappropriate or offensive content</option>
              <option value="other">Other issue</option>
            </select>
          </div>

          <div>
            <label htmlFor="report-details" className="text-xs font-semibold text-ink block mb-1">
              Details (Optional)
            </label>
            <textarea
              id="report-details"
              name="reportDetails"
              rows={3}
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Provide any additional context or proof..."
              className="w-full p-2.5 text-xs rounded-control border border-hairline bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="report-email" className="text-xs font-semibold text-ink block mb-1">
              Your Email (Optional, for updates)
            </label>
            <input
              id="report-email"
              name="reportEmail"
              type="email"
              value={reportEmail}
              onChange={(e) => setReportEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-10 px-3 text-xs rounded-control border border-hairline bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setReportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmittingReport}>
              {isSubmittingReport ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

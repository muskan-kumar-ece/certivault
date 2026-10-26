"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Edit3,
  Eye,
  Mail,
  History,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  revokeCertificateAction,
  correctCertificateAction,
  resendCertificateAction,
} from "@/features/certificates/actions";

interface CertificateDetailProps {
  orgId: string;
  userRole: string;
  certificate: {
    id: string;
    public_id: string;
    recipient_name: string;
    recipient_email: string | null;
    status: string;
    email_status: string;
    error: string | null;
    issued_at: string | null;
    revoked_at: string | null;
    revoked_reason: string | null;
    show_revoked_reason: boolean;
    download_count: number;
    verify_count: number;
    pdf_path: string | null;
    pdf_sha256: string | null;
    data?: Record<string, unknown> | null;
    archived_pdfs?: Array<{ pdf_path: string; pdf_sha256: string; archived_at: string; recipient_name: string }> | null;
    created_at: string;
    batches?: { name: string } | null;
    templates?: { name: string; page_size?: string } | null;
  };
  previewPdfUrl: string | null;
}

export function CertificateDetailClientView({
  orgId,
  userRole,
  certificate,
  previewPdfUrl,
}: CertificateDetailProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Revoke Modal
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");
  const [showPublicReason, setShowPublicReason] = useState(false);
  const [notifyRecipient, setNotifyRecipient] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  // Correct Modal
  const [isCorrectOpen, setIsCorrectOpen] = useState(false);
  const [newName, setNewName] = useState(certificate.recipient_name);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const res = await resendCertificateAction(orgId, certificate.id);
      if (res.success) {
        showToast({ title: "Email Resent", description: "Certificate link delivered to recipient.", variant: "success" });
      } else {
        showToast({ title: "Delivery Error", description: res.message, variant: "error" });
      }
    } catch (err: unknown) {
      showToast({ title: "Resend Error", description: err instanceof Error ? err.message : "Failed to resend", variant: "error" });
    } finally {
      setIsResending(false);
    }
  };

  const canManage = ["owner", "admin"].includes(userRole);
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://certivault.venopai.in"}/c/${certificate.public_id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    showToast({ title: "Copied", description: "Public verification link copied to clipboard.", variant: "success" });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyHash = () => {
    if (!certificate.pdf_sha256) return;
    navigator.clipboard.writeText(certificate.pdf_sha256);
    setCopiedHash(true);
    showToast({ title: "Copied", description: "SHA-256 fingerprint copied to clipboard.", variant: "success" });
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Submit Revoke
  const handleConfirmRevoke = async () => {
    if (!revokeReason.trim()) return;
    setIsRevoking(true);
    try {
      await revokeCertificateAction(orgId, {
        certId: certificate.id,
        reason: revokeReason.trim(),
        showReason: showPublicReason,
        notifyRecipient,
      });

      showToast({
        title: "Certificate Revoked",
        description: "The credential status has been updated to revoked.",
        variant: "warning",
      });

      setIsRevokeOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to revoke";
      showToast({ title: "Revocation Error", description: msg, variant: "error" });
    } finally {
      setIsRevoking(false);
    }
  };

  // Submit Correction
  const handleConfirmCorrect = async () => {
    if (!newName.trim() || newName.trim() === certificate.recipient_name) return;
    setIsCorrecting(true);
    try {
      await correctCertificateAction(orgId, {
        certId: certificate.id,
        newRecipientName: newName.trim(),
      });

      showToast({
        title: "Certificate Reissued",
        description: "The certificate was re-rendered with updated details and archived.",
        variant: "success",
      });

      setIsCorrectOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Correction failed";
      showToast({ title: "Correction Error", description: msg, variant: "error" });
    } finally {
      setIsCorrecting(false);
    }
  };

  const isIssued = certificate.status === "issued";
  const isRevoked = certificate.status === "revoked";

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div>
        <Link
          href="/app/certificates"
          className="inline-flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Certificates</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-ink">{certificate.recipient_name}</h1>
              <Badge variant={isIssued ? "verified" : isRevoked ? "danger" : "warning"}>
                {certificate.status}
              </Badge>
            </div>
            <p className="text-xs text-ink-secondary font-mono mt-1">
              ID: <strong>{certificate.public_id}</strong>
              {certificate.batches?.name && ` · Batch: ${certificate.batches.name}`}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-4 h-4 text-verified" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? "Copied" : "Copy Link"}</span>
            </Button>

            <a href={`/api/download?id=${certificate.public_id}`} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </Button>
            </a>

            <a href={verifyUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4" />
                <span>Public Page</span>
              </Button>
            </a>

            {canManage && isIssued && certificate.recipient_email && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResendEmail}
                disabled={isResending}
                className="flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4" />
                <span>{isResending ? "Sending..." : "Resend Email"}</span>
              </Button>
            )}

            {canManage && isIssued && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCorrectOpen(true)}
                  className="flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Correct</span>
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsRevokeOpen(true)}
                  className="flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Revoke</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Revocation Banner */}
      {isRevoked && (
        <div className="p-4 rounded-card border border-danger/20 bg-danger/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-danger">Certificate Revoked</div>
              <div className="text-xs text-ink mt-0.5">
                This credential was revoked on {certificate.revoked_at ? new Date(certificate.revoked_at).toLocaleString() : "—"}.
              </div>
              {certificate.revoked_reason && (
                <div className="text-xs text-ink-secondary mt-1">
                  <strong>Reason:</strong> {certificate.revoked_reason}{" "}
                  {certificate.show_revoked_reason ? "(Visible publicly)" : "(Internal only)"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: PDF Preview & Document Fingerprint */}
        <div className="lg:col-span-2 space-y-6">
          {/* PDF Preview Container */}
          <div className="rounded-card border border-hairline bg-surface overflow-hidden shadow-sm">
            <div className="p-4 border-b border-hairline flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-ink-secondary" />
                <span className="text-xs font-semibold text-ink">Document Preview</span>
              </div>
              <span className="text-[11px] text-ink-secondary">
                {certificate.templates?.name || "Standard Template"}
              </span>
            </div>

            <div className="relative aspect-[1.414/1] w-full bg-canvas flex items-center justify-center p-4">
              {previewPdfUrl ? (
                <iframe
                  src={`${previewPdfUrl}#toolbar=0&navpanes=0`}
                  title="Certificate PDF Preview"
                  className="w-full h-full rounded border border-hairline shadow-sm"
                />
              ) : (
                <div className="text-center p-6 text-xs text-ink-secondary space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-ink-secondary/40" />
                  <p>Preview rendering unavailable or file pending generation.</p>
                </div>
              )}
            </div>
          </div>

          {/* Cryptographic SHA-256 Fingerprint */}
          <div className="p-4 rounded-card border border-hairline bg-surface">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-ink">Document Fingerprint (SHA-256)</span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-verified" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHash ? "Copied" : "Copy Hash"}</span>
              </button>
            </div>
            <p className="text-[11px] font-mono text-ink-secondary break-all bg-canvas p-2.5 rounded-control border border-hairline">
              {certificate.pdf_sha256 || "Pending cryptographic hash computation"}
            </p>
          </div>

          {/* Archived Prior Versions */}
          {certificate.archived_pdfs && certificate.archived_pdfs.length > 0 && (
            <div className="p-4 rounded-card border border-hairline bg-surface space-y-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-ink-secondary" />
                <span className="text-xs font-semibold text-ink">
                  Correction History ({certificate.archived_pdfs.length})
                </span>
              </div>
              <div className="divide-y divide-hairline">
                {certificate.archived_pdfs.map((arch, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-ink">Prior Name: {arch.recipient_name}</div>
                      <div className="text-[11px] text-ink-secondary font-mono">
                        Archived {new Date(arch.archived_at).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant="neutral">Version {idx + 1}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Status Timeline & Metadata */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <div className="p-5 rounded-card border border-hairline bg-surface space-y-4 shadow-sm">
            <h2 className="text-xs font-semibold text-ink uppercase tracking-wider">Lifecycle Timeline</h2>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-hairline">
              {/* Event 1: Creation */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-verified flex items-center justify-center text-white">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <div className="text-xs font-semibold text-ink">Certificate Issued</div>
                <div className="text-[11px] text-ink-secondary">
                  {certificate.issued_at ? new Date(certificate.issued_at).toLocaleString() : "Pending"}
                </div>
              </div>

              {/* Event 2: Email Delivery */}
              <div className="relative">
                <div
                  className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white ${
                    certificate.email_status === "delivered" || certificate.email_status === "sent"
                      ? "bg-verified"
                      : certificate.email_status === "bounced"
                      ? "bg-danger"
                      : "bg-hairline text-ink-secondary"
                  }`}
                >
                  <Mail className="w-2.5 h-2.5" />
                </div>
                <div className="text-xs font-semibold text-ink">
                  Email: {certificate.email_status.toUpperCase()}
                </div>
                <div className="text-[11px] text-ink-secondary font-mono">
                  {certificate.recipient_email || "No email mapped"}
                </div>
              </div>

              {/* Event 3: Downloads */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-accent flex items-center justify-center text-white">
                  <Download className="w-2.5 h-2.5" />
                </div>
                <div className="text-xs font-semibold text-ink">PDF Downloads</div>
                <div className="text-[11px] text-ink-secondary">
                  Downloaded {certificate.download_count} time(s)
                </div>
              </div>

              {/* Event 4: Verifications */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-accent flex items-center justify-center text-white">
                  <Eye className="w-2.5 h-2.5" />
                </div>
                <div className="text-xs font-semibold text-ink">Public Verifications</div>
                <div className="text-[11px] text-ink-secondary">
                  Viewed {certificate.verify_count} time(s)
                </div>
              </div>
            </div>
          </div>

          {/* Recipient & Metadata Card */}
          <div className="p-5 rounded-card border border-hairline bg-surface space-y-3 shadow-sm">
            <h2 className="text-xs font-semibold text-ink uppercase tracking-wider">Credential Details</h2>

            <div className="divide-y divide-hairline text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-ink-secondary">Recipient</span>
                <span className="font-semibold text-ink">{certificate.recipient_name}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-ink-secondary">Email</span>
                <span className="font-mono text-ink">{certificate.recipient_email || "—"}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-ink-secondary">Public ID</span>
                <span className="font-mono font-bold text-ink">{certificate.public_id}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-ink-secondary">Batch</span>
                <span className="text-ink">{certificate.batches?.name || "Single issuance"}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-ink-secondary">Template</span>
                <span className="text-ink">{certificate.templates?.name || "Standard"}</span>
              </div>

              {certificate.data &&
                Object.entries(certificate.data).map(([k, v]) => (
                  <div key={k} className="py-2 flex justify-between capitalize">
                    <span className="text-ink-secondary">{k.replace("_", " ")}</span>
                    <span className="text-ink font-medium">{String(v)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* REVOKE MODAL */}
      <Dialog
        open={isRevokeOpen}
        onOpenChange={setIsRevokeOpen}
        title="Revoke Certificate"
        description="Invalidates this certificate immediately. Public verification checks will report this credential as revoked."
      >
        <div className="space-y-4 py-2">
          <div>
            <label htmlFor="revoke-reason-textarea" className="text-xs font-semibold text-ink block mb-1">
              Revocation Reason (Required)
            </label>
            <textarea
              id="revoke-reason-textarea"
              name="revokeReason"
              rows={3}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="e.g. Identity discrepancy, course requirements unmet, forged submission..."
              className="w-full p-2.5 text-xs rounded-control border border-hairline bg-canvas text-ink placeholder:text-ink-secondary focus:outline-none focus:ring-2 focus:ring-danger"
            />
          </div>

          <label htmlFor="show-public-reason-checkbox" className="flex items-center gap-2 cursor-pointer">
            <input
              id="show-public-reason-checkbox"
              name="showPublicReason"
              type="checkbox"
              checked={showPublicReason}
              onChange={(e) => setShowPublicReason(e.target.checked)}
              className="rounded border-hairline text-danger focus:ring-danger"
            />
            <span className="text-xs text-ink">Show reason publicly on the verification page</span>
          </label>

          {certificate.recipient_email && (
            <label htmlFor="notify-recipient-checkbox" className="flex items-center gap-2 cursor-pointer">
              <input
                id="notify-recipient-checkbox"
                name="notifyRecipient"
                type="checkbox"
                checked={notifyRecipient}
                onChange={(e) => setNotifyRecipient(e.target.checked)}
                className="rounded border-hairline text-accent focus:ring-accent"
              />
              <span className="text-xs text-ink">
                Send revocation notification email to {certificate.recipient_email}
              </span>
            </label>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button variant="ghost" size="sm" onClick={() => setIsRevokeOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmRevoke}
              disabled={isRevoking || !revokeReason.trim()}
            >
              {isRevoking ? "Revoking..." : "Revoke Credential"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* CORRECT & REISSUE MODAL */}
      <Dialog
        open={isCorrectOpen}
        onOpenChange={setIsCorrectOpen}
        title="Correct & Reissue Certificate"
        description="Update recipient details without changing the public ID. The previous PDF will be securely archived."
      >
        <div className="space-y-4 py-2">
          <div>
            <label htmlFor="cert-correct-recipient-name" className="text-xs font-semibold text-ink block mb-1">
              Recipient Full Name
            </label>
            <input
              id="cert-correct-recipient-name"
              name="newName"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Corrected Name"
              autoComplete="off"
              className="w-full h-10 px-3 text-xs rounded-control border border-hairline bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-[11px] text-ink-secondary mt-1">
              Current: <span className="font-semibold">{certificate.recipient_name}</span>
            </p>
          </div>

          <div className="p-3 rounded-control bg-canvas border border-hairline text-[11px] text-ink-secondary">
            Note: Public ID <strong>{certificate.public_id}</strong> remains unchanged to protect verifiability. The previous PDF is archived in audit history.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button variant="ghost" size="sm" onClick={() => setIsCorrectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmCorrect}
              disabled={isCorrecting || !newName.trim() || newName.trim() === certificate.recipient_name}
            >
              {isCorrecting ? "Reissuing..." : "Reissue Certificate"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

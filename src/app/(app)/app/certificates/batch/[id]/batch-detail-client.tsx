"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  RotateCw,
  Search,
  AlertTriangle,
  Copy,
  Check,
  FileArchive,
  FileText,
  FileSpreadsheet,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { requestExportAction, retryFailedBatchAction } from "@/features/certificates/actions";

interface BatchInfo {
  id: string;
  name: string;
  status: string;
  total: number;
  generated: number;
  failed: number;
  delivered: number;
  delivery_mode: string;
  email_subject: string | null;
  created_at: string;
  completed_at: string | null;
  templates?: { name: string } | null;
}

interface CertificateInfo {
  id: string;
  public_id: string;
  recipient_name: string;
  recipient_email: string | null;
  status: string;
  email_status: string;
  error: string | null;
  issued_at: string | null;
  created_at: string;
  download_count: number;
  verify_count: number;
}

interface BatchDetailClientViewProps {
  orgId: string;
  userRole: string;
  batch: BatchInfo;
  certificates: CertificateInfo[];
}

export function BatchDetailClientView({
  orgId,
  userRole,
  batch,
  certificates,
}: BatchDetailClientViewProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Export Modal
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedKind, setSelectedKind] = useState<"zip" | "merged_pdf" | "report_csv" | "links_csv">("zip");
  const [isExporting, setIsExporting] = useState(false);

  // Retry Failed
  const [isRetrying, setIsRetrying] = useState(false);

  const canManage = ["owner", "admin", "issuer"].includes(userRole);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast({ title: "Copied", description: "Verification link copied to clipboard.", variant: "success" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Aggregate metrics
  const totalDownloads = useMemo(
    () => certificates.reduce((acc, c) => acc + (c.download_count || 0), 0),
    [certificates]
  );
  const totalViews = useMemo(
    () => certificates.reduce((acc, c) => acc + (c.verify_count || 0), 0),
    [certificates]
  );

  // Filter within batch
  const filteredCerts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return certificates;
    return certificates.filter(
      (c) =>
        c.recipient_name.toLowerCase().includes(q) ||
        c.public_id.toLowerCase().includes(q) ||
        (c.recipient_email && c.recipient_email.toLowerCase().includes(q))
    );
  }, [certificates, searchQuery]);

  // Handle Export Batch
  const handleTriggerExport = async () => {
    setIsExporting(true);
    try {
      await requestExportAction(orgId, {
        kind: selectedKind,
        batchId: batch.id,
      });

      showToast({
        title: "Export Enqueued",
        description: `Your ${selectedKind.toUpperCase()} export for this batch is queued.`,
        variant: "success",
      });

      setIsExportOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to queue export";
      showToast({ title: "Export Error", description: msg, variant: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Retry Failed
  const handleRetryFailed = async () => {
    setIsRetrying(true);
    try {
      const res = await retryFailedBatchAction(orgId, batch.id);
      showToast({
        title: "Retrying Failed Items",
        description: res.message,
        variant: "success",
      });
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to retry";
      showToast({ title: "Retry Error", description: msg, variant: "error" });
    } finally {
      setIsRetrying(false);
    }
  };

  const isComplete = batch.status === "completed";
  const hasErrors = batch.status === "completed_with_errors" || batch.failed > 0;

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
              <h1 className="text-2xl font-bold tracking-tight text-ink">{batch.name}</h1>
              <Badge
                variant={
                  isComplete ? "verified" : hasErrors ? "danger" : "warning"
                }
              >
                {batch.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-xs text-ink-secondary mt-1">
              Template: <strong>{batch.templates?.name || "Custom Template"}</strong> · Created{" "}
              {new Date(batch.created_at).toLocaleDateString()}
              {batch.completed_at && ` · Finished ${new Date(batch.completed_at).toLocaleTimeString()}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 font-semibold"
            >
              <Download className="w-4 h-4" />
              <span>Export Batch</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-card border border-hairline bg-surface text-center">
          <div className="text-xl font-bold text-ink">{batch.total}</div>
          <div className="text-[11px] text-ink-secondary uppercase mt-0.5">Total</div>
        </div>
        <div className="p-4 rounded-card border border-hairline bg-surface text-center">
          <div className="text-xl font-bold text-verified">{batch.generated}</div>
          <div className="text-[11px] text-ink-secondary uppercase mt-0.5">Issued</div>
        </div>
        <div className="p-4 rounded-card border border-hairline bg-surface text-center">
          <div className="text-xl font-bold text-ink">{batch.delivered}</div>
          <div className="text-[11px] text-ink-secondary uppercase mt-0.5">Delivered</div>
        </div>
        <div className="p-4 rounded-card border border-hairline bg-surface text-center">
          <div className={`text-xl font-bold ${batch.failed > 0 ? "text-danger" : "text-ink"}`}>
            {batch.failed}
          </div>
          <div className="text-[11px] text-ink-secondary uppercase mt-0.5">Failed</div>
        </div>
        <div className="p-4 rounded-card border border-hairline bg-surface text-center">
          <div className="text-xl font-bold text-ink">{totalDownloads}</div>
          <div className="text-[11px] text-ink-secondary uppercase mt-0.5">Downloads</div>
        </div>
        <div className="p-4 rounded-card border border-hairline bg-surface text-center">
          <div className="text-xl font-bold text-ink">{totalViews}</div>
          <div className="text-[11px] text-ink-secondary uppercase mt-0.5">Verifications</div>
        </div>
      </div>

      {/* Failed Items Banner with Retry */}
      {batch.failed > 0 && canManage && (
        <div className="p-4 rounded-card border border-danger/20 bg-danger/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-danger">
                {batch.failed} certificate(s) failed generation
              </div>
              <div className="text-[11px] text-ink-secondary mt-0.5">
                Credits for failed items were automatically refunded. Retrying charges zero additional credits.
              </div>
            </div>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleRetryFailed}
            disabled={isRetrying}
            className="flex items-center gap-1.5 flex-shrink-0"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
            <span>{isRetrying ? "Retrying..." : "Retry Failed Rows"}</span>
          </Button>
        </div>
      )}

      {/* Batch Certificates Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-ink-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="batch-recipient-search"
              name="search"
              aria-label="Search recipients in this batch"
              type="text"
              placeholder="Search recipients in this batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              className="w-full h-9 pl-9 pr-3 text-xs rounded-control border border-hairline bg-surface text-ink placeholder:text-ink-secondary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="text-xs text-ink-secondary">
            Showing <strong>{filteredCerts.length}</strong> of {certificates.length}
          </div>
        </div>

        <div className="rounded-card border border-hairline bg-surface overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-hairline bg-surface-prominent text-ink-secondary font-semibold">
                <th className="p-3">Public ID</th>
                <th className="p-3">Recipient Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Status</th>
                <th className="p-3">Downloads</th>
                <th className="p-3">Views</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredCerts.map((cert) => {
                const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://certivault.venopai.in"}/c/${cert.public_id}`;

                return (
                  <tr key={cert.id} className="hover:bg-surface-prominent/50 transition-colors">
                    <td className="p-3 font-mono font-medium text-ink">
                      <div className="flex items-center gap-1.5">
                        <span>{cert.public_id}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(verifyUrl, cert.public_id)}
                          className="text-ink-secondary hover:text-ink"
                          title="Copy verification link"
                        >
                          {copiedId === cert.public_id ? (
                            <Check className="w-3 h-3 text-verified" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-ink">{cert.recipient_name}</td>
                    <td className="p-3 text-ink-secondary font-mono">{cert.recipient_email || "—"}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          cert.status === "issued"
                            ? "verified"
                            : cert.status === "failed"
                            ? "danger"
                            : cert.status === "revoked"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {cert.status}
                      </Badge>
                      {cert.error && (
                        <div className="text-[10px] text-danger mt-0.5 max-w-xs truncate" title={cert.error}>
                          {cert.error}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-ink">{cert.download_count}</td>
                    <td className="p-3 text-ink">{cert.verify_count}</td>
                    <td className="p-3 text-right">
                      <Link href={`/app/certificates/${cert.id}`}>
                        <Button variant="secondary" size="sm" className="h-7 text-[11px] px-2.5">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXPORT BATCH MODAL */}
      <Dialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        title="Export Batch Credentials"
        description="Select the desired format to export certificates for this batch."
      >
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                kind: "zip" as const,
                title: "ZIP of PDFs",
                desc: "All certificate PDFs bundled into a single ZIP archive.",
                icon: FileArchive,
              },
              {
                kind: "merged_pdf" as const,
                title: "Print Merged PDF",
                desc: "Print-ready multi-page PDF containing all certificates.",
                icon: FileText,
              },
              {
                kind: "report_csv" as const,
                title: "Report CSV",
                desc: "Summary spreadsheet with status, names, and verify links.",
                icon: FileSpreadsheet,
              },
              {
                kind: "links_csv" as const,
                title: "Share Links CSV",
                desc: "Name and verification link list for mail merges.",
                icon: ExternalLink,
              },
            ].map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedKind === opt.kind;

              return (
                <button
                  key={opt.kind}
                  type="button"
                  onClick={() => setSelectedKind(opt.kind)}
                  className={`p-3 text-left rounded-control border transition-all ${
                    isSelected
                      ? "border-accent bg-accent/5 ring-1 ring-accent"
                      : "border-hairline bg-surface hover:bg-surface-prominent"
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${isSelected ? "text-accent" : "text-ink-secondary"}`} />
                  <div className="font-semibold text-xs text-ink">{opt.title}</div>
                  <div className="text-[10px] text-ink-secondary mt-0.5">{opt.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button variant="ghost" size="sm" onClick={() => setIsExportOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleTriggerExport}
              disabled={isExporting}
            >
              {isExporting ? "Starting..." : "Generate Export"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Download,
  Layers,
  FileSpreadsheet,
  FileArchive,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { requestExportAction, revokeCertificateAction } from "@/features/certificates/actions";

interface BatchItem {
  id: string;
  name: string;
  status: string;
  total: number;
  generated: number;
  failed: number;
  delivered: number;
  created_at: string;
  templates?: { name: string } | null;
}

interface CertificateItem {
  id: string;
  public_id: string;
  recipient_name: string;
  recipient_email: string | null;
  status: string;
  email_status: string;
  issued_at: string | null;
  created_at: string;
  batch_id: string | null;
  data?: Record<string, unknown> | null;
  batches?: { name: string } | null;
}

interface ExportItem {
  id: string;
  kind: string;
  status: string;
  parts: Array<{ path: string; sizeBytes: number; certificateCount: number; downloadUrl?: string }>;
  expires_at: string;
  created_at: string;
}

interface CertificatesClientViewProps {
  orgId: string;
  userRole: string;
  initialBatches: BatchItem[];
  initialCertificates: CertificateItem[];
  initialExports: ExportItem[];
}

export function CertificatesClientView({
  orgId,
  userRole,
  initialBatches,
  initialCertificates,
  initialExports,
}: CertificatesClientViewProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [tab, setTab] = useState<"batches" | "certificates">("batches");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCertIds, setSelectedCertIds] = useState<Set<string>>(new Set());

  // Exports Drawer / Modal
  const [isExportsOpen, setIsExportsOpen] = useState(false);
  const [isNewExportOpen, setIsNewExportOpen] = useState(false);
  const [selectedExportKind, setSelectedExportKind] = useState<"zip" | "merged_pdf" | "report_csv" | "links_csv">("zip");
  const [isSubmittingExport, setIsSubmittingExport] = useState(false);

  // Revoke Modal
  const [revokeModalCert, setRevokeModalCert] = useState<CertificateItem | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [showRevokeReason, setShowRevokeReason] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const canManage = ["owner", "admin", "issuer"].includes(userRole);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast({ title: "Copied", description: "Verification link copied to clipboard.", variant: "success" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter certificates
  const filteredCertificates = useMemo(() => {
    return initialCertificates.filter((cert) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cert.recipient_name.toLowerCase().includes(q) ||
        cert.public_id.toLowerCase().includes(q) ||
        (cert.recipient_email && cert.recipient_email.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" || cert.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [initialCertificates, searchQuery, statusFilter]);

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedCertIds.size === filteredCertificates.length) {
      setSelectedCertIds(new Set());
    } else {
      setSelectedCertIds(new Set(filteredCertificates.map((c) => c.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedCertIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCertIds(next);
  };

  // Handle Export Submission
  const handleTriggerExport = async () => {
    setIsSubmittingExport(true);
    try {
      const filter: Record<string, unknown> = {};
      if (selectedCertIds.size > 0) {
        filter.certificateIds = Array.from(selectedCertIds);
      } else if (statusFilter !== "all") {
        filter.status = statusFilter;
      }

      await requestExportAction(orgId, {
        kind: selectedExportKind,
        filter,
      });

      showToast({
        title: "Export Enqueued",
        description: `Your ${selectedExportKind.toUpperCase()} export is being prepared in the background.`,
        variant: "success",
      });

      setIsNewExportOpen(false);
      setIsExportsOpen(true);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to request export";
      showToast({ title: "Export Error", description: msg, variant: "error" });
    } finally {
      setIsSubmittingExport(false);
    }
  };

  // Handle Revoke Submission
  const handleConfirmRevoke = async () => {
    if (!revokeModalCert || !revokeReason.trim()) return;
    setIsRevoking(true);
    try {
      await revokeCertificateAction(orgId, {
        certId: revokeModalCert.id,
        reason: revokeReason.trim(),
        showReason: showRevokeReason,
        notifyRecipient: false,
      });

      showToast({
        title: "Certificate Revoked",
        description: `${revokeModalCert.public_id} was successfully revoked.`,
        variant: "warning",
      });

      setRevokeModalCert(null);
      setRevokeReason("");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Revocation failed";
      showToast({ title: "Revocation Failed", description: msg, variant: "error" });
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Certificates & Registry</h1>
          <p className="text-xs text-ink-secondary mt-1">
            Search, track, export, and manage your issued credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsExportsOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Archive className="w-4 h-4" />
            <span>Exports</span>
            {initialExports.filter((e) => e.status === "ready").length > 0 && (
              <span className="w-2 h-2 rounded-full bg-accent" />
            )}
          </Button>

          {canManage && (
            <Link href="/app/issue">
              <Button variant="primary" size="sm" className="flex items-center gap-1.5 font-semibold">
                <Plus className="w-4 h-4" />
                <span>Issue Batch</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Segmented Control */}
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <SegmentedControl
          options={[
            { value: "batches", label: `Batches (${initialBatches.length})` },
            { value: "certificates", label: `All Certificates (${initialCertificates.length})` },
          ]}
          value={tab}
          onChange={(val) => setTab(val as "batches" | "certificates")}
        />

        {tab === "certificates" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsNewExportOpen(true)}
            className="text-xs text-accent font-medium flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </Button>
        )}
      </div>

      {/* TAB 1: BATCHES VIEW */}
      {tab === "batches" && (
        <div>
          {initialBatches.length === 0 ? (
            <div className="p-12 text-center rounded-card border border-hairline bg-surface space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink">No Certificate Batches Yet</h3>
                <p className="text-xs text-ink-secondary max-w-sm mx-auto mt-1">
                  Upload a spreadsheet of recipients to issue your first batch of verifiable certificates.
                </p>
              </div>
              {canManage && (
                <Link href="/app/issue">
                  <Button variant="primary" size="sm" className="mt-2">
                    Issue Your First Batch
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {initialBatches.map((b) => {
                const isComplete = b.status === "completed";
                const hasErrors = b.status === "completed_with_errors" || b.failed > 0;
                const isGenerating = b.status === "generating" || b.status === "queued";

                return (
                  <Link
                    key={b.id}
                    href={`/app/certificates/batch/${b.id}`}
                    className="block group bg-surface rounded-card border border-hairline p-5 transition-all hover:border-hairline-prominent hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-ink text-sm group-hover:text-accent transition-colors">
                          {b.name}
                        </h3>
                        <p className="text-[11px] text-ink-secondary mt-0.5">
                          {b.templates?.name || "Custom Template"}
                        </p>
                      </div>

                      <Badge
                        variant={
                          isComplete ? "verified" : hasErrors ? "danger" : isGenerating ? "warning" : "neutral"
                        }
                      >
                        {b.status.replace("_", " ")}
                      </Badge>
                    </div>

                    {/* Counts Row */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-hairline text-center">
                      <div>
                        <div className="text-sm font-semibold text-ink">{b.total}</div>
                        <div className="text-[10px] text-ink-secondary uppercase">Total</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-verified">{b.generated}</div>
                        <div className="text-[10px] text-ink-secondary uppercase">Issued</div>
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${b.failed > 0 ? "text-danger" : "text-ink"}`}>
                          {b.failed}
                        </div>
                        <div className="text-[10px] text-ink-secondary uppercase">Failed</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-ink-secondary">
                      <span>{new Date(b.created_at).toLocaleDateString()}</span>
                      <span className="group-hover:translate-x-0.5 transition-transform text-accent">
                        View batch &rarr;
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL CERTIFICATES VIEW */}
      {tab === "certificates" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="cert-search-input"
                name="search"
                aria-label="Search certificates by recipient name, email, or ID"
                type="text"
                placeholder="Search by recipient name, email, or ID (e.g. CV-26-...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                className="w-full h-10 pl-9 pr-4 text-xs rounded-control border border-hairline bg-surface text-ink placeholder:text-ink-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["all", "issued", "revoked", "failed", "pending"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs rounded-control capitalize font-medium transition-colors ${
                    statusFilter === st
                      ? "bg-accent text-white"
                      : "bg-surface border border-hairline text-ink hover:bg-surface-prominent"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Selection Bar */}
          {selectedCertIds.size > 0 && (
            <div className="flex items-center justify-between p-3 rounded-control bg-accent/10 border border-accent/20">
              <div className="text-xs font-medium text-ink">
                <strong>{selectedCertIds.size}</strong> certificate(s) selected
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsNewExportOpen(true)}
                  className="h-8 text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Selected</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCertIds(new Set())}
                  className="h-8 text-xs"
                >
                  Deselect All
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          {filteredCertificates.length === 0 ? (
            <div className="p-12 text-center rounded-card border border-hairline bg-surface">
              <p className="text-xs text-ink-secondary">
                No certificates match your search and filter criteria.
              </p>
            </div>
          ) : (
            <div className="rounded-card border border-hairline bg-surface overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-hairline bg-surface-prominent text-ink-secondary font-semibold">
                    <th className="p-3 w-8">
                      <input
                        type="checkbox"
                        checked={
                          selectedCertIds.size > 0 &&
                          selectedCertIds.size === filteredCertificates.length
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-hairline text-accent focus:ring-accent"
                      />
                    </th>
                    <th className="p-3">Public ID</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Batch</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Issue Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {filteredCertificates.map((cert) => {
                    const isSelected = selectedCertIds.has(cert.id);
                    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://certivault.in"}/c/${cert.public_id}`;

                    return (
                      <tr
                        key={cert.id}
                        className={`hover:bg-surface-prominent/50 transition-colors ${
                          isSelected ? "bg-accent/5" : ""
                        }`}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(cert.id)}
                            className="rounded border-hairline text-accent focus:ring-accent"
                          />
                        </td>
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
                        <td className="p-3">
                          <div className="font-semibold text-ink">{cert.recipient_name}</div>
                          {cert.recipient_email && (
                            <div className="text-[11px] text-ink-secondary font-mono">
                              {cert.recipient_email}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-ink-secondary">
                          {cert.batches?.name || "Single issuance"}
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={
                              cert.status === "issued"
                                ? "verified"
                                : cert.status === "revoked"
                                ? "danger"
                                : cert.status === "failed"
                                ? "danger"
                                : "warning"
                            }
                          >
                            {cert.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-ink-secondary">
                          {cert.issued_at
                            ? new Date(cert.issued_at).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/app/certificates/${cert.id}`}>
                              <Button variant="secondary" size="sm" className="h-7 text-[11px] px-2.5">
                                Details
                              </Button>
                            </Link>

                            {cert.status === "issued" && canManage && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRevokeModalCert(cert)}
                                className="h-7 text-[11px] px-2 text-danger hover:text-danger hover:bg-danger/10"
                              >
                                Revoke
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* EXPORTS DRAWER / DIALOG */}
      <Dialog
        open={isExportsOpen}
        onOpenChange={setIsExportsOpen}
        title="Organization Exports"
        description="Download your bulk archives, merged print PDFs, and recipient reports. Exports expire after 7 days."
      >
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-secondary">Recent Exports ({initialExports.length})</span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsExportsOpen(false);
                setIsNewExportOpen(true);
              }}
              className="text-xs h-7"
            >
              New Export
            </Button>
          </div>

          {initialExports.length === 0 ? (
            <div className="p-8 text-center rounded-control bg-canvas border border-hairline text-xs text-ink-secondary">
              No exports have been generated yet.
            </div>
          ) : (
            <div className="divide-y divide-hairline max-h-80 overflow-y-auto">
              {initialExports.map((exp) => (
                <div key={exp.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs uppercase text-ink">
                        {exp.kind.replace("_", " ")}
                      </span>
                      <Badge
                        variant={
                          exp.status === "ready"
                            ? "verified"
                            : exp.status === "failed"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {exp.status}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-ink-secondary mt-0.5">
                      {new Date(exp.created_at).toLocaleString()} · Expires:{" "}
                      {new Date(exp.expires_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    {exp.status === "ready" && exp.parts && exp.parts.length > 0 && exp.parts[0].downloadUrl ? (
                      <a href={exp.parts[0].downloadUrl} download>
                        <Button variant="secondary" size="sm" className="h-7 text-xs flex items-center gap-1">
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </Button>
                      </a>
                    ) : (
                      <span className="text-[11px] text-ink-secondary capitalize">{exp.status}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Dialog>

      {/* NEW EXPORT DIALOG */}
      <Dialog
        open={isNewExportOpen}
        onOpenChange={setIsNewExportOpen}
        title="Create Bulk Export"
        description="Choose the export format for your certificates."
      >
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                kind: "zip" as const,
                title: "ZIP of PDFs",
                desc: "All certificate PDFs bundled into a compressed ZIP file.",
                icon: FileArchive,
              },
              {
                kind: "merged_pdf" as const,
                title: "Print Merged PDF",
                desc: "Single multi-page PDF ready for printing.",
                icon: FileText,
              },
              {
                kind: "report_csv" as const,
                title: "Report CSV",
                desc: "Detailed spreadsheet with names, IDs, statuses, and links.",
                icon: FileSpreadsheet,
              },
              {
                kind: "links_csv" as const,
                title: "Share Links CSV",
                desc: "Recipients and URLs for mail merges.",
                icon: ExternalLink,
              },
            ].map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedExportKind === opt.kind;

              return (
                <button
                  key={opt.kind}
                  type="button"
                  onClick={() => setSelectedExportKind(opt.kind)}
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

          {selectedCertIds.size > 0 && (
            <p className="text-xs text-verified font-medium">
              Exporting {selectedCertIds.size} selected certificate(s).
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button variant="ghost" size="sm" onClick={() => setIsNewExportOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleTriggerExport}
              disabled={isSubmittingExport}
            >
              {isSubmittingExport ? "Starting..." : "Generate Export"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* REVOKE MODAL */}
      <Dialog
        open={!!revokeModalCert}
        onOpenChange={(open) => !open && setRevokeModalCert(null)}
        title="Revoke Certificate"
        description="Revoking invalidates this credential. Verifiers visiting the verification link will immediately see a revoked status."
      >
        {revokeModalCert && (
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-control bg-canvas border border-hairline">
              <div className="text-xs font-semibold text-ink">{revokeModalCert.recipient_name}</div>
              <div className="text-xs font-mono text-ink-secondary mt-0.5">{revokeModalCert.public_id}</div>
            </div>

            <div>
              <label htmlFor="revoke-reason-input" className="text-xs font-semibold text-ink block mb-1">
                Revocation Reason (Required)
              </label>
              <textarea
                id="revoke-reason-input"
                name="revokeReason"
                rows={3}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Issued in error, failed required academic criteria, fraudulent submission..."
                className="w-full p-2.5 text-xs rounded-control border border-hairline bg-canvas text-ink placeholder:text-ink-secondary focus:outline-none focus:ring-2 focus:ring-danger"
              />
            </div>

            <label htmlFor="show-reason-checkbox" className="flex items-center gap-2 cursor-pointer">
              <input
                id="show-reason-checkbox"
                name="showRevokeReason"
                type="checkbox"
                checked={showRevokeReason}
                onChange={(e) => setShowRevokeReason(e.target.checked)}
                className="rounded border-hairline text-danger focus:ring-danger"
              />
              <span className="text-xs text-ink">Show reason publicly on the verification page</span>
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
              <Button variant="ghost" size="sm" onClick={() => setRevokeModalCert(null)}>
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
        )}
      </Dialog>
    </div>
  );
}

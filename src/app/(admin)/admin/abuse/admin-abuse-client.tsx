"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { resolveAbuseReportAction } from "@/features/admin/actions";

interface AbuseReportItem {
  id: string;
  certificate_id: string | null;
  public_id: string;
  reason: string;
  details: string | null;
  reporter_email: string | null;
  reporter_name: string | null;
  status: string;
  created_at: string;
}

export function AdminAbuseClient({
  initialReports,
}: {
  initialReports: AbuseReportItem[];
}) {
  const { showToast } = useToast();
  const [reports, setReports] = useState(initialReports);
  const [filter, setFilter] = useState<"pending" | "resolved" | "dismissed" | "all">("pending");

  // Revoke modal
  const [revokingReport, setRevokingReport] = useState<AbuseReportItem | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredReports = reports.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const handleDismiss = async (reportId: string) => {
    setIsProcessing(true);
    try {
      await resolveAbuseReportAction({
        reportId,
        action: "dismiss",
      });
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: "dismissed" } : r))
      );
      showToast({ title: "Report Dismissed", description: "The abuse report has been marked as dismissed.", variant: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      showToast({ title: "Failed", description: msg, variant: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!revokingReport) return;
    if (revokeReason.trim().length < 5) {
      showToast({ title: "Reason Required", description: "Minimum 5 characters.", variant: "error" });
      return;
    }

    setIsProcessing(true);
    try {
      await resolveAbuseReportAction({
        reportId: revokingReport.id,
        action: "revoke",
        reason: revokeReason.trim(),
      });
      setReports((prev) =>
        prev.map((r) => (r.id === revokingReport.id ? { ...r, status: "resolved" } : r))
      );
      showToast({
        title: "Certificate Revoked",
        description: `Certificate ${revokingReport.public_id} has been revoked and the report resolved.`,
        variant: "success",
      });
      setRevokingReport(null);
      setRevokeReason("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      showToast({ title: "Failed", description: msg, variant: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">Abuse Reports Queue</h1>
        <p className="text-sm text-ink-secondary mt-1">
          Review community and institutional reports submitted against public credentials.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
        {(
          [
            { id: "pending", label: "Pending Review" },
            { id: "resolved", label: "Resolved (Revoked)" },
            { id: "dismissed", label: "Dismissed" },
            { id: "all", label: "All Reports" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-control transition-all font-medium whitespace-nowrap press-feedback ${
              filter === tab.id
                ? "bg-accent text-white shadow-xs"
                : "bg-surface text-ink-secondary hover:text-ink border border-hairline"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="border border-hairline rounded-card overflow-hidden bg-surface shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas/50 border-b border-hairline text-ink-secondary font-medium uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Reported Certificate</th>
                <th className="px-4 py-3">Violation Reason</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Reporter</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reported At</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-ink-secondary">
                    No abuse reports in this category.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-canvas/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/c/${report.public_id}`}
                        target="_blank"
                        className="font-mono font-bold text-accent hover:underline inline-flex items-center gap-1 press-feedback"
                      >
                        {report.public_id}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge variant="danger" className="text-[10px] uppercase">
                        {report.reason.replace("_", " ")}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 max-w-xs truncate text-ink">
                      {report.details || <span className="text-ink-secondary italic">No details provided</span>}
                    </td>

                    <td className="px-4 py-3.5 text-ink-secondary">
                      {report.reporter_email ? (
                        <div>
                          <p className="text-ink font-medium">{report.reporter_name || "Anonymous"}</p>
                          <p className="text-[11px] font-mono">{report.reporter_email}</p>
                        </div>
                      ) : (
                        <span>Anonymous</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          report.status === "pending"
                            ? "danger"
                            : report.status === "resolved"
                            ? "verified"
                            : "neutral"
                        }
                        className="text-[10px]"
                      >
                        {report.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 text-ink-secondary text-[11px] tabular-nums">
                      {new Date(report.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {report.status === "pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDismiss(report.id)}
                            disabled={isProcessing}
                            className="text-[11px] px-2 py-1"
                          >
                            Dismiss
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setRevokingReport(report);
                              setRevokeReason(
                                `Revoked following abuse investigation (${report.reason.replace("_", " ")}).`
                              );
                            }}
                            disabled={isProcessing}
                            className="text-[11px] px-2 py-1"
                          >
                            Revoke
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-ink-secondary">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revocation Confirmation Dialog */}
      {revokingReport && (
        <Dialog
          open={true}
          onOpenChange={() => setRevokingReport(null)}
          title={`Revoke Certificate ${revokingReport.public_id}`}
          description="Revoking invalidates this certificate across all verification portals and flags it as revoked."
        >
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-control bg-canvas border border-hairline text-xs space-y-1">
              <p className="text-ink font-semibold">Report Reason: {revokingReport.reason}</p>
              <p className="text-ink-secondary">{revokingReport.details}</p>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                Official Public Revocation Reason
              </label>
              <textarea
                rows={3}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full text-sm p-3 rounded-control bg-canvas border border-hairline text-ink focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-hairline">
              <Button variant="secondary" onClick={() => setRevokingReport(null)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmRevoke} disabled={isProcessing}>
                {isProcessing ? "Revoking..." : "Confirm & Revoke Certificate"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

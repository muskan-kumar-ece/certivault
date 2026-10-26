"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  BadgeCheck,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import {
  getAdminOrgsAction,
  adjustCreditsAction,
  toggleOrgSuspensionAction,
} from "@/features/admin/actions";

interface OrgItem {
  id: string;
  name: string;
  slug: string;
  kind: string;
  plan: string;
  credit_balance: number;
  verified: boolean;
  verification_status: string;
  suspended_at: string | null;
  created_at: string;
}

interface AdminStats {
  totalOrgs: number;
  activeOrgs: number;
  suspendedOrgs: number;
  pendingVerifications: number;
  pendingAbuseReports: number;
  totalCertificates: number;
  totalRevenueInr: number;
}

export function AdminClient({
  stats,
  initialOrgs,
}: {
  stats: AdminStats;
  initialOrgs: OrgItem[];
}) {
  const { showToast } = useToast();
  const [orgs, setOrgs] = useState<OrgItem[]>(initialOrgs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "suspended" | "verified" | "pending_verification"
  >("all");
  const [isPending, startTransition] = useTransition();

  // Credit adjustment modal state
  const [creditModalOrg, setCreditModalOrg] = useState<OrgItem | null>(null);
  const [creditDelta, setCreditDelta] = useState<number>(100);
  const [creditReason, setCreditReason] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Suspension modal state
  const [suspendModalOrg, setSuspendModalOrg] = useState<OrgItem | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [isSuspending, setIsSuspending] = useState(false);

  // Refetch orgs with filters
  const handleFilterChange = (
    newStatus: "all" | "active" | "suspended" | "verified" | "pending_verification"
  ) => {
    setStatusFilter(newStatus);
    startTransition(async () => {
      try {
        const updated = await getAdminOrgsAction({
          search: search || undefined,
          status: newStatus,
        });
        setOrgs(updated as OrgItem[]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to filter";
        showToast({ title: "Filter Error", description: msg, variant: "error" });
      }
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const updated = await getAdminOrgsAction({
          search: search || undefined,
          status: statusFilter,
        });
        setOrgs(updated as OrgItem[]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Search failed";
        showToast({ title: "Search Error", description: msg, variant: "error" });
      }
    });
  };

  // Adjust credits
  const handleAdjustCredits = async () => {
    if (!creditModalOrg) return;
    if (creditDelta === 0) {
      showToast({ title: "Invalid Amount", description: "Credit amount cannot be zero.", variant: "error" });
      return;
    }
    if (creditReason.trim().length < 3) {
      showToast({ title: "Reason Required", description: "Please provide a valid reason (min 3 chars).", variant: "error" });
      return;
    }

    setIsAdjusting(true);
    try {
      const res = await adjustCreditsAction({
        orgId: creditModalOrg.id,
        delta: creditDelta,
        reason: creditReason.trim(),
      });

      // Update local state
      setOrgs((prev) =>
        prev.map((o) => (o.id === creditModalOrg.id ? { ...o, credit_balance: res.newBalance } : o))
      );

      showToast({
        title: "Credits Adjusted",
        description: `Successfully updated balance for ${creditModalOrg.name} to ${res.newBalance} credits.`,
        variant: "success",
      });
      setCreditModalOrg(null);
      setCreditReason("");
      setCreditDelta(100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Adjustment failed";
      showToast({ title: "Adjustment Failed", description: msg, variant: "error" });
    } finally {
      setIsAdjusting(false);
    }
  };

  // Toggle suspension
  const handleToggleSuspension = async () => {
    if (!suspendModalOrg) return;
    const willSuspend = !suspendModalOrg.suspended_at;

    if (suspendReason.trim().length < 3) {
      showToast({ title: "Reason Required", description: "Please explain the reason for this action.", variant: "error" });
      return;
    }

    setIsSuspending(true);
    try {
      const res = await toggleOrgSuspensionAction({
        orgId: suspendModalOrg.id,
        suspend: willSuspend,
        reason: suspendReason.trim(),
      });

      setOrgs((prev) =>
        prev.map((o) => (o.id === suspendModalOrg.id ? { ...o, suspended_at: res.suspendedAt } : o))
      );

      showToast({
        title: willSuspend ? "Organization Suspended" : "Suspension Lifted",
        description: willSuspend
          ? `${suspendModalOrg.name} has been suspended. Issuance is disabled.`
          : `${suspendModalOrg.name} is now active.`,
        variant: "success",
      });
      setSuspendModalOrg(null);
      setSuspendReason("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      showToast({ title: "Action Failed", description: msg, variant: "error" });
    } finally {
      setIsSuspending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Platform Operations</h1>
        <p className="text-sm text-ink-secondary mt-1">
          Monitor system tenants, manage manual credit allotments, and enforce compliance.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-card border border-hairline bg-surface space-y-1">
          <p className="text-xs font-medium text-ink-secondary">Total Orgs</p>
          <p className="text-2xl font-bold tabular-nums text-ink">{stats.totalOrgs}</p>
          <p className="text-[11px] text-ink-secondary">{stats.activeOrgs} active</p>
        </div>

        <div className="p-4 rounded-card border border-hairline bg-surface space-y-1">
          <p className="text-xs font-medium text-ink-secondary">Certificates</p>
          <p className="text-2xl font-bold tabular-nums text-ink">{stats.totalCertificates}</p>
          <p className="text-[11px] text-ink-secondary">Issued across platform</p>
        </div>

        <div className="p-4 rounded-card border border-hairline bg-surface space-y-1">
          <p className="text-xs font-medium text-ink-secondary">Platform Revenue</p>
          <p className="text-2xl font-bold tabular-nums text-ink">₹{stats.totalRevenueInr.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-ink-secondary">Paid transactions</p>
        </div>

        <Link
          href="/admin/verifications"
          className="p-4 rounded-card border border-hairline bg-surface hover:bg-surface-raised transition-all space-y-1 block press-feedback"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-ink-secondary">Verifications</p>
            {stats.pendingVerifications > 0 && (
              <span className="w-2 h-2 rounded-full bg-verified animate-ping" />
            )}
          </div>
          <p className="text-2xl font-bold tabular-nums text-verified">{stats.pendingVerifications}</p>
          <p className="text-[11px] text-ink-secondary">Pending review</p>
        </Link>

        <Link
          href="/admin/abuse"
          className="p-4 rounded-card border border-hairline bg-surface hover:bg-surface-raised transition-all space-y-1 block press-feedback"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-ink-secondary">Abuse Queue</p>
            {stats.pendingAbuseReports > 0 && (
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
            )}
          </div>
          <p className="text-2xl font-bold tabular-nums text-accent">{stats.pendingAbuseReports}</p>
          <p className="text-[11px] text-ink-secondary">Reports awaiting action</p>
        </Link>

        <div className="p-4 rounded-card border border-hairline bg-surface space-y-1">
          <p className="text-xs font-medium text-ink-secondary">Suspended Orgs</p>
          <p className="text-2xl font-bold tabular-nums text-ink">{stats.suspendedOrgs}</p>
          <p className="text-[11px] text-ink-secondary">Issuance locked</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {(
            [
              { id: "all", label: "All Orgs" },
              { id: "active", label: "Active" },
              { id: "suspended", label: "Suspended" },
              { id: "verified", label: "Verified" },
              { id: "pending_verification", label: "Verification Requests" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleFilterChange(tab.id)}
              className={`px-3 py-1.5 rounded-control transition-all font-medium whitespace-nowrap press-feedback ${
                statusFilter === tab.id
                  ? "bg-accent text-white shadow-xs"
                  : "bg-surface text-ink-secondary hover:text-ink border border-hairline"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-ink-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="admin-org-search"
              name="search"
              aria-label="Search organizations"
              type="text"
              placeholder="Search org or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-control bg-surface border border-hairline text-ink focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
            {isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Search"}
          </Button>
        </form>
      </div>

      {/* Organizations Table */}
      <div className="border border-hairline rounded-card overflow-hidden bg-surface shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas/50 border-b border-hairline text-ink-secondary font-medium uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3 text-right">Credits</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {orgs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-ink-secondary">
                    No organizations match the selected filter.
                  </td>
                </tr>
              ) : (
                orgs.map((org) => (
                  <tr key={org.id} className="hover:bg-canvas/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-ink flex items-center gap-1.5">
                        <Link
                          href={`/admin/orgs/${org.id}`}
                          className="hover:text-accent hover:underline flex items-center gap-1 press-feedback"
                        >
                          {org.name}
                        </Link>
                        {org.verified && (
                          <BadgeCheck className="w-3.5 h-3.5 text-verified flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-ink-secondary font-mono">{org.slug}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge variant="neutral" className="uppercase text-[10px]">
                        {org.plan}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold tabular-nums text-ink">
                      {org.credit_balance.toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3.5">
                      {org.suspended_at ? (
                        <Badge variant="danger" className="text-[10px]">
                          Suspended
                        </Badge>
                      ) : (
                        <Badge variant="verified" className="text-[10px]">
                          Active
                        </Badge>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {org.verified ? (
                        <span className="inline-flex items-center gap-1 text-verified font-medium text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : org.verification_status === "pending" ? (
                        <Badge variant="danger" className="text-[10px]">
                          Pending Review
                        </Badge>
                      ) : (
                        <span className="text-ink-secondary text-[11px]">Unverified</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-ink-secondary text-[11px] tabular-nums">
                      {new Date(org.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setCreditModalOrg(org)}
                          className="min-h-[36px] px-2.5 py-1.5 rounded-control border border-hairline bg-surface hover:bg-surface-raised text-[11px] font-medium text-ink press-feedback"
                        >
                          Credits
                        </button>

                        <button
                          onClick={() => setSuspendModalOrg(org)}
                          className={`min-h-[36px] px-2.5 py-1.5 rounded-control border text-[11px] font-medium press-feedback ${
                            org.suspended_at
                              ? "border-hairline bg-surface text-ink hover:bg-surface-raised"
                              : "border-hairline bg-surface text-accent hover:bg-surface-raised"
                          }`}
                        >
                          {org.suspended_at ? "Unsuspend" : "Suspend"}
                        </button>

                        <Link
                          href={`/admin/orgs/${org.id}`}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center p-1 rounded-control text-ink-secondary hover:text-ink hover:bg-surface-raised press-feedback"
                          title="View detail"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Credits Modal */}
      {creditModalOrg && (
        <Dialog
          open={true}
          onOpenChange={() => setCreditModalOrg(null)}
          title={`Adjust Credits — ${creditModalOrg.name}`}
          description="Grant or deduct balance for institutional bank transfers or manual billing adjustments."
        >
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-control bg-canvas border border-hairline flex items-center justify-between text-xs">
              <span className="text-ink-secondary">Current Balance:</span>
              <span className="font-bold tabular-nums text-ink">
                {creditModalOrg.credit_balance} credits
              </span>
            </div>

            <Field
              label="Credit Adjustment Delta"
              helperText="Positive to add credits (e.g. 500), negative to deduct (e.g. -100)."
              type="number"
              value={creditDelta}
              onChange={(e) => setCreditDelta(parseInt(e.target.value, 10) || 0)}
            />

            <Field
              label="Reason / Purchase Order Ref"
              helperText="Required for compliance audit trail."
              type="text"
              placeholder="e.g. Bank transfer PO #2026-IITB-004 received"
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
            />

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-hairline">
              <Button variant="secondary" onClick={() => setCreditModalOrg(null)} disabled={isAdjusting}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAdjustCredits} disabled={isAdjusting}>
                {isAdjusting ? "Saving..." : "Apply Adjustment"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Suspend / Unsuspend Modal */}
      {suspendModalOrg && (
        <Dialog
          open={true}
          onOpenChange={() => setSuspendModalOrg(null)}
          title={suspendModalOrg.suspended_at ? `Unsuspend ${suspendModalOrg.name}` : `Suspend ${suspendModalOrg.name}`}
          description={
            suspendModalOrg.suspended_at
              ? "Restoring this organization will re-enable certificate generation and delivery."
              : "Suspension blocks new batch creations, drafts, and issuance immediately. Existing public verification links remain operational."
          }
        >
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                Action Justification
              </label>
              <textarea
                rows={3}
                placeholder="Reason for suspension or reinstatement..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full text-sm p-3 rounded-control bg-canvas border border-hairline text-ink focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-hairline">
              <Button variant="secondary" onClick={() => setSuspendModalOrg(null)} disabled={isSuspending}>
                Cancel
              </Button>
              <Button
                variant={suspendModalOrg.suspended_at ? "primary" : "destructive"}
                onClick={handleToggleSuspension}
                disabled={isSuspending}
              >
                {isSuspending ? "Updating..." : suspendModalOrg.suspended_at ? "Confirm Reinstatement" : "Confirm Suspension"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

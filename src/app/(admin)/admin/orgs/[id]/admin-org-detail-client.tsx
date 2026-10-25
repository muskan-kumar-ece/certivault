"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Coins,
  Clock,
  Receipt,
  Users,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import {
  adjustCreditsAction,
  toggleOrgSuspensionAction,
  reviewVerificationRequestAction,
} from "@/features/admin/actions";

interface OrgDetailData {
  org: Record<string, unknown>;
  members: Array<Record<string, unknown>>;
  batches: Array<Record<string, unknown>>;
  payments: Array<Record<string, unknown>>;
  auditLogs: Array<Record<string, unknown>>;
}

export function AdminOrgDetailClient({ orgData }: { orgData: OrgDetailData }) {
  const { showToast } = useToast();
  const [org, setOrg] = useState(orgData.org);

  // Modals state
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditDelta, setCreditDelta] = useState(500);
  const [creditReason, setCreditReason] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);

  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [isSuspending, setIsSuspending] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);

  const handleAdjustCredits = async () => {
    if (creditDelta === 0) return;
    if (creditReason.trim().length < 3) {
      showToast({ title: "Reason Required", description: "Minimum 3 characters.", variant: "error" });
      return;
    }

    setIsAdjusting(true);
    try {
      const res = await adjustCreditsAction({
        orgId: org.id as string,
        delta: creditDelta,
        reason: creditReason.trim(),
      });
      setOrg((prev) => ({ ...prev, credit_balance: res.newBalance }));
      showToast({ title: "Credits Adjusted", description: `New balance is ${res.newBalance} credits.`, variant: "success" });
      setShowCreditModal(false);
      setCreditReason("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      showToast({ title: "Failed", description: msg, variant: "error" });
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleToggleSuspension = async () => {
    const willSuspend = !org.suspended_at;
    if (suspendReason.trim().length < 3) {
      showToast({ title: "Reason Required", description: "Please explain the reason.", variant: "error" });
      return;
    }

    setIsSuspending(true);
    try {
      const res = await toggleOrgSuspensionAction({
        orgId: org.id as string,
        suspend: willSuspend,
        reason: suspendReason.trim(),
      });
      setOrg((prev) => ({ ...prev, suspended_at: res.suspendedAt }));
      showToast({
        title: willSuspend ? "Organization Suspended" : "Suspension Lifted",
        description: willSuspend ? "Issuance disabled." : "Organization active.",
        variant: "success",
      });
      setShowSuspendModal(false);
      setSuspendReason("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      showToast({ title: "Failed", description: msg, variant: "error" });
    } finally {
      setIsSuspending(false);
    }
  };

  const handleReviewVerification = async (approve: boolean) => {
    setIsVerifying(true);
    try {
      await reviewVerificationRequestAction({
        orgId: org.id as string,
        approve,
        notes: approve ? "Approved via admin console" : "Rejected via admin console",
      });
      setOrg((prev) => ({
        ...prev,
        verified: approve,
        verification_status: approve ? "approved" : "rejected",
      }));
      showToast({
        title: approve ? "Issuer Verified" : "Request Rejected",
        description: approve
          ? "Verified issuer badge is now active on public certificates."
          : "Verification request declined.",
        variant: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      showToast({ title: "Failed", description: msg, variant: "error" });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back link */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink transition-colors mb-4 press-feedback"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Organizations</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                {org.name as string}
              </h1>
              {org.verified ? (
                <Badge variant="verified" className="text-xs">
                  <BadgeCheck className="w-3.5 h-3.5 mr-1" />
                  Verified Issuer
                </Badge>
              ) : null}
              {org.suspended_at ? (
                <Badge variant="danger" className="text-xs">
                  Suspended
                </Badge>
              ) : null}
            </div>
            <p className="text-xs font-mono text-ink-secondary mt-1">
              slug: {org.slug as string} · ID: {org.id as string}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCreditModal(true)}
              className="text-xs"
            >
              <Coins className="w-3.5 h-3.5 mr-1 text-accent" />
              Adjust Credits
            </Button>

            <Button
              variant={org.suspended_at ? "secondary" : "destructive"}
              size="sm"
              onClick={() => setShowSuspendModal(true)}
              className="text-xs"
            >
              {org.suspended_at ? "Unsuspend Org" : "Suspend Org"}
            </Button>
          </div>
        </div>
      </div>

      {/* Verification Action Bar (if pending) */}
      {org.verification_status === "pending" && (
        <div className="p-4 rounded-card border border-verified/30 bg-verified/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-sm text-ink">
              <BadgeCheck className="w-4 h-4 text-verified" />
              <span>Verified Issuer Review Pending</span>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              This organization submitted a formal request for verification accreditation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleReviewVerification(false)}
              disabled={isVerifying}
              className="text-xs"
            >
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleReviewVerification(true)}
              disabled={isVerifying}
              className="text-xs bg-verified hover:bg-verified-hover text-white"
            >
              Approve Badge
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-card border border-hairline bg-surface space-y-1">
          <p className="text-xs text-ink-secondary">Plan</p>
          <p className="text-xl font-bold uppercase text-ink">{org.plan as string}</p>
        </div>

        <div className="p-4 rounded-card border border-hairline bg-surface space-y-1">
          <p className="text-xs text-ink-secondary">Credit Balance</p>
          <p className="text-xl font-bold tabular-nums text-accent">
            {Number(org.credit_balance).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="p-4 rounded-card border border-hairline bg-surface space-y-1">
          <p className="text-xs text-ink-secondary">Total Batches</p>
          <p className="text-xl font-bold tabular-nums text-ink">{orgData.batches.length}</p>
        </div>

        <div className="p-4 rounded-card border border-hairline bg-surface space-y-1">
          <p className="text-xs text-ink-secondary">Team Members</p>
          <p className="text-xl font-bold tabular-nums text-ink">{orgData.members.length}</p>
        </div>
      </div>

      {/* Two Column Layout: Members & Recent Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members */}
        <div className="p-5 rounded-card border border-hairline bg-surface space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-ink border-b border-hairline pb-3">
            <Users className="w-4 h-4 text-accent" />
            <span>Organization Members ({orgData.members.length})</span>
          </div>
          <div className="divide-y divide-hairline">
            {orgData.members.map((m) => (
              <div key={m.user_id as string} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-mono text-ink text-[11px]">{m.user_id as string}</p>
                  <p className="text-ink-secondary text-[10px]">
                    Joined: {new Date(m.created_at as string).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <Badge variant="neutral" className="uppercase text-[10px]">
                  {m.role as string}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Batches */}
        <div className="p-5 rounded-card border border-hairline bg-surface space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-ink border-b border-hairline pb-3">
            <Layers className="w-4 h-4 text-accent" />
            <span>Recent Issuance Batches ({orgData.batches.length})</span>
          </div>
          <div className="divide-y divide-hairline">
            {orgData.batches.length === 0 ? (
              <p className="text-xs text-ink-secondary py-4">No batches issued yet.</p>
            ) : (
              orgData.batches.map((b) => (
                <div key={b.id as string} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-ink">{b.name as string}</p>
                    <p className="text-ink-secondary text-[11px] tabular-nums">
                      {b.generated as number}/{b.total as number} generated
                    </p>
                  </div>
                  <Badge
                    variant={b.status === "completed" ? "verified" : b.status === "failed" ? "danger" : "neutral"}
                    className="text-[10px]"
                  >
                    {b.status as string}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="p-5 rounded-card border border-hairline bg-surface space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-ink border-b border-hairline pb-3">
          <Receipt className="w-4 h-4 text-accent" />
          <span>Payment Transactions ({orgData.payments.length})</span>
        </div>
        <div className="divide-y divide-hairline">
          {orgData.payments.length === 0 ? (
            <p className="text-xs text-ink-secondary py-4">No payment transactions recorded.</p>
          ) : (
            orgData.payments.map((p) => (
              <div key={p.id as string} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-mono text-ink text-[11px]">{(p.payment_id as string) || (p.id as string)}</p>
                  <p className="text-ink-secondary text-[10px]">
                    {new Date(p.created_at as string).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold tabular-nums text-ink">
                    ₹{(Number(p.amount) / 100).toLocaleString("en-IN")}
                  </p>
                  <Badge variant={p.status === "paid" ? "verified" : "danger"} className="text-[10px]">
                    {p.status as string}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Compliance Audit Trail */}
      <div className="p-5 rounded-card border border-hairline bg-surface space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-ink border-b border-hairline pb-3">
          <Clock className="w-4 h-4 text-accent" />
          <span>Compliance Audit Trail (Last 15 Events)</span>
        </div>
        <div className="divide-y divide-hairline">
          {orgData.auditLogs.map((log) => (
            <div key={log.id as string} className="py-2.5 flex items-start justify-between text-xs">
              <div>
                <p className="font-semibold text-ink font-mono text-[11px]">{log.action as string}</p>
                <p className="text-ink-secondary text-[10px]">
                  Actor: <span className="font-mono">{log.actor_id as string}</span> · Entity: {(log.entity_type as string) || "org"}
                </p>
              </div>
              <span className="text-[10px] text-ink-secondary tabular-nums whitespace-nowrap">
                {new Date(log.created_at as string).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Adjust Credits Modal */}
      {showCreditModal && (
        <Dialog
          open={true}
          onOpenChange={() => setShowCreditModal(false)}
          title="Adjust Organization Credits"
          description="Manual ledger adjustment with immutable compliance logging."
        >
          <div className="space-y-4 pt-2">
            <Field
              label="Adjustment Delta"
              helperText="Positive to grant credits, negative to deduct."
              type="number"
              value={creditDelta}
              onChange={(e) => setCreditDelta(parseInt(e.target.value, 10) || 0)}
            />

            <Field
              label="Reason / Documentation Reference"
              helperText="Required for audit compliance."
              type="text"
              placeholder="e.g. Offline NEFT payment reconciliation"
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
            />

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-hairline">
              <Button variant="secondary" onClick={() => setShowCreditModal(false)} disabled={isAdjusting}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAdjustCredits} disabled={isAdjusting}>
                {isAdjusting ? "Applying..." : "Confirm Adjustment"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <Dialog
          open={true}
          onOpenChange={() => setShowSuspendModal(false)}
          title={org.suspended_at ? "Unsuspend Organization" : "Suspend Organization"}
          description={
            org.suspended_at
              ? "This will re-enable drafting and issuance for this organization."
              : "Suspension immediately halts issuance, email delivery, and batch processing."
          }
        >
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                Audit Reason
              </label>
              <textarea
                rows={3}
                placeholder="Reason..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full text-sm p-3 rounded-control bg-canvas border border-hairline text-ink focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-hairline">
              <Button variant="secondary" onClick={() => setShowSuspendModal(false)} disabled={isSuspending}>
                Cancel
              </Button>
              <Button
                variant={org.suspended_at ? "primary" : "destructive"}
                onClick={handleToggleSuspension}
                disabled={isSuspending}
              >
                {isSuspending ? "Saving..." : org.suspended_at ? "Unsuspend" : "Suspend"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

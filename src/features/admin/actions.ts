"use server";

import { requirePlatformAdmin, audit } from "@/server/auth";
import { adminClient } from "@/server/admin";
import { applyCreditDelta } from "@/server/payments";
import {
  adjustCreditsSchema,
  toggleSuspensionSchema,
  reviewVerificationSchema,
  resolveAbuseReportSchema,
  type AdjustCreditsInput,
  type ToggleSuspensionInput,
  type ReviewVerificationInput,
  type ResolveAbuseReportInput,
} from "@/lib/schemas/admin";

export async function getAdminStatsAction() {
  await requirePlatformAdmin();
  const admin = adminClient();

  // 1. Total orgs count
  const { count: totalOrgs } = await admin
    .from("orgs")
    .select("*", { count: "exact", head: true });

  // 2. Suspended orgs count
  const { count: suspendedOrgs } = await admin
    .from("orgs")
    .select("*", { count: "exact", head: true })
    .not("suspended_at", "is", null);

  // 3. Pending verifications count
  const { count: pendingVerifications } = await admin
    .from("orgs")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "pending");

  // 4. Pending abuse reports count
  const { count: pendingAbuseReports } = await admin
    .from("abuse_reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  // 5. Total certificates issued
  const { count: totalCertificates } = await admin
    .from("certificates")
    .select("*", { count: "exact", head: true })
    .eq("status", "issued");

  // 6. Total revenue in paise from paid payments
  const { data: paidPayments } = await admin
    .from("payments")
    .select("amount_paise")
    .eq("status", "paid");

  const totalPaise = (paidPayments || []).reduce((acc, p) => acc + (p.amount_paise || 0), 0);

  return {
    totalOrgs: totalOrgs || 0,
    activeOrgs: (totalOrgs || 0) - (suspendedOrgs || 0),
    suspendedOrgs: suspendedOrgs || 0,
    pendingVerifications: pendingVerifications || 0,
    pendingAbuseReports: pendingAbuseReports || 0,
    totalCertificates: totalCertificates || 0,
    totalRevenueInr: Math.round(totalPaise / 100),
  };
}

export async function getAdminOrgsAction(filters: {
  search?: string;
  status?: "all" | "active" | "suspended" | "verified" | "pending_verification";
  plan?: string;
} = {}) {
  await requirePlatformAdmin();
  const admin = adminClient();

  let query = admin
    .from("orgs")
    .select(`
      id,
      name,
      slug,
      kind,
      plan,
      credit_balance,
      verified,
      verification_status,
      suspended_at,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (filters.search) {
    const s = filters.search.trim();
    query = query.or(`name.ilike.%${s}%,slug.ilike.%${s}%`);
  }

  if (filters.plan && filters.plan !== "all") {
    query = query.eq("plan", filters.plan);
  }

  if (filters.status === "suspended") {
    query = query.not("suspended_at", "is", null);
  } else if (filters.status === "active") {
    query = query.is("suspended_at", null);
  } else if (filters.status === "verified") {
    query = query.eq("verified", true);
  } else if (filters.status === "pending_verification") {
    query = query.eq("verification_status", "pending");
  }

  const { data: orgs, error } = await query.limit(100);

  if (error) {
    throw new Error(`Failed to load organizations: ${error.message}`);
  }

  return orgs || [];
}

export async function getAdminOrgDetailAction(orgId: string) {
  await requirePlatformAdmin();
  const admin = adminClient();

  const { data: org, error: orgError } = await admin
    .from("orgs")
    .select("*")
    .eq("id", orgId)
    .single();

  if (orgError || !org) {
    throw new Error("Organization not found.");
  }

  // Members
  const { data: members } = await admin
    .from("org_members")
    .select("user_id, role, created_at")
    .eq("org_id", orgId);

  // Recent batches
  const { data: batches } = await admin
    .from("batches")
    .select("id, name, status, total, generated, failed, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Recent payments
  const { data: payments } = await admin
    .from("payments")
    .select("id, payment_id, amount, currency, status, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Recent audit logs
  const { data: logs } = await admin
    .from("audit_logs")
    .select("id, action, actor_id, entity_type, entity_id, meta, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(15);

  return {
    org,
    members: members || [],
    batches: batches || [],
    payments: payments || [],
    auditLogs: logs || [],
  };
}

export async function adjustCreditsAction(rawInput: AdjustCreditsInput) {
  const input = adjustCreditsSchema.parse(rawInput);
  await requirePlatformAdmin();

  // Atomically apply delta
  const newBalance = await applyCreditDelta(
    input.orgId,
    input.delta,
    "adjustment",
    "admin_adjustment",
    input.reason
  );

  await audit(
    input.orgId,
    "admin_grant_credits",
    "org",
    input.orgId,
    { delta: input.delta, reason: input.reason, newBalance }
  );

  return { success: true, newBalance };
}

export async function toggleOrgSuspensionAction(rawInput: ToggleSuspensionInput) {
  const input = toggleSuspensionSchema.parse(rawInput);
  await requirePlatformAdmin();
  const admin = adminClient();

  const suspendedAt = input.suspend ? new Date().toISOString() : null;

  const { error } = await admin
    .from("orgs")
    .update({ suspended_at: suspendedAt })
    .eq("id", input.orgId);

  if (error) {
    throw new Error(`Failed to update suspension status: ${error.message}`);
  }

  await audit(
    input.orgId,
    input.suspend ? "admin_suspend_org" : "admin_unsuspend_org",
    "org",
    input.orgId,
    { reason: input.reason }
  );

  return { success: true, suspendedAt };
}

export async function reviewVerificationRequestAction(rawInput: ReviewVerificationInput) {
  const input = reviewVerificationSchema.parse(rawInput);
  await requirePlatformAdmin();
  const admin = adminClient();

  const { error } = await admin
    .from("orgs")
    .update({
      verified: input.approve,
      verification_status: input.approve ? "approved" : "rejected",
      verification_notes: input.notes || null,
    })
    .eq("id", input.orgId);

  if (error) {
    throw new Error(`Failed to update verification status: ${error.message}`);
  }

  await audit(
    input.orgId,
    input.approve ? "admin_verify_org_approved" : "admin_verify_org_rejected",
    "org",
    input.orgId,
    { notes: input.notes }
  );

  return { success: true, verified: input.approve };
}

export async function getAdminAbuseReportsAction() {
  await requirePlatformAdmin();
  const admin = adminClient();

  const { data: reports, error } = await admin
    .from("abuse_reports")
    .select(`
      id,
      certificate_id,
      public_id,
      reason,
      details,
      contact_email,
      status,
      created_at
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Failed to load abuse reports: ${error.message}`);
  }

  return (reports || []).map((r) => ({
    id: r.id,
    certificate_id: r.certificate_id,
    public_id: r.public_id,
    reason: r.reason,
    details: r.details,
    contact_email: r.contact_email,
    reporter_email: r.contact_email,
    reporter_name: null,
    status: r.status,
    created_at: r.created_at,
  }));
}

export async function resolveAbuseReportAction(rawInput: ResolveAbuseReportInput) {
  const input = resolveAbuseReportSchema.parse(rawInput);
  await requirePlatformAdmin();
  const admin = adminClient();

  const { data: report, error: reportError } = await admin
    .from("abuse_reports")
    .select("id, certificate_id, public_id, status")
    .eq("id", input.reportId)
    .single();

  if (reportError || !report) {
    throw new Error("Abuse report not found.");
  }

  if (input.action === "revoke" && report.certificate_id) {
    // Revoke the certificate
    await admin
      .from("certificates")
      .update({
        status: "revoked",
        revocation_reason: input.reason || "Revoked by platform administrator following abuse report investigation.",
        revoked_at: new Date().toISOString(),
      })
      .eq("id", report.certificate_id);
  }

  const newStatus = input.action === "revoke" ? "reviewed" : "dismissed";

  const { error: updateError } = await admin
    .from("abuse_reports")
    .update({ status: newStatus })
    .eq("id", input.reportId);

  if (updateError) {
    throw new Error(`Failed to update abuse report status: ${updateError.message}`);
  }

  await audit(
    null,
    `admin_resolve_abuse_report_${input.action}`,
    "abuse_report",
    input.reportId,
    { publicId: report.public_id, reason: input.reason, resolution: newStatus }
  );

  return { success: true, status: newStatus };
}

export async function getAdminPaymentsAction() {
  await requirePlatformAdmin();
  const admin = adminClient();

  const { data: payments, error } = await admin
    .from("payments")
    .select(`
      id,
      payment_id,
      order_id,
      org_id,
      product_code,
      amount_paise,
      currency,
      status,
      gst_breakdown,
      metadata,
      created_at,
      fulfilled_at,
      orgs (
        id,
        name,
        slug
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Failed to load payments: ${error.message}`);
  }

  return (payments || []).map((p) => {
    const gst = (p.gst_breakdown as Record<string, number>) || {};
    return {
      id: p.id,
      payment_id: p.payment_id,
      order_id: p.order_id,
      org_id: p.org_id,
      amount: p.amount_paise,
      currency: p.currency,
      cgst: gst.cgst_paise || gst.cgstPaise || 0,
      sgst: gst.sgst_paise || gst.sgstPaise || 0,
      igst: gst.igst_paise || gst.igstPaise || 0,
      status: p.status,
      created_at: p.created_at,
      fulfilled_at: p.fulfilled_at,
      orgs: p.orgs,
    };
  });
}

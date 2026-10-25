import React from "react";
import { getAdminStatsAction, getAdminOrgsAction } from "@/features/admin/actions";
import { AdminClient } from "./admin-client";

export const metadata = {
  title: "Organizations — Platform Admin",
  description: "Platform organization overview, status controls, and credit ledger adjustments.",
};

export default async function AdminPage() {
  const [stats, initialOrgs] = await Promise.all([
    getAdminStatsAction().catch(() => ({
      totalOrgs: 0,
      activeOrgs: 0,
      suspendedOrgs: 0,
      pendingVerifications: 0,
      pendingAbuseReports: 0,
      totalCertificates: 0,
      totalRevenueInr: 0,
    })),
    getAdminOrgsAction().catch(() => []),
  ]);

  return <AdminClient stats={stats} initialOrgs={initialOrgs} />;
}

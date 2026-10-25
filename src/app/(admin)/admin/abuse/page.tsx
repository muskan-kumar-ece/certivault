import React from "react";
import { getAdminAbuseReportsAction } from "@/features/admin/actions";
import { AdminAbuseClient } from "./admin-abuse-client";

export const metadata = {
  title: "Abuse Reports Queue — Platform Admin",
  description: "Review public reports of fraudulent credentials, impersonation, or offensive certificates.",
};

export default async function AdminAbusePage() {
  const reports = await getAdminAbuseReportsAction().catch(() => []);
  return <AdminAbuseClient initialReports={reports} />;
}

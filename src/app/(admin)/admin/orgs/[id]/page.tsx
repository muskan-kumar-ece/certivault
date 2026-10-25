import React from "react";
import { notFound } from "next/navigation";
import { getAdminOrgDetailAction } from "@/features/admin/actions";
import { AdminOrgDetailClient } from "./admin-org-detail-client";

export const metadata = {
  title: "Organization Details — Platform Admin",
  description: "Comprehensive organization audit, members, usage metrics, and billing records.",
};

export default async function AdminOrgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const data = await getAdminOrgDetailAction(id);
    return <AdminOrgDetailClient orgData={data} />;
  } catch {
    notFound();
  }
}

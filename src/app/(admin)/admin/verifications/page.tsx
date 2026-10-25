import React from "react";
import { getAdminOrgsAction } from "@/features/admin/actions";
import { AdminVerificationsClient } from "./admin-verifications-client";

export const metadata = {
  title: "Verified Issuer Queue — Platform Admin",
  description: "Review and approve institution verification requests for the green verified issuer seal.",
};

export default async function AdminVerificationsPage() {
  const pendingOrgs = await getAdminOrgsAction({ status: "pending_verification" }).catch(() => []);
  return (
    <AdminVerificationsClient
      initialOrgs={
        pendingOrgs as unknown as React.ComponentProps<
          typeof AdminVerificationsClient
        >["initialOrgs"]
      }
    />
  );
}

import React from "react";
import { getAdminPaymentsAction } from "@/features/admin/actions";
import { AdminPaymentsClient } from "./admin-payments-client";

export const metadata = {
  title: "Global Payments — Platform Admin",
  description: "Cross-organization billing transactions, GST breakdowns, and invoice records.",
};

export default async function AdminPaymentsPage() {
  const payments = await getAdminPaymentsAction().catch(() => []);
  return (
    <AdminPaymentsClient
      initialPayments={
        payments as unknown as React.ComponentProps<
          typeof AdminPaymentsClient
        >["initialPayments"]
      }
    />
  );
}

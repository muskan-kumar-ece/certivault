import { redirect } from "next/navigation";
import { getUserOrganizationsAction } from "@/features/org/actions";
import { getBillingOverviewAction } from "@/features/billing/actions";
import { BillingClientView } from "./billing-client";

export default async function BillingPage() {
  const orgs = await getUserOrganizationsAction();
  if (orgs.length === 0) {
    redirect("/onboarding");
  }

  const currentOrg = orgs[0].org;
  const userRole = orgs[0].role;

  // Billing is restricted to owners and admins
  if (!["owner", "admin"].includes(userRole)) {
    redirect("/app");
  }

  const billingData = await getBillingOverviewAction(currentOrg.id);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <BillingClientView
        orgId={currentOrg.id}
        userRole={userRole}
        initialOrg={billingData.org}
        initialPayments={billingData.payments}
        initialInvoices={billingData.invoices}
      />
    </div>
  );
}

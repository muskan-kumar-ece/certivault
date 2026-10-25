"use server";

import { z } from "zod";
import { requireRole, audit } from "@/server/auth";
import { createClient } from "@/lib/supabase/server";
import { createOrder, productCodeSchema } from "@/server/payments";
import { getSignedUrl } from "@/server/storage";
import { revalidatePath } from "next/cache";

const createCheckoutSchema = z.object({
  productCode: productCodeSchema,
  customerState: z.string().optional(),
});

export async function createCheckoutOrderAction(
  orgId: string,
  rawInput: z.infer<typeof createCheckoutSchema>
) {
  await requireRole(orgId, ["owner", "admin"]);
  const input = createCheckoutSchema.parse(rawInput);

  return createOrder({
    productCode: input.productCode,
    orgId,
    customerState: input.customerState,
  });
}

export async function getBillingOverviewAction(orgId: string) {
  await requireRole(orgId, ["owner", "admin"]);
  const supabase = await createClient();

  // 1. Fetch organization profile & plan
  const { data: org, error: orgErr } = await supabase
    .from("orgs")
    .select("id, name, plan, credit_balance, plan_expires_at, billing")
    .eq("id", orgId)
    .single();

  if (orgErr || !org) {
    throw new Error("Organization not found.");
  }

  // 2. Fetch payments history
  const { data: payments } = await supabase
    .from("payments")
    .select("id, order_id, product_code, amount_paise, status, created_at, fulfilled_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(20);

  // 3. Fetch invoices history
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, financial_year, amount_paise, tax_paise, pdf_path, recipient_gstin, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(20);

  // Generate signed URLs for invoice downloads
  const enrichedInvoices = await Promise.all(
    (invoices || []).map(async (inv) => {
      let downloadUrl = "";
      if (inv.pdf_path) {
        try {
          downloadUrl = await getSignedUrl("invoices", inv.pdf_path, 3600);
        } catch {
          // Non-blocking download URL generation failure
        }
      }
      return {
        ...inv,
        downloadUrl,
      };
    })
  );

  return {
    org,
    payments: payments || [],
    invoices: enrichedInvoices,
  };
}

const updateGstSchema = z.object({
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid 15-character Indian GSTIN format")
    .optional()
    .or(z.literal("")),
  legalName: z.string().max(120).optional(),
  billingAddress: z.string().max(250).optional(),
  state: z.string().min(2, "State is required").max(50),
});

export type UpdateGstInput = z.infer<typeof updateGstSchema>;

export async function updateGstDetailsAction(orgId: string, rawInput: UpdateGstInput) {
  await requireRole(orgId, ["owner", "admin"]);
  const input = updateGstSchema.parse(rawInput);
  const supabase = await createClient();

  const { data: existingOrg, error: fetchErr } = await supabase
    .from("orgs")
    .select("billing")
    .eq("id", orgId)
    .single();

  if (fetchErr || !existingOrg) {
    throw new Error("Organization not found.");
  }

  const existingBilling = (existingOrg.billing as Record<string, unknown>) || {};
  const updatedBilling = {
    ...existingBilling,
    gstin: input.gstin || undefined,
    legal_name: input.legalName || undefined,
    billing_address: input.billingAddress || undefined,
    state: input.state,
  };

  const { error: updateErr } = await supabase
    .from("orgs")
    .update({ billing: updatedBilling })
    .eq("id", orgId);

  if (updateErr) {
    throw new Error(`Failed to update GST details: ${updateErr.message}`);
  }

  await audit(orgId, "billing.gst_update", "org", orgId, {
    gstin: input.gstin,
    state: input.state,
  });

  revalidatePath("/app/account/billing");
  return { success: true };
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Building,
  Plus,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { colors } from "@/lib/tokens";
import { PRODUCTS, ProductCode } from "@/lib/pricing";
import { createCheckoutOrderAction, updateGstDetailsAction } from "@/features/billing/actions";

interface OrgData {
  id: string;
  name: string;
  plan: string;
  credit_balance: number;
  plan_expires_at: string | null;
  billing?: Record<string, unknown> | null;
}

interface PaymentRecord {
  id: string;
  order_id: string;
  product_code: string;
  amount_paise: number;
  status: string;
  created_at: string;
  fulfilled_at: string | null;
}

interface InvoiceRecord {
  id: string;
  invoice_number: string;
  financial_year: string;
  amount_paise: number;
  tax_paise: number;
  pdf_path: string | null;
  recipient_gstin: string | null;
  created_at: string;
  downloadUrl?: string;
}

interface BillingClientViewProps {
  orgId: string;
  userRole: string;
  initialOrg: OrgData;
  initialPayments: PaymentRecord[];
  initialInvoices: InvoiceRecord[];
}

export function BillingClientView({
  orgId,
  initialOrg,
  initialPayments: _initialPayments,
  initialInvoices,
}: BillingClientViewProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductCode>("pack_event");
  const [isInitiatingCheckout, setIsInitiatingCheckout] = useState(false);

  // GST Form State
  const orgBilling = (initialOrg.billing as Record<string, unknown>) || {};
  const [gstin, setGstin] = useState((orgBilling.gstin as string) || "");
  const [legalName, setLegalName] = useState((orgBilling.legal_name as string) || "");
  const [billingAddress, setBillingAddress] = useState((orgBilling.billing_address as string) || "");
  const [state, setState] = useState((orgBilling.state as string) || "Maharashtra");
  const [isSavingGst, setIsSavingGst] = useState(false);

  // Save GST Details
  const handleSaveGst = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGst(true);
    try {
      await updateGstDetailsAction(orgId, {
        gstin: gstin.trim().toUpperCase(),
        legalName: legalName.trim() || undefined,
        billingAddress: billingAddress.trim() || undefined,
        state,
      });

      showToast({
        title: "GST Details Saved",
        description: "Your billing information will be included on future tax invoices.",
        variant: "success",
      });
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update GST info";
      showToast({ title: "Update Failed", description: msg, variant: "error" });
    } finally {
      setIsSavingGst(false);
    }
  };

  // Launch Checkout
  const handleStartCheckout = async () => {
    setIsInitiatingCheckout(true);
    try {
      const order = await createCheckoutOrderAction(orgId, {
        productCode: selectedProduct,
        customerState: state,
      });

      // Load Razorpay script if needed
      if (typeof window !== "undefined" && !(window as unknown as { Razorpay?: unknown }).Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        await new Promise((res) => {
          script.onload = res;
        });
      }

      const winRzp = window as unknown as {
        Razorpay?: new (opts: Record<string, unknown>) => { open: () => void };
      };

      if (!winRzp.Razorpay) {
        throw new Error("Razorpay SDK unavailable");
      }

      const rzp = new winRzp.Razorpay({
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency,
        name: "CertiVault",
        description: PRODUCTS[selectedProduct].name,
        order_id: order.orderId,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const confirmRes = await fetch("/api/billing/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            if (!confirmRes.ok) throw new Error("Payment confirmation failed");

            showToast({
              title: "Payment Successful",
              description: "Credits have been added to your balance.",
              variant: "success",
            });

            setIsPackModalOpen(false);
            router.refresh();
          } catch {
            showToast({
              title: "Confirmation Pending",
              description: "Payment captured! Balance will update automatically via webhook.",
              variant: "warning",
            });
          }
        },
        theme: {
          color: colors.accent.ultramarine.light,
        },
      });

      rzp.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to open checkout";
      showToast({ title: "Checkout Error", description: msg, variant: "error" });
    } finally {
      setIsInitiatingCheckout(false);
    }
  };

  const isCampus = initialOrg.plan === "campus";

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Billing & Credits</h1>
        <p className="text-xs text-ink-secondary mt-1">
          Manage your subscription plan, purchase certificate packs, and download tax invoices.
        </p>
      </div>

      {/* Plan & Balance Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Credit Balance Card */}
        <div className="md:col-span-2 p-6 rounded-card border border-hairline bg-surface shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                Available Credits
              </span>
              <Badge variant={initialOrg.credit_balance > 0 ? "verified" : "danger"}>
                {initialOrg.credit_balance > 0 ? "Active Balance" : "Zero Balance"}
              </Badge>
            </div>

            <div className="text-4xl font-extrabold text-ink tracking-tight mb-2">
              {initialOrg.credit_balance.toLocaleString("en-IN")}
              <span className="text-base font-normal text-ink-secondary ml-2">credits</span>
            </div>

            <p className="text-xs text-ink-secondary">
              1 credit = 1 issued certificate. Reissuing, resending, and public verification checks are always free.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPackModalOpen(true)}
              className="flex items-center gap-1.5 font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Buy Credit Pack</span>
            </Button>

            {!isCampus && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedProduct("plan_campus");
                  setIsPackModalOpen(true);
                }}
                className="flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Upgrade to Campus</span>
              </Button>
            )}
          </div>
        </div>

        {/* Current Plan Card */}
        <div className="p-6 rounded-card border border-hairline bg-surface shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-2">
              Current Plan
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-ink capitalize">
                {initialOrg.plan === "campus" ? "Campus Annual" : "Free Starter"}
              </span>
              {isCampus && <Badge variant="verified">Campus</Badge>}
            </div>

            <p className="text-xs text-ink-secondary">
              {isCampus
                ? "Includes 10,000 credits/year, 5 team seats, custom verify domain, and priority support."
                : "Free tier with up to 50 complimentary test credits and standard templates."}
            </p>

            {initialOrg.plan_expires_at && (
              <div className="mt-3 text-[11px] text-ink-secondary flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Renews: {new Date(initialOrg.plan_expires_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-hairline text-[11px] text-ink-secondary">
            {isCampus ? "Campus active · All features unlocked" : "Pre-paid top-up model"}
          </div>
        </div>
      </div>

      {/* GST Details Form Card */}
      <div className="p-6 rounded-card border border-hairline bg-surface shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <Building className="w-5 h-5 text-accent" />
          <div>
            <h2 className="text-sm font-semibold text-ink">GST & Invoicing Information</h2>
            <p className="text-xs text-ink-secondary mt-0.5">
              Add your institution&apos;s GSTIN to claim 18% Input Tax Credit (ITC) on all purchases.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveGst} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
              GSTIN (15 characters)
            </label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="27AAAAA0000A1Z5"
              className="w-full h-10 px-3 text-xs font-mono uppercase rounded-control border border-hairline bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
              Legal Entity / College Name
            </label>
            <input
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="Acme College of Engineering"
              className="w-full h-10 px-3 text-xs rounded-control border border-hairline bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
              State of Registration
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-control border border-hairline bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="Maharashtra">Maharashtra (27)</option>
              <option value="Karnataka">Karnataka (29)</option>
              <option value="Delhi">Delhi (07)</option>
              <option value="Tamil Nadu">Tamil Nadu (33)</option>
              <option value="Telangana">Telangana (36)</option>
              <option value="Gujarat">Gujarat (24)</option>
              <option value="Uttar Pradesh">Uttar Pradesh (09)</option>
              <option value="West Bengal">West Bengal (19)</option>
              <option value="Other">Other State</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
              Registered Billing Address
            </label>
            <input
              type="text"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              placeholder="Campus Rd, Tech Park, City, PIN"
              className="w-full h-10 px-3 text-xs rounded-control border border-hairline bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              disabled={isSavingGst}
              className="font-medium"
            >
              {isSavingGst ? "Saving..." : "Save GST Details"}
            </Button>
          </div>
        </form>
      </div>

      {/* Tax Invoices Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Tax Invoices ({initialInvoices.length})</h2>

        {initialInvoices.length === 0 ? (
          <div className="p-8 text-center rounded-card border border-hairline bg-surface text-xs text-ink-secondary">
            No tax invoices generated yet. Invoices appear here automatically following credit purchases.
          </div>
        ) : (
          <div className="rounded-card border border-hairline bg-surface overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-hairline bg-surface-prominent text-ink-secondary font-semibold">
                  <th className="p-3">Invoice Number</th>
                  <th className="p-3">Financial Year</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3">GST (18%)</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {initialInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-prominent/50 transition-colors">
                    <td className="p-3 font-mono font-medium text-ink">{inv.invoice_number}</td>
                    <td className="p-3 font-mono text-ink-secondary">{inv.financial_year}</td>
                    <td className="p-3 font-semibold text-ink">
                      Rs. {(inv.amount_paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-ink-secondary">
                      Rs. {(inv.tax_paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-ink-secondary">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      {inv.downloadUrl ? (
                        <a href={inv.downloadUrl} download target="_blank" rel="noreferrer">
                          <Button variant="secondary" size="sm" className="h-7 text-[11px] px-2.5 flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </Button>
                        </a>
                      ) : (
                        <span className="text-[11px] text-ink-secondary">Generated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Credit Packs Checkout Modal */}
      <Dialog
        open={isPackModalOpen}
        onOpenChange={setIsPackModalOpen}
        title="Purchase Certificate Credits"
        description="Select a credit pack or upgrade your institution to the Campus plan. All payments processed securely via Razorpay (UPI, Netbanking, Cards)."
      >
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.entries(PRODUCTS) as [ProductCode, (typeof PRODUCTS)[ProductCode]][]).map(([code, p]) => {
              const isSelected = selectedProduct === code;
              const priceRupees = (p.pricePaise / 100).toLocaleString("en-IN");
              const gstRupees = Math.round(p.pricePaise * 0.18 / 100).toLocaleString("en-IN");
              const totalRupees = Math.round(p.pricePaise * 1.18 / 100).toLocaleString("en-IN");

              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setSelectedProduct(code)}
                  className={`p-4 text-left rounded-control border transition-all ${
                    isSelected
                      ? "border-accent bg-accent/5 ring-1 ring-accent"
                      : "border-hairline bg-surface hover:bg-surface-prominent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-ink">{p.name}</span>
                    {p.isPlan && <Badge variant="verified">Annual</Badge>}
                  </div>

                  <div className="text-xl font-bold text-ink mt-2">
                    Rs. {priceRupees}
                    <span className="text-[11px] font-normal text-ink-secondary ml-1">ex-GST</span>
                  </div>

                  <div className="text-[11px] text-ink-secondary mt-1">
                    Total: <strong>Rs. {totalRupees}</strong> (incl. 18% GST of Rs. {gstRupees})
                  </div>

                  <div className="mt-3 pt-2 border-t border-hairline text-[11px] text-accent font-medium">
                    {p.credits.toLocaleString("en-IN")} certificates · 12 months validity
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-control bg-canvas border border-hairline text-[11px] text-ink-secondary space-y-1">
            <p><strong>Note for Colleges & Clubs:</strong> Instant UPI payment is prioritized for mobile checkouts.</p>
            <p>Tax invoice with 18% GST will be generated automatically upon completion.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button variant="ghost" size="sm" onClick={() => setIsPackModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartCheckout}
              disabled={isInitiatingCheckout}
              className="font-semibold"
            >
              {isInitiatingCheckout ? "Opening Checkout..." : "Proceed to Razorpay Checkout"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

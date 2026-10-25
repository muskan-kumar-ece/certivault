import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, ShieldCheck, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Refund Policy — CertiVault",
  description: "Transparent refund and cancellation terms for credit packs and annual institutional subscriptions.",
};

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-canvas text-ink py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink transition-colors mb-6 press-feedback"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Cancellation & Refund Policy</h1>
          <p className="text-sm text-ink-secondary mt-2">Effective Date: October 25, 2026 · Razorpay Merchant Compliant</p>
        </div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-card border border-hairline bg-surface space-y-2">
            <Clock className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-semibold text-ink">7-Day Credit Packs</h3>
            <p className="text-xs text-ink-secondary">Full refund on unused credit packs within 7 calendar days of purchase.</p>
          </div>
          <div className="p-4 rounded-card border border-hairline bg-surface space-y-2">
            <ShieldCheck className="w-5 h-5 text-verified" />
            <h3 className="text-sm font-semibold text-ink">14-Day Annual Plan</h3>
            <p className="text-xs text-ink-secondary">Pro-rated refund for Campus plan if less than 5% of credits used.</p>
          </div>
          <div className="p-4 rounded-card border border-hairline bg-surface space-y-2">
            <RefreshCw className="w-5 h-5 text-ink-secondary" />
            <h3 className="text-sm font-semibold text-ink">5–7 Business Days</h3>
            <p className="text-xs text-ink-secondary">Reversals routed automatically back to the original source UPI/bank account.</p>
          </div>
        </div>

        <section className="space-y-4 text-sm text-ink-secondary leading-relaxed bg-surface p-6 sm:p-8 rounded-card border border-hairline">
          <h2 className="text-base font-semibold text-ink">1. Self-Serve Credit Packs (Event, Club, Bulk)</h2>
          <p>
            Credit packs purchased via UPI, credit/debit card, or net banking are fully refundable within seven (7) calendar days of purchase, provided that zero (0) certificates from the purchased pack have been issued or reserved. Once certificates have been issued from a pack, the remaining balance becomes non-refundable.
          </p>

          <h2 className="text-base font-semibold text-ink pt-4">2. Annual Campus and Institutional Subscriptions</h2>
          <p>
            Institutions subscribing to the annual Campus plan (₹24,999/year) may request cancellation within fourteen (14) calendar days of contract inception. If fewer than 5% of the allocated credits (under 500 certificates) were consumed, a pro-rated refund minus payment gateway transaction surcharges will be remitted.
          </p>

          <h2 className="text-base font-semibold text-ink pt-4">3. Failed Deliveries or System Faults</h2>
          <p>
            If a certificate batch encounters system processing errors on our infrastructure that prevent generation or delivery, the reserved credits are automatically restored to your organization&apos;s active balance without deduction.
          </p>

          <h2 className="text-base font-semibold text-ink pt-4">4. How to Request a Refund</h2>
          <p>
            To initiate a cancellation or refund, email <code>billing@certivault.in</code> from the organization owner&apos;s registered email address with the Order ID or Razorpay Payment ID. Approved refunds are credited to the original payment source within 5 to 7 Indian banking days.
          </p>
        </section>
      </div>
    </main>
  );
}

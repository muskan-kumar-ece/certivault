import React from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Pricing & Plans — CertiVault",
  description: "Transparent, credit-based pricing for colleges, student clubs, and hackathons in India. 1 credit = 1 issued certificate.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-canvas text-ink py-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-16">
        <Badge variant="verified">Transparent Indian Pricing</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Simple, Credit-Based Plans
        </h1>
        <p className="text-base sm:text-lg text-ink-secondary max-w-2xl mx-auto">
          1 credit = 1 issued certificate. No hidden fees. Verification, downloads, and reissues are always 100% free.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {/* Free Tier */}
        <div className="p-6 rounded-card border border-hairline bg-surface flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-ink">Free Starter</h3>
            <p className="text-xs text-ink-secondary mt-1">For testing and small meetups</p>

            <div className="my-6">
              <span className="text-3xl font-extrabold">₹0</span>
            </div>

            <ul className="space-y-2.5 text-xs text-ink">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-verified flex-shrink-0" />
                <span>50 complimentary credits</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-verified flex-shrink-0" />
                <span>Standard templates</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-verified flex-shrink-0" />
                <span>Public QR verification</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-verified flex-shrink-0" />
                <span>CSV import up to 50 rows</span>
              </li>
            </ul>
          </div>

          <Link href="/login" className="mt-8">
            <Button variant="secondary" className="w-full text-xs">
              Get Started Free
            </Button>
          </Link>
        </div>

        {/* Event Pack */}
        <div className="p-6 rounded-card border border-hairline bg-surface flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-ink">Event Pack</h3>
            <p className="text-xs text-ink-secondary mt-1">Single college fest or workshop</p>

            <div className="my-6">
              <span className="text-3xl font-extrabold">₹999</span>
              <span className="text-xs text-ink-secondary ml-1.5">+ 18% GST</span>
            </div>

            <ul className="space-y-2.5 text-xs text-ink">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-verified flex-shrink-0" />
                <span><strong>500 credits</strong> (₹2.00 / cert)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-verified flex-shrink-0" />
                <span>No watermark</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-verified flex-shrink-0" />
                <span>12 months credit validity</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-verified flex-shrink-0" />
                <span>Instant UPI & Card checkout</span>
              </li>
            </ul>
          </div>

          <Link href="/login" className="mt-8">
            <Button variant="secondary" className="w-full text-xs">
              Buy Event Pack
            </Button>
          </Link>
        </div>

        {/* Club Pack (Popular) */}
        <div className="p-6 rounded-card border-2 border-accent bg-surface flex flex-col justify-between shadow-md relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge variant="accent">Most Popular</Badge>
          </div>

          <div>
            <h3 className="text-lg font-bold text-ink">Club Pack</h3>
            <p className="text-xs text-ink-secondary mt-1">Active college clubs & hackathons</p>

            <div className="my-6">
              <span className="text-3xl font-extrabold">₹2,999</span>
              <span className="text-xs text-ink-secondary ml-1.5">+ 18% GST</span>
            </div>

            <ul className="space-y-2.5 text-xs text-ink">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-verified flex-shrink-0" />
                <span><strong>2,000 credits</strong> (₹1.50 / cert)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-verified flex-shrink-0" />
                <span>Custom certificate templates</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-verified flex-shrink-0" />
                <span>Bulk email delivery via Resend</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-verified flex-shrink-0" />
                <span>GST Tax Invoice with ITC</span>
              </li>
            </ul>
          </div>

          <Link href="/login" className="mt-8">
            <Button variant="primary" className="w-full text-xs font-semibold">
              Buy Club Pack
            </Button>
          </Link>
        </div>

        {/* Campus Plan */}
        <div className="p-6 rounded-card border border-hairline bg-surface flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="text-lg font-bold text-ink">Campus Annual</h3>
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <p className="text-xs text-ink-secondary">Complete college institutional license</p>

            <div className="my-6">
              <span className="text-3xl font-extrabold">₹24,999</span>
              <span className="text-xs text-ink-secondary ml-1.5">/ year</span>
            </div>

            <ul className="space-y-2.5 text-xs text-ink">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-verified flex-shrink-0" />
                <span><strong>10,000 credits</strong> / year</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-verified flex-shrink-0" />
                <span>5 administrative seats</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-verified flex-shrink-0" />
                <span>Custom verify subdomain</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-verified flex-shrink-0" />
                <span>Priority email support</span>
              </li>
            </ul>
          </div>

          <Link href="/login" className="mt-8">
            <Button variant="secondary" className="w-full text-xs">
              Upgrade to Campus
            </Button>
          </Link>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-center text-ink">Frequently Asked Questions</h2>

        <div className="divide-y divide-hairline rounded-card border border-hairline bg-surface p-6 shadow-sm space-y-4">
          <div className="pt-2">
            <h4 className="text-sm font-semibold text-ink">How does 1 credit work?</h4>
            <p className="text-xs text-ink-secondary mt-1">
              One credit allows you to generate and deliver one verifiable credential. Recipients downloading their PDF, verifiers scanning the QR code, or issuers re-sending an email never cost any additional credits.
            </p>
          </div>

          <div className="pt-4">
            <h4 className="text-sm font-semibold text-ink">What happens if a certificate fails during generation?</h4>
            <p className="text-xs text-ink-secondary mt-1">
              Credits for failed certificate rows are refunded immediately and automatically to your organization ledger.
            </p>
          </div>

          <div className="pt-4">
            <h4 className="text-sm font-semibold text-ink">Do unused credits expire?</h4>
            <p className="text-xs text-ink-secondary mt-1">
              Yes, credits purchased via packs remain valid for 12 months from the purchase date. The system automatically consumes your oldest active credits first.
            </p>
          </div>

          <div className="pt-4">
            <h4 className="text-sm font-semibold text-ink">Can I claim Input Tax Credit (ITC) with 18% GST?</h4>
            <p className="text-xs text-ink-secondary mt-1">
              Yes. Simply enter your institution&apos;s 15-character GSTIN in your billing settings. A compliant Indian tax invoice will be generated and available for download.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PaymentItem {
  id: string;
  payment_id: string | null;
  order_id: string;
  org_id: string;
  amount: number;
  currency: string;
  cgst: number;
  sgst: number;
  igst: number;
  status: string;
  created_at: string;
  fulfilled_at: string | null;
  orgs: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export function AdminPaymentsClient({
  initialPayments,
}: {
  initialPayments: PaymentItem[];
}) {
  const [payments] = useState(initialPayments);
  const [search, setSearch] = useState("");

  const filtered = payments.filter((p) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    const orgName = p.orgs?.name?.toLowerCase() || "";
    const pid = p.payment_id?.toLowerCase() || "";
    const oid = p.order_id?.toLowerCase() || "";
    return orgName.includes(s) || pid.includes(s) || oid.includes(s);
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
          Global Payment Transactions
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          Audited Razorpay payments, subscriptions, credit pack fulfillments, and GST distribution.
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-ink-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="admin-payments-search"
            name="search"
            aria-label="Search by Org, Payment ID, or Order ID"
            type="text"
            placeholder="Search by Org, Payment ID, or Order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            className="w-full text-xs pl-8 pr-3 py-2 rounded-control bg-surface border border-hairline text-ink focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-hairline rounded-card overflow-hidden bg-surface shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas/50 border-b border-hairline text-ink-secondary font-medium uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Payment ID / Order</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3 text-right">Base + GST</th>
                <th className="px-4 py-3 text-right">Total (INR)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-ink-secondary">
                    No payment transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((payment) => (
                  <tr key={payment.id} className="hover:bg-canvas/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-mono font-semibold text-ink text-[11px]">
                        {payment.payment_id || <span className="text-ink-secondary italic">Awaiting Capture</span>}
                      </p>
                      <p className="text-ink-secondary font-mono text-[10px]">{payment.order_id}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      {payment.orgs ? (
                        <Link
                          href={`/admin/orgs/${payment.orgs.id}`}
                          className="font-medium text-ink hover:text-accent hover:underline press-feedback"
                        >
                          {payment.orgs.name}
                        </Link>
                      ) : (
                        <span className="text-ink-secondary font-mono text-[11px]">{payment.org_id}</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right text-ink-secondary tabular-nums text-[11px]">
                      {payment.igst > 0 ? (
                        <span>IGST ₹{(payment.igst / 100).toFixed(2)}</span>
                      ) : (
                        <span>
                          CGST ₹{(payment.cgst / 100).toFixed(2)} + SGST ₹{(payment.sgst / 100).toFixed(2)}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold tabular-nums text-ink">
                      ₹{(payment.amount / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          payment.status === "paid"
                            ? "verified"
                            : payment.status === "failed"
                            ? "danger"
                            : "neutral"
                        }
                        className="text-[10px]"
                      >
                        {payment.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 text-ink-secondary text-[11px] tabular-nums">
                      {new Date(payment.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

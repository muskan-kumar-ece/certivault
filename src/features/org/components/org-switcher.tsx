"use client";

import { useState } from "react";
import Link from "next/link";

interface OrgItem {
  role: string;
  org: {
    id: string;
    name: string;
    slug: string;
    kind: string;
    credit_balance: number;
    verified: boolean;
  };
}

interface OrgSwitcherProps {
  organizations: OrgItem[];
  currentOrgId?: string;
}

export function OrgSwitcher({ organizations, currentOrgId }: OrgSwitcherProps) {
  const [open, setOpen] = useState(false);
  const active = organizations.find((o) => o.org.id === currentOrgId) || organizations[0];

  if (!active) {
    return (
      <Link
        href="/onboarding"
        className="text-xs px-2.5 py-1 rounded-control bg-accent/10 text-accent font-medium hover:bg-accent/20"
      >
        + Create Organization
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-control bg-surface hover:bg-surface-raised border text-sm font-medium press-feedback"
      >
        <div className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold uppercase">
          {active.org.name.charAt(0)}
        </div>
        <span className="font-semibold text-ink">{active.org.name}</span>
        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-canvas border text-ink-secondary">
          {active.role}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-ink-secondary transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-1 w-64 rounded-card bg-surface border shadow-lg z-50 p-1.5 space-y-1">
            <div className="px-2.5 py-1.5 text-xs font-semibold text-ink-secondary uppercase tracking-wider">
              Your Organizations
            </div>

            {organizations.map((item) => (
              <div
                key={item.org.id}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between p-2 rounded-control text-sm cursor-pointer hover:bg-surface-raised ${
                  item.org.id === active.org.id ? "bg-accent/10 text-accent font-medium" : "text-ink"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate">{item.org.name}</span>
                  <span className="text-[10px] uppercase px-1 py-0.5 rounded border bg-canvas text-ink-secondary">
                    {item.role}
                  </span>
                </div>
                <span className="text-xs font-mono text-ink-secondary">
                  {item.org.credit_balance} cr
                </span>
              </div>
            ))}

            <div className="border-t my-1" />

            <Link
              href="/onboarding"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 p-2 rounded-control text-xs font-medium text-accent hover:bg-accent/10"
            >
              <span>+ Create another organization</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

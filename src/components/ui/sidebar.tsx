"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileCheck2,
  PlusCircle,
  LayoutTemplate,
  CreditCard,
  Settings,
  ShieldCheck,
  Search,
  type LucideIcon,
} from "lucide-react";

export interface NavLinkItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
}

const PRIMARY_LINKS: NavLinkItem[] = [
  { label: "Home", href: "/app", icon: Home },
  { label: "Batches", href: "/app/batches", icon: FileCheck2 },
  { label: "Issue Certificates", href: "/app/issue", icon: PlusCircle },
  { label: "Templates", href: "/app/templates", icon: LayoutTemplate },
];

const SECONDARY_LINKS: NavLinkItem[] = [
  { label: "Settings", href: "/app/settings", icon: Settings },
  { label: "Billing & Credits", href: "/app/billing", icon: CreditCard },
  { label: "Audit Logs", href: "/app/audit", icon: ShieldCheck },
];

export function Sidebar({
  header,
  onOpenCommandPalette,
  creditBalance = 50,
}: {
  header?: React.ReactNode;
  onOpenCommandPalette?: () => void;
  creditBalance?: number;
}) {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Desktop Navigation"
      className="hidden w-64 shrink-0 flex-col border-r border-hairline bg-surface/50 backdrop-blur-xl md:flex h-[100dvh] sticky top-0"
    >
      {/* Top Header / Org Switcher */}
      <div className="flex h-16 items-center px-4 border-b border-hairline">
        {header}
      </div>

      {/* Search / Command palette trigger */}
      {onOpenCommandPalette && (
        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex h-10 w-full items-center justify-between rounded-control border border-hairline bg-surface px-3 text-xs text-ink-secondary hover:text-ink press-feedback outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              Quick search...
            </span>
            <kbd className="rounded border border-hairline bg-surface-raised px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">
            Core
          </p>
          {PRIMARY_LINKS.map((link) => {
            const isActive =
              link.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex h-11 items-center gap-3 rounded-control px-3 text-sm font-medium transition-colors press-feedback outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive
                    ? "bg-accent/10 text-accent font-semibold"
                    : "text-ink hover:bg-surface-raised"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{link.label}</span>
                {link.badge && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent/15 px-1.5 text-xs font-semibold text-accent">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">
            Management
          </p>
          {SECONDARY_LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex h-11 items-center gap-3 rounded-control px-3 text-sm font-medium transition-colors press-feedback outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive
                    ? "bg-accent/10 text-accent font-semibold"
                    : "text-ink hover:bg-surface-raised"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer / Credit Balance */}
      <div className="border-t border-hairline p-4">
        <div className="flex items-center justify-between rounded-card bg-surface-raised p-3">
          <div className="flex flex-col">
            <span className="text-xs text-ink-secondary">Available Credits</span>
            <span className="text-base font-bold tabular-nums text-ink">
              {creditBalance.toLocaleString("en-IN")}
            </span>
          </div>
          <Link
            href="/app/billing"
            className="rounded-control bg-accent/10 px-2.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20 press-feedback"
          >
            Top up
          </Link>
        </div>
      </div>
    </aside>
  );
}

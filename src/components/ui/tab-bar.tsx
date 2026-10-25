"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Home,
  FileCheck2,
  PlusCircle,
  LayoutTemplate,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface TabItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
}

const DEFAULT_TABS: TabItem[] = [
  { label: "Home", href: "/app", icon: Home },
  { label: "Batches", href: "/app/batches", icon: FileCheck2 },
  { label: "Issue", href: "/app/issue", icon: PlusCircle },
  { label: "Templates", href: "/app/templates", icon: LayoutTemplate },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

export function TabBar({ tabs = DEFAULT_TABS }: { tabs?: TabItem[] }) {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 block md:hidden"
    >
      <div className="mx-auto flex h-[calc(4rem+env(safe-area-inset-bottom))] w-full items-start justify-around border-t border-hairline bg-surface/80 px-2 pt-1.5 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-1 text-xs font-medium press-feedback ${
                isActive ? "text-accent" : "text-ink-secondary hover:text-ink"
              }`}
            >
              {isActive && !prefersReduced && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-x-3 -top-1.5 h-0.5 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="absolute top-1 right-3 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

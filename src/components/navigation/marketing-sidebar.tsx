"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Sparkles,
  Layers,
  Tag,
  HelpCircle,
  ShieldCheck,
  Gift,
  ArrowRight,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Features", href: "/#features", icon: Sparkles },
  { name: "How It Works", href: "/#how-it-works", icon: Layers },
  { name: "Pricing", href: "/pricing", icon: Tag },
  { name: "FAQ", href: "/#faq", icon: HelpCircle },
];

export function MarketingSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 border-r border-hairline bg-surface flex-col justify-between p-6 z-40 select-none">
        {/* Brand Header */}
        <div className="space-y-8">
          <Link href="/" className="flex items-center gap-3 press-feedback group">
            {/* 3D Isometric Logo Emblem */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent via-brand-primary to-brand-violet p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-surface rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-accent/10" />
                <svg
                  className="w-5 h-5 text-accent"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-extrabold text-ink text-lg tracking-tight font-sans">
                CertiVault
              </span>
              <span className="text-[10px] text-ink-secondary font-medium tracking-wide">
                Verifiable Credentials
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href.replace("/#", ""));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all press-feedback ${
                    isActive
                      ? "bg-accent/10 text-accent shadow-xs"
                      : "text-ink-secondary hover:text-ink hover:bg-canvas"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-ink-secondary"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <Link
              href="/verify"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all press-feedback ${
                pathname === "/verify"
                  ? "bg-accent/10 text-accent shadow-xs"
                  : "text-ink-secondary hover:text-ink hover:bg-canvas"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-verified" />
              <span>Verify Certificate</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Section: Promo Card & Institutional Trust */}
        <div className="space-y-6 pt-6 border-t border-hairline">
          {/* Gradient 50 Free Credits Promo Card */}
          <Link
            href="/login"
            className="block relative rounded-2xl bg-gradient-to-br from-brand-violet via-accent to-brand-primary p-4 text-white shadow-lg shadow-accent/20 overflow-hidden group press-feedback"
          >
            {/* Ambient inner glow */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xs">
                <Gift className="w-4 h-4" />
              </div>
              <div className="w-7 h-7 rounded-full bg-white text-accent flex items-center justify-center shadow-xs group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="relative z-10 mt-3 space-y-0.5">
              <h4 className="text-sm font-bold tracking-tight">Get 50 Free Credits</h4>
              <p className="text-[11px] text-white/80 font-medium">No credit card required</p>
            </div>
          </Link>

          {/* Trusted by 500+ Institutions */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-secondary">
              Trusted by 500+ Institutions
            </p>
            <div className="flex items-center justify-between text-ink-secondary/60">
              <div className="flex items-center gap-1.5" title="IITs, NITs & Central Universities">
                <GraduationCap className="w-4 h-4" />
                <span className="text-[11px] font-black tracking-tighter">IIT / NIT</span>
              </div>
              <span className="text-[10px] font-bold">ANNA UNIV</span>
              <span className="text-[10px] font-bold">DELHI UNIV</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header Bar & Drawer Toggle */}
      <header className="lg:hidden sticky top-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-hairline px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 press-feedback">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-brand-violet flex items-center justify-center text-white shadow-xs">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-extrabold text-ink text-base tracking-tight font-sans">
            CertiVault
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/verify">
            <Button size="sm" variant="secondary" className="text-xs h-8 px-2.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-verified mr-1" />
              Verify
            </Button>
          </Link>

          <Link href="/login">
            <Button size="sm" variant="primary" className="text-xs h-8 px-3 rounded-full">
              Start Free
            </Button>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-canvas transition-colors press-feedback"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm">
          <div className="fixed top-[57px] left-0 right-0 bottom-0 bg-surface border-b border-hairline p-6 flex flex-col justify-between animate-in slide-in-from-top-2 duration-200">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-ink hover:bg-canvas"
                  >
                    <Icon className="w-4 h-4 text-accent" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <Link
                href="/verify"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-ink hover:bg-canvas"
              >
                <ShieldCheck className="w-4 h-4 text-verified" />
                <span>Verify Certificate</span>
              </Link>
            </nav>

            <div className="space-y-3 pt-6 border-t border-hairline">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full"
              >
                <Button variant="primary" className="w-full text-xs font-semibold py-3 rounded-xl">
                  Get Started Free (50 Credits)
                </Button>
              </Link>

              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full"
              >
                <Button variant="secondary" className="w-full text-xs font-semibold py-3 rounded-xl">
                  Sign In to Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

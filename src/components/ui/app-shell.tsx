"use client";

import * as React from "react";
import Link from "next/link";
import { Sidebar } from "@/components/ui/sidebar";
import { TabBar } from "@/components/ui/tab-bar";
import { CommandPalette } from "@/components/ui/command-palette";
import { ToastProvider } from "@/components/ui/toast";
import { PageTransition } from "@/components/ui/page-transition";

interface AppShellProps {
  children: React.ReactNode;
  headerContent: React.ReactNode;
  headerRight?: React.ReactNode;
  creditBalance?: number;
}

export function AppShell({
  children,
  headerContent,
  headerRight,
  creditBalance = 50,
}: AppShellProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);

  // Global keyboard shortcut for ⌘K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <ToastProvider>
      <div className="flex min-h-[100dvh] bg-canvas text-ink">
        {/* Desktop Sidebar */}
        <Sidebar
          header={headerContent}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          creditBalance={creditBalance}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-x-hidden pb-20 md:pb-6">
          {/* Mobile Top Header */}
          <header className="flex h-14 items-center justify-between border-b border-hairline bg-surface/80 px-4 backdrop-blur-xl md:hidden">
            <div className="flex items-center gap-2">
              <Link href="/app" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-xs font-bold text-white shadow-sm">
                  CV
                </div>
              </Link>
              <div className="max-w-[180px] truncate">{headerContent}</div>
            </div>

            {headerRight && (
              <div className="flex items-center gap-2">{headerRight}</div>
            )}
          </header>

          {/* Page Body */}
          <main className="flex-1 px-4 py-6 sm:px-6 md:px-8">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>

        {/* Mobile Floating Tab Bar */}
        <TabBar />

        {/* Global Command Palette */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
        />
      </div>
    </ToastProvider>
  );
}

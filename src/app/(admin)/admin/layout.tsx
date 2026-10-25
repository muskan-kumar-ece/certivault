import React from "react";
import Link from "next/link";
import { ShieldAlert, Building2, AlertTriangle, BadgeCheck, Receipt, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ToastProvider } from "@/components/ui/toast";

export const metadata = {
  title: "Platform Admin Console — CertiVault",
  description: "Internal administrative controls for CertiVault operations, organization management, and fraud deterrence.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-canvas text-ink flex flex-col">
        {/* Platform Admin Top Bar */}
        <header className="sticky top-0 z-40 backdrop-blur-md bg-surface/85 border-b border-hairline px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2 font-bold text-lg text-ink press-feedback">
                <span className="w-8 h-8 rounded-control bg-accent flex items-center justify-center text-white font-black text-sm shadow-sm">
                  CV
                </span>
                <span>CertiVault</span>
              </Link>
              <Badge variant="danger" className="text-[11px] tracking-wide uppercase font-semibold">
                <ShieldAlert className="w-3 h-3 mr-1" />
                Platform Admin
              </Badge>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium py-1">
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-control hover:bg-surface-raised border border-transparent hover:border-hairline transition-all flex items-center gap-1.5 press-feedback"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Organizations</span>
              </Link>
              <Link
                href="/admin/verifications"
                className="px-3 py-1.5 rounded-control hover:bg-surface-raised border border-transparent hover:border-hairline transition-all flex items-center gap-1.5 press-feedback"
              >
                <BadgeCheck className="w-3.5 h-3.5 text-verified" />
                <span>Verifications</span>
              </Link>
              <Link
                href="/admin/abuse"
                className="px-3 py-1.5 rounded-control hover:bg-surface-raised border border-transparent hover:border-hairline transition-all flex items-center gap-1.5 press-feedback"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-accent" />
                <span>Abuse Reports</span>
              </Link>
              <Link
                href="/admin/payments"
                className="px-3 py-1.5 rounded-control hover:bg-surface-raised border border-transparent hover:border-hairline transition-all flex items-center gap-1.5 press-feedback"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Payments</span>
              </Link>
              <div className="h-4 w-px bg-hairline mx-1" />
              <Link
                href="/app"
                className="px-3 py-1.5 rounded-control text-ink-secondary hover:text-ink hover:bg-surface-raised border border-transparent transition-all flex items-center gap-1.5 press-feedback"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to App</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}

import React from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Offline — CertiVault",
  description: "CertiVault offline standby screen.",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-surface border border-hairline flex items-center justify-center mx-auto text-ink-secondary shadow-sm">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">You&apos;re Offline</h1>
          <p className="text-sm text-ink-secondary leading-relaxed">
            CertiVault requires an active network connection to dispatch batches, record tamper-proof audit trails, and verify cryptographic certificates.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a href="/app" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto text-xs font-semibold">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Retry Connection
            </Button>
          </a>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

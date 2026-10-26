"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin portal runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-card border border-hairline bg-surface shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-ink">Admin Operation Error</h2>
          <p className="text-xs text-ink-secondary leading-relaxed">
            {error.message || "An error occurred while communicating with the administrative data layer."}
          </p>
        </div>
        <div className="pt-2">
          <Button
            onClick={() => reset()}
            variant="secondary"
            className="w-full inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Operation</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

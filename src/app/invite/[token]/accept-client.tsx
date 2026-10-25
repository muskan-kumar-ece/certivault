"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { acceptInvitationAction } from "@/features/team/actions";

export function InviteAcceptClient({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);

    try {
      await acceptInvitationAction(token);
      router.push("/app");
      router.refresh();
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Failed to accept invitation.");
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-control bg-danger/10 border border-danger/20 p-3 text-xs text-danger text-left">
          {error}
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        loading={loading}
        onClick={handleAccept}
        className="w-full"
      >
        Accept & Join Team
      </Button>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { reviewVerificationRequestAction } from "@/features/admin/actions";

interface VerificationOrgItem {
  id: string;
  name: string;
  slug: string;
  kind: string;
  plan: string;
  verification_status: string;
  created_at: string;
}

export function AdminVerificationsClient({
  initialOrgs,
}: {
  initialOrgs: VerificationOrgItem[];
}) {
  const { showToast } = useToast();
  const [orgs, setOrgs] = useState<VerificationOrgItem[]>(initialOrgs);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleReview = async (orgId: string, approve: boolean) => {
    setProcessingId(orgId);
    try {
      await reviewVerificationRequestAction({
        orgId,
        approve,
        notes: approve ? "Approved by platform administrator" : "Declined by platform administrator",
      });

      setOrgs((prev) => prev.filter((o) => o.id !== orgId));
      showToast({
        title: approve ? "Organization Verified" : "Verification Declined",
        description: approve
          ? "The verified issuer badge has been granted."
          : "The request has been marked as rejected.",
        variant: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      showToast({ title: "Failed", description: msg, variant: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
          Verified Issuer Accreditation
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          Review organizations requesting the green Verified Issuer badge displayed on public verification pages.
        </p>
      </div>

      <div className="border border-hairline rounded-card overflow-hidden bg-surface shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas/50 border-b border-hairline text-ink-secondary font-medium uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Requested Date</th>
                <th className="px-4 py-3 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {orgs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-ink-secondary">
                    No pending verification requests at this time.
                  </td>
                </tr>
              ) : (
                orgs.map((org) => (
                  <tr key={org.id} className="hover:bg-canvas/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-ink flex items-center gap-1.5">
                        <Link
                          href={`/admin/orgs/${org.id}`}
                          className="hover:text-accent hover:underline press-feedback"
                        >
                          {org.name}
                        </Link>
                      </div>
                      <span className="text-[11px] text-ink-secondary font-mono">{org.slug}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge variant="neutral" className="uppercase text-[10px]">
                        {org.kind}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge variant="neutral" className="uppercase text-[10px]">
                        {org.plan}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 text-ink-secondary text-[11px] tabular-nums">
                      {new Date(org.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleReview(org.id, false)}
                          disabled={processingId === org.id}
                          className="text-[11px] px-2.5 py-1"
                        >
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleReview(org.id, true)}
                          disabled={processingId === org.id}
                          className="text-[11px] px-2.5 py-1 bg-verified hover:bg-verified-hover text-white"
                        >
                          Approve Badge
                        </Button>
                      </div>
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

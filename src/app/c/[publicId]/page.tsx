import { Metadata } from "next";
import { headers } from "next/headers";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/server/admin";
import { checkVerifyRateLimit } from "@/server/rate-limit";
import { PublicVerifyClient } from "./public-verify-client";

interface PageProps {
  params: Promise<{ publicId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  return {
    title: `Verify Certificate ${publicId} | CertiVault`,
    description: "Public verification page for cryptographically verified certificates.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function PublicVerificationPage({ params }: PageProps) {
  const { publicId } = await params;
  const cleanId = publicId?.trim().toUpperCase();

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const rateLimit = checkVerifyRateLimit(ip);

  if (!rateLimit.allowed) {
    return (
      <main className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <div className="max-w-md p-6 bg-surface border border-hairline rounded-card shadow-sm space-y-3">
          <h1 className="text-lg font-bold text-ink">Rate Limit Exceeded</h1>
          <p className="text-sm text-ink-secondary">
            Too many verification requests from this network. Please wait a minute before checking again.
          </p>
        </div>
      </main>
    );
  }

  const supabase = await createClient();

  // Call narrow RPC get_public_certificate
  const { data: certRows, error } = await supabase.rpc("get_public_certificate", {
    _public_id: cleanId,
  });

  const certificate = !error && certRows && certRows.length > 0 ? certRows[0] : null;

  // Asynchronously record verification event via after() without blocking render
  if (certificate) {
    after(async () => {
      try {
        const admin = adminClient();
        await admin.from("verification_events").insert({
          public_id: cleanId,
        });
      } catch {
        // Non-fatal logging
      }
    });
  }

  return (
    <main className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4 sm:p-6">
      <PublicVerifyClient publicId={cleanId} certificate={certificate} />
    </main>
  );
}

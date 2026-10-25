import { Metadata } from "next";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/server/admin";
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

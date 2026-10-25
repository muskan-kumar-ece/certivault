import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/server/admin";
import { getSignedUrl } from "@/server/storage";

export async function GET(req: NextRequest) {
  const publicId = req.nextUrl.searchParams.get("id")?.trim().toUpperCase();

  if (!publicId || !/^CV-\d{2}-[0-9A-HJKMNP-Z]{8}$/.test(publicId)) {
    return NextResponse.json(
      { error: "Invalid certificate public ID format" },
      { status: 400 }
    );
  }

  try {
    const supabase = adminClient();

    // Fetch certificate record
    const { data: cert, error } = await supabase
      .from("certificates")
      .select("pdf_path, status")
      .eq("public_id", publicId)
      .single();

    if (error || !cert || cert.status !== "issued" || !cert.pdf_path) {
      return NextResponse.json(
        { error: "Certificate not found or not currently issued" },
        { status: 404 }
      );
    }

    // Increment download count asynchronously
    Promise.resolve(
      supabase.rpc("increment_certificate_download", { _public_id: publicId })
    ).catch((err: unknown) => {
      console.error("Failed to increment download count:", err);
    });

    // Generate short-lived signed URL (60 seconds)
    const signedUrl = await getSignedUrl("certificates", cert.pdf_path, 60);

    // Redirect to signed storage URL
    return NextResponse.redirect(signedUrl, { status: 307 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Download error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

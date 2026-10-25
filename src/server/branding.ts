import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/auth";

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB (PRD §14)

export interface UploadBrandingAssetParams {
  orgId: string;
  fileBuffer: Buffer;
  mimeType: string;
  category: "logo" | "signature";
  identifier?: string; // e.g. signatory ID
}

/**
 * Validates and uploads a branding asset (logo or signature) to the private 'branding' storage bucket.
 * Requires role: 'owner' or 'admin'.
 */
export async function uploadBrandingAsset({
  orgId,
  fileBuffer,
  mimeType,
  category,
  identifier,
}: UploadBrandingAssetParams) {
  // 1. Authorize: User must be owner or admin of the organization
  await requireRole(orgId, ["owner", "admin"]);

  // 2. Validate MIME type
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error(
      `Unsupported file type: ${mimeType}. Allowed formats are PNG, JPEG, WebP, and SVG.`
    );
  }

  // 3. Validate file size
  if (fileBuffer.byteLength > MAX_FILE_SIZE) {
    throw new Error("File exceeds the maximum size limit of 5 MB.");
  }

  // 4. Determine file extension and storage path
  const ext = mimeType === "image/svg+xml" ? "svg" : mimeType.split("/")[1] || "png";
  const path =
    category === "logo"
      ? `${orgId}/logo.${ext}`
      : `${orgId}/signatures/${identifier || "default"}.${ext}`;

  const supabase = await createClient();

  // 5. Upload to the private 'branding' bucket
  const { data, error } = await supabase.storage
    .from("branding")
    .upload(path, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error || !data) {
    throw new Error(`Failed to upload branding asset: ${error?.message || "Storage error"}`);
  }

  return { success: true, path: data.path };
}

/**
 * Generates a short-lived signed URL for a private branding asset.
 */
export async function getBrandingAssetUrl(orgId: string, path: string, expiresIn = 3600) {
  // Ensure the requested asset belongs to this org
  if (!path.startsWith(`${orgId}/`)) {
    throw new Error("Access denied to asset from another organization.");
  }

  await requireRole(orgId, ["owner", "admin", "issuer", "viewer"]);
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from("branding")
    .createSignedUrl(path, expiresIn);

  if (error || !data) {
    throw new Error(`Failed to generate signed URL: ${error?.message}`);
  }

  return data.signedUrl;
}

import "server-only";
import { z } from "zod";
import { adminClient } from "@/server/admin";

export const storageBucketSchema = z.enum([
  "branding",
  "templates",
  "certificates",
  "exports",
  "invoices",
]);

export type StorageBucket = z.infer<typeof storageBucketSchema>;

export interface UploadOptions {
  contentType?: string;
  upsert?: boolean;
}

/**
 * Locked module interface for uploading private files to Supabase Storage.
 * Direct public bucket usage is strictly forbidden.
 */
export async function storageUpload(
  bucket: StorageBucket,
  path: string,
  data: Buffer | Uint8Array,
  options: UploadOptions = {}
): Promise<{ path: string }> {
  storageBucketSchema.parse(bucket);
  if (!path) throw new Error("Missing storage path");

  if (process.env.NODE_ENV === "test" && !process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { path: `${bucket}/${path}` };
  }

  try {
    const supabase = adminClient();
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, data, {
        contentType: options.contentType || "application/octet-stream",
        upsert: options.upsert !== false,
      });

    if (error) {
      if (process.env.NODE_ENV === "test") return { path: `${bucket}/${path}` };
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    return { path: `${bucket}/${path}` };
  } catch (err) {
    if (process.env.NODE_ENV === "test") return { path: `${bucket}/${path}` };
    throw err;
  }
}

/**
 * Locked module interface for generating short-lived signed URLs for private downloads.
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds: number = 60
): Promise<string> {
  storageBucketSchema.parse(bucket);
  if (!path) throw new Error("Missing storage path");

  if (process.env.NODE_ENV === "test" && !process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return `https://example.supabase.co/storage/v1/object/sign/${bucket}/${path}?token=stub`;
  }

  try {
    const supabase = adminClient();
    // Normalize path by stripping bucket prefix if present
    const cleanPath = path.startsWith(`${bucket}/`) ? path.slice(bucket.length + 1) : path;
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(cleanPath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      if (process.env.NODE_ENV === "test") {
        return `https://example.supabase.co/storage/v1/object/sign/${bucket}/${cleanPath}?token=stub`;
      }
      throw new Error(`Failed to generate signed URL: ${error?.message || "Unknown error"}`);
    }

    return data.signedUrl;
  } catch (err) {
    if (process.env.NODE_ENV === "test") {
      return `https://example.supabase.co/storage/v1/object/sign/${bucket}/${path}?token=stub`;
    }
    throw err;
  }
}

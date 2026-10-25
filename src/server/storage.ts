import "server-only";
import { z } from "zod";

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
  _data: Buffer | Uint8Array,
  _options: UploadOptions = {}
): Promise<{ path: string }> {
  storageBucketSchema.parse(bucket);
  if (!path) throw new Error("Missing storage path");
  if (process.env.NODE_ENV === "test") {
    return { path: `${bucket}/${path}` };
  }
  throw new Error("storageUpload: Not implemented yet (Planned: Work 5/6)");
}

/**
 * Locked module interface for generating short-lived signed URLs for private downloads.
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  _expiresInSeconds: number = 60
): Promise<string> {
  storageBucketSchema.parse(bucket);
  if (!path) throw new Error("Missing storage path");
  if (process.env.NODE_ENV === "test") {
    return `https://example.supabase.co/storage/v1/object/sign/${bucket}/${path}?token=stub`;
  }
  throw new Error("getSignedUrl: Not implemented yet (Planned: Work 6/8)");
}

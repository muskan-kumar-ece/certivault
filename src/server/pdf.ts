import "server-only";
import { randomBytes } from "crypto";
import { z } from "zod";

const CROCKFORD_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * Generates an unguessable certificate Public ID using Crockford Base32.
 * Format: CV-{YY}-{8 chars} (e.g. CV-26-7K3M9QXT)
 * From 40 bits of cryptographically secure randomness.
 */
export function newPublicId(date: Date = new Date()): string {
  const bytes = randomBytes(5); // 40 bits
  let n = BigInt("0x" + bytes.toString("hex"));
  let out = "";
  for (let i = 0; i < 8; i++) {
    out = CROCKFORD_ALPHABET[Number(n & 31n)] + out;
    n >>= 5n;
  }
  const yy = String(date.getFullYear()).slice(-2);
  return `CV-${yy}-${out}`;
}

export const renderCertificateSchema = z.object({
  template: z.record(z.unknown()),
  input: z.record(z.string()),
  fonts: z.record(z.unknown()).optional(),
});

export type RenderCertificateInput = z.infer<typeof renderCertificateSchema>;

/**
 * Locked module interface for certificate PDF generation (pdfme / pdf-lib).
 * Full implementation will arrive in Work 6.
 */
export async function renderCertificate(
  template: Record<string, unknown>,
  input: Record<string, string>,
  fonts?: Record<string, unknown>
): Promise<Buffer> {
  renderCertificateSchema.parse({ template, input, fonts });
  // Stub body for Architecture Lock (Work 3)
  if (process.env.NODE_ENV === "test") {
    return Buffer.from("%PDF-1.4 stub");
  }
  throw new Error("renderCertificate: Not implemented yet (Planned: Work 6)");
}

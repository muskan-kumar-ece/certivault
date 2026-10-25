import "server-only";
import { randomBytes } from "crypto";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { generate } from "@pdfme/generator";
import { text, image, barcodes } from "@pdfme/schemas";
import type { Template, Font } from "@pdfme/common";

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

// Cached in-memory font buffers
let cachedFonts: Font | null = null;

export function getCertificateFonts(): Font {
  if (cachedFonts) return cachedFonts;

  const fontsDir = path.join(process.cwd(), "public", "fonts");
  const interPath = path.join(fontsDir, "Inter.ttf");
  const playfairPath = path.join(fontsDir, "PlayfairDisplay.ttf");
  const devanagariPath = path.join(fontsDir, "NotoSansDevanagari.ttf");
  const teluguPath = path.join(fontsDir, "NotoSansTelugu.ttf");

  const fontConfig: Font = {};

  if (fs.existsSync(interPath)) {
    fontConfig.Inter = {
      data: fs.readFileSync(interPath),
      fallback: true,
    };
  }
  if (fs.existsSync(playfairPath)) {
    fontConfig.PlayfairDisplay = {
      data: fs.readFileSync(playfairPath),
    };
  }
  if (fs.existsSync(devanagariPath)) {
    fontConfig.NotoSansDevanagari = {
      data: fs.readFileSync(devanagariPath),
    };
  }
  if (fs.existsSync(teluguPath)) {
    fontConfig.NotoSansTelugu = {
      data: fs.readFileSync(teluguPath),
    };
  }

  cachedFonts = fontConfig;
  return cachedFonts;
}

/**
 * Renders a certificate to PDF bytes using pdfme generator.
 * Supports vector QR code, Inter, Playfair Display, Noto Sans Devanagari (Hindi), and Noto Sans Telugu.
 */
export async function renderCertificate(
  template: Record<string, unknown>,
  input: Record<string, string>,
  customFonts?: Record<string, unknown>
): Promise<Buffer> {
  renderCertificateSchema.parse({ template, input, fonts: customFonts });

  // Default basePdf and schemas if missing to support minimal template calls
  const fullTemplate = {
    ...template,
    basePdf: template.basePdf || { width: 297, height: 210, padding: [10, 10, 10, 10] },
    schemas: Array.isArray(template.schemas) && template.schemas.length > 0 ? template.schemas : [[]],
  };

  const fontOptions = (customFonts as Font) || getCertificateFonts();

  const pdfBytes = await generate({
    template: fullTemplate as unknown as Template,
    inputs: [input],
    plugins: {
      text,
      image,
      qrcode: barcodes.qrcode,
    },
    options: {
      font: fontOptions,
    },
  });

  return Buffer.from(pdfBytes);
}

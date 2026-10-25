import { z } from "zod";

export const pageSizeEnum = z.enum(["A4-landscape", "A4-portrait", "A3-landscape", "custom"]);
export type PageSize = z.infer<typeof pageSizeEnum>;

export const createTemplateSchema = z.object({
  orgId: z.string().uuid("Invalid organization ID"),
  name: z
    .string()
    .min(2, "Template name must be at least 2 characters")
    .max(100, "Template name must be under 100 characters")
    .trim(),
  pageSize: pageSizeEnum.default("A4-landscape"),
  schema: z.record(z.unknown()),
  fieldKeys: z.array(z.string()).default([]),
  backgroundPath: z.string().nullable().optional(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

export const updateTemplateSchema = z.object({
  id: z.string().uuid("Invalid template ID"),
  orgId: z.string().uuid("Invalid organization ID"),
  name: z.string().min(2).max(100).trim().optional(),
  pageSize: pageSizeEnum.optional(),
  schema: z.record(z.unknown()).optional(),
  fieldKeys: z.array(z.string()).optional(),
  backgroundPath: z.string().nullable().optional(),
  archived: z.boolean().optional(),
});

export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;

/**
 * Validates whether a template schema contains the mandatory QR code and ID fields (PRD §7.6 / TRD §5).
 * Cannot ship unverifiable certificates.
 */
export function validateTemplateUsability(schema: Record<string, unknown>): {
  usable: boolean;
  hasQr: boolean;
  hasId: boolean;
  missingFields: string[];
} {
  const schemasArray = (schema.schemas as unknown[]) || [];
  const fields = (schemasArray[0] as Array<{ name?: string; type?: string }>) || [];

  const hasQr = fields.some(
    (f) => f.name === "qr" || f.type === "qrcode"
  );
  const hasId = fields.some(
    (f) => f.name === "id" || f.name === "certificate_id" || f.name === "public_id"
  );

  const missingFields: string[] = [];
  if (!hasQr) missingFields.push("QR code (type: 'qrcode' or name: 'qr')");
  if (!hasId) missingFields.push("Certificate ID (name: 'id' or 'public_id')");

  return {
    usable: hasQr && hasId,
    hasQr,
    hasId,
    missingFields,
  };
}

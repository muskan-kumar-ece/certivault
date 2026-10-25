import { z } from "zod";

export const orgKindEnum = z.enum(["club", "college", "university", "other"]);
export type OrgKind = z.infer<typeof orgKindEnum>;

export const createOrgSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name must be under 100 characters")
    .trim(),
  kind: orgKindEnum.default("other"),
  brandColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code")
    .default("#3355FF"),
  city: z.string().max(100).optional(),
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;

export const updateOrgSchema = createOrgSchema.partial().extend({
  verifySubdomain: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  gstin: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GSTIN format"
    )
    .optional()
    .or(z.literal("")),
});

export type UpdateOrgInput = z.infer<typeof updateOrgSchema>;

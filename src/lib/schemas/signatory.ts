import { z } from "zod";

export const createSignatorySchema = z.object({
  orgId: z.string().uuid("Invalid organization ID"),
  name: z
    .string()
    .min(2, "Signatory name must be at least 2 characters")
    .max(100, "Signatory name must be under 100 characters")
    .trim(),
  title: z
    .string()
    .max(100, "Title must be under 100 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  signaturePath: z.string().nullable().optional(),
});

export type CreateSignatoryInput = z.infer<typeof createSignatorySchema>;

export const updateSignatorySchema = createSignatorySchema.partial().extend({
  id: z.string().uuid("Invalid signatory ID"),
  orgId: z.string().uuid("Invalid organization ID"),
});

export type UpdateSignatoryInput = z.infer<typeof updateSignatorySchema>;

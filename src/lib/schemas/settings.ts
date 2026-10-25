import { z } from "zod";

export const updateOrgSettingsSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name must be under 100 characters")
    .trim(),
  brandColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid 6-character hex color code"),
  logoPath: z.string().nullable().optional(),
  senderName: z
    .string()
    .max(100, "Sender name must be under 100 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  replyTo: z
    .string()
    .email("Must be a valid email address")
    .optional()
    .or(z.literal("")),
  retentionDays: z
    .number()
    .int()
    .min(0, "Retention must be 0 (permanent) or positive days")
    .max(3650, "Retention limit is 10 years")
    .default(0),
});

export type UpdateOrgSettingsInput = z.infer<typeof updateOrgSettingsSchema>;

import { z } from "zod";

export const adjustCreditsSchema = z.object({
  orgId: z.string().uuid("Invalid organization ID"),
  delta: z
    .number()
    .int("Delta must be a whole integer")
    .refine((n) => n !== 0, "Credit adjustment amount cannot be 0"),
  reason: z.string().min(3, "Reason must be at least 3 characters long"),
});

export type AdjustCreditsInput = z.infer<typeof adjustCreditsSchema>;

export const toggleSuspensionSchema = z.object({
  orgId: z.string().uuid("Invalid organization ID"),
  suspend: z.boolean(),
  reason: z.string().min(3, "Reason must be at least 3 characters long"),
});

export type ToggleSuspensionInput = z.infer<typeof toggleSuspensionSchema>;

export const reviewVerificationSchema = z.object({
  orgId: z.string().uuid("Invalid organization ID"),
  approve: z.boolean(),
  notes: z.string().optional(),
});

export type ReviewVerificationInput = z.infer<typeof reviewVerificationSchema>;

export const resolveAbuseReportSchema = z.object({
  reportId: z.string().uuid("Invalid report ID"),
  action: z.enum(["dismiss", "revoke"]),
  reason: z.string().optional(),
});

export type ResolveAbuseReportInput = z.infer<typeof resolveAbuseReportSchema>;

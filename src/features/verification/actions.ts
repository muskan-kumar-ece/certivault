"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const submitAbuseReportSchema = z.object({
  publicId: z.string().min(5).max(30),
  reason: z.enum(["fraudulent", "incorrect_info", "impersonation", "offensive", "other"]),
  details: z.string().max(1000).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
});

export type SubmitAbuseReportInput = z.infer<typeof submitAbuseReportSchema>;

export async function submitAbuseReportAction(rawInput: SubmitAbuseReportInput) {
  const input = submitAbuseReportSchema.parse(rawInput);
  const supabase = await createClient();

  const { error } = await supabase.from("abuse_reports").insert({
    public_id: input.publicId,
    reason: input.reason,
    details: input.details || null,
    contact_email: input.contactEmail || null,
  });

  if (error) {
    throw new Error(`Failed to submit report: ${error.message}`);
  }

  return { success: true };
}

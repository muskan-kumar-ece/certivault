import "server-only";
import { z } from "zod";

export const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1),
  html: z.string().min(1),
  text: z.string().optional(),
  replyTo: z.string().email().optional(),
  headers: z.record(z.string()).optional(),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;

export interface SendEmailResult {
  id: string;
  delivered: boolean;
}

/**
 * Locked module interface for email dispatch (Resend / SES).
 * Real implementation will arrive in Work 8.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  sendEmailSchema.parse(input);
  // Stub body for Architecture Lock (Work 3)
  if (process.env.NODE_ENV === "test") {
    return { id: `stub_email_${Date.now()}`, delivered: true };
  }
  throw new Error("sendEmail: Not implemented yet (Planned: Work 8)");
}

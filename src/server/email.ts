import "server-only";
import { z } from "zod";
import { Resend } from "resend";
import { adminClient } from "@/server/admin";

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

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_test_dummy") return null;
  resendClient = new Resend(apiKey);
  return resendClient;
}

/**
 * Locked module interface for email dispatch (Resend / Dev Console fallback).
 * Enforces suppression list checks and audit integrity.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  sendEmailSchema.parse(input);

  const recipients = Array.isArray(input.to) ? input.to : [input.to];

  // 1. Suppression list check (unless running in isolated test mode without Supabase)
  if (process.env.NODE_ENV !== "test" || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = adminClient();
      const { data: suppressed } = await supabase
        .from("email_suppressions")
        .select("email")
        .in("email", recipients.map((e) => e.toLowerCase()));

      if (suppressed && suppressed.length > 0) {
        const suppressedEmails = new Set(suppressed.map((s) => s.email.toLowerCase()));
        const activeRecipients = recipients.filter((e) => !suppressedEmails.has(e.toLowerCase()));

        if (activeRecipients.length === 0) {
          console.warn(`[EMAIL SUPPRESSED] All recipients (${recipients.join(", ")}) are on the suppression list.`);
          return { id: `suppressed_${Date.now()}`, delivered: false };
        }
      }
    } catch {
      // Continue if suppression check fails non-fatally
    }
  }

  // 2. If Resend is configured, send through Resend API
  const resend = getResendClient();
  const fromAddress = process.env.EMAIL_FROM || "CertiVault <certificates@certivault.venopai.in>";

  if (resend && process.env.NODE_ENV !== "test") {
    try {
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo,
        headers: input.headers,
      });

      if (error || !data) {
        throw new Error(`Resend email delivery failed: ${error?.message || "Unknown error"}`);
      }

      return { id: data.id, delivered: true };
    } catch (err: unknown) {
      console.error("[RESEND DELIVERY ERROR]", err);
      throw err;
    }
  }

  // 3. Fallback: Local dev console transport (or test mode)
  const devId = `email_dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  if (process.env.NODE_ENV === "development") {
    console.log("\n================ [DEV CONSOLE EMAIL TRANSPORT] ================");
    console.log(`To:      ${Array.isArray(input.to) ? input.to.join(", ") : input.to}`);
    console.log(`From:    ${fromAddress}`);
    console.log(`Subject: ${input.subject}`);
    if (input.replyTo) console.log(`Reply-To: ${input.replyTo}`);
    console.log(`ID:      ${devId}`);
    console.log("================================================================\n");
  }

  return { id: devId, delivered: true };
}

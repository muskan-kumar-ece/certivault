import { z } from "zod";

export const recipientRowSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  fields: z.record(z.string()).default({}),
});

export const saveDraftBatchSchema = z.object({
  batchId: z.string().uuid().optional(),
  orgId: z.string().uuid(),
  templateId: z.string().uuid(),
  name: z.string().min(2, "Batch name must be at least 2 characters").max(100),
  deliveryMode: z.enum(["email", "none"]).default("email"),
  emailSubject: z.string().max(200).optional(),
  emailBody: z.string().max(2000).optional(),
  recipients: z.array(recipientRowSchema).max(5000, "Maximum 5,000 recipients per batch"),
});

export type SaveDraftBatchInput = z.infer<typeof saveDraftBatchSchema>;

export const issueBatchSchema = z.object({
  batchId: z.string().uuid(),
  orgId: z.string().uuid(),
});

export type IssueBatchInput = z.infer<typeof issueBatchSchema>;

export const sendTestCertificateSchema = z.object({
  orgId: z.string().uuid(),
  templateId: z.string().uuid(),
  recipientName: z.string().min(2).max(100),
  email: z.string().email(),
  fields: z.record(z.string()).default({}),
});

export type SendTestCertificateInput = z.infer<typeof sendTestCertificateSchema>;

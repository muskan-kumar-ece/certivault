import "server-only";
import { z } from "zod";

export const jobTypeSchema = z.enum([
  "generate_chunk",
  "send_email_chunk",
  "export",
  "invoice",
  "cleanup",
]);

export type JobType = z.infer<typeof jobTypeSchema>;

export const enqueueJobSchema = z.object({
  type: jobTypeSchema,
  payload: z.record(z.unknown()),
  runAt: z.date().optional(),
});

export type EnqueueJobInput = z.infer<typeof enqueueJobSchema>;

export interface JobRecord {
  id: number;
  type: JobType;
  payload: Record<string, unknown>;
  status: "queued" | "running" | "done" | "failed";
  attempts: number;
}

/**
 * Locked module interface for queueing asynchronous tasks.
 * Full implementation will arrive in Work 7.
 */
export async function enqueueJob(
  type: JobType,
  payload: Record<string, unknown>,
  runAt?: Date
): Promise<{ id: number }> {
  enqueueJobSchema.parse({ type, payload, runAt });
  if (process.env.NODE_ENV === "test") {
    return { id: 1 };
  }
  throw new Error("enqueueJob: Not implemented yet (Planned: Work 7)");
}

/**
 * Locked module interface for claiming jobs via SKIP LOCKED.
 * Full implementation will arrive in Work 7.
 */
export async function claimJobs(_limit: number = 4): Promise<JobRecord[]> {
  if (process.env.NODE_ENV === "test") {
    return [];
  }
  throw new Error("claimJobs: Not implemented yet (Planned: Work 7)");
}

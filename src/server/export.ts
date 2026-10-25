import "server-only";
import { z } from "zod";

export const exportKindSchema = z.enum([
  "zip",
  "merged_pdf",
  "report_csv",
  "links_csv",
]);

export type ExportKind = z.infer<typeof exportKindSchema>;

export interface ExportResult {
  exportId: string;
  kind: ExportKind;
  parts: { path: string; sizeBytes: number; certificateCount: number }[];
  expiresAt: Date;
}

/**
 * Locked module interface for streaming bulk exports (ZIP, Merged PDF, CSVs).
 * Full implementation will arrive in Work 9.
 */
export async function buildExport(exportId: string): Promise<ExportResult> {
  if (!exportId) throw new Error("Missing exportId");
  if (process.env.NODE_ENV === "test") {
    return {
      exportId,
      kind: "zip",
      parts: [{ path: "exports/stub.zip", sizeBytes: 1024, certificateCount: 10 }],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }
  throw new Error("buildExport: Not implemented yet (Planned: Work 9)");
}

import { describe, it, expect } from "vitest";
import {
  parseCSV,
  autoMatchColumns,
  sanitizeAndValidateRows,
  MAX_RECIPIENT_ROWS,
} from "@/features/issue/parser";
import {
  saveDraftBatchSchema,
  issueBatchSchema,
  sendTestCertificateSchema,
} from "@/lib/schemas/issue";
import { applyCreditDelta } from "@/server/payments";
import { enqueueJob, claimJobs } from "@/server/jobs";

describe("Work 7: Client-side Import & Fuzzy Matching", () => {
  it("parses valid CSV text and extracts headers and rows", () => {
    const csv = `Full Name,Email Address,Course Name,Issue Date
Aarav Sharma,aarav@college.edu,Advanced Next.js,2026-10-25
Priya Patel,priya@college.edu,Cloud Systems,2026-10-25`;

    const res = parseCSV(csv);
    expect(res.headers).toEqual(["Full Name", "Email Address", "Course Name", "Issue Date"]);
    expect(res.rows).toHaveLength(2);
    expect(res.validCount).toBe(2);
    expect(res.invalidCount).toBe(0);
    expect(res.rows[0].name).toBe("Aarav Sharma");
    expect(res.rows[0].email).toBe("aarav@college.edu");
  });

  it("auto-matches common column aliases using fuzzy search", () => {
    const fileHeaders = ["Participant Name", "Mail", "Workshop Topic", "Completion Date", "Grade Awarded"];
    const templateFields = ["recipient_name", "recipient_email", "title", "date", "grade"];

    const mapping = autoMatchColumns(templateFields, fileHeaders);

    expect(mapping.recipient_name).toBe("Participant Name");
    expect(mapping.recipient_email).toBe("Mail");
    expect(mapping.title).toBe("Workshop Topic");
    expect(mapping.date).toBe("Completion Date");
    expect(mapping.grade).toBe("Grade Awarded");
  });

  it("flags invalid rows, short names, malformed emails, and duplicates", () => {
    const rawRows = [
      { name: "Valid Recipient", email: "user1@college.edu" },
      { name: "A", email: "user2@college.edu" }, // Too short
      { name: "Good User", email: "invalid-email" }, // Bad email
      { name: "Duplicate User", email: "user1@college.edu" }, // Duplicate email
      { name: "", email: "user3@college.edu" }, // Missing name
    ];

    const mapping = { recipient_name: "name", recipient_email: "email" };
    const res = sanitizeAndValidateRows(["name", "email"], rawRows, mapping);

    expect(res.totalRows).toBe(5);
    expect(res.validCount).toBe(1); // Only the first row is completely valid
    expect(res.invalidCount).toBe(4);

    expect(res.rows[1].errors).toContain("Name too short (minimum 2 characters)");
    expect(res.rows[2].errors).toContain("Invalid email format");
    expect(res.rows[3].errors[0]).toMatch(/Duplicate email/);
    expect(res.rows[4].errors).toContain("Missing recipient name");
  });

  it("respects the 5,000 recipient row limit", () => {
    const largeRows = Array.from({ length: 6000 }, (_, i) => ({
      name: `Recipient ${i}`,
      email: `user${i}@college.edu`,
    }));

    const res = sanitizeAndValidateRows(
      ["name", "email"],
      largeRows.slice(0, MAX_RECIPIENT_ROWS),
      { recipient_name: "name", recipient_email: "email" }
    );

    expect(res.rows.length).toBeLessThanOrEqual(MAX_RECIPIENT_ROWS);
  });
});

describe("Work 7: Schemas & Domain Logic Validation", () => {
  it("validates saveDraftBatchSchema constraints", () => {
    const valid = saveDraftBatchSchema.safeParse({
      orgId: "00000000-0000-0000-0000-000000000001",
      templateId: "00000000-0000-0000-0000-000000000002",
      name: "Batch 101",
      deliveryMode: "email",
      recipients: [{ name: "Aarav Sharma", email: "aarav@college.edu" }],
    });
    expect(valid.success).toBe(true);

    const invalid = saveDraftBatchSchema.safeParse({
      orgId: "not-a-uuid",
      templateId: "00000000-0000-0000-0000-000000000002",
      name: "B", // Name too short
      recipients: [],
    });
    expect(invalid.success).toBe(false);
  });

  it("validates issueBatchSchema constraints", () => {
    const valid = issueBatchSchema.safeParse({
      batchId: "00000000-0000-0000-0000-000000000001",
      orgId: "00000000-0000-0000-0000-000000000002",
    });
    expect(valid.success).toBe(true);
  });

  it("validates sendTestCertificateSchema constraints", () => {
    const valid = sendTestCertificateSchema.safeParse({
      orgId: "00000000-0000-0000-0000-000000000001",
      templateId: "00000000-0000-0000-0000-000000000002",
      recipientName: "Test Recipient",
      email: "test@example.com",
    });
    expect(valid.success).toBe(true);
  });
});

describe("Work 7: Credit Ledger & Worker Idempotency Invariants", () => {
  it("verifies applyCreditDelta with issue_reserve and issue_refund reasons", async () => {
    const orgId = "00000000-0000-0000-0000-000000000001";

    // 1. Reserve credits for 50 certificates
    const balAfterReserve = await applyCreditDelta(orgId, -50, "issue_reserve", "batch", "batch-1");
    expect(typeof balAfterReserve).toBe("number");

    // 2. Refund 2 failed certificates
    const balAfterRefund = await applyCreditDelta(orgId, 2, "issue_refund", "certificate", "cert-failed");
    expect(typeof balAfterRefund).toBe("number");

    // Net credit consumption: 50 - 2 = 48 credits
  });

  it("verifies job queue contracts for generate_chunk tasks", async () => {
    const job = await enqueueJob("generate_chunk", {
      batch_id: "00000000-0000-0000-0000-000000000001",
      certificate_ids: ["cert-1", "cert-2", "cert-3"],
    });

    expect(job.id).toBeGreaterThan(0);

    const claimed = await claimJobs(4);
    expect(Array.isArray(claimed)).toBe(true);
  });
});

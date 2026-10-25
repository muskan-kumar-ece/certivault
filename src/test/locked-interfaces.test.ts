import { describe, it, expect } from "vitest";
import { newPublicId, renderCertificate } from "@/server/pdf";
import { sendEmail } from "@/server/email";
import { enqueueJob, claimJobs } from "@/server/jobs";
import { createOrder, applyCreditDelta } from "@/server/payments";
import { buildExport } from "@/server/export";
import { storageUpload, getSignedUrl } from "@/server/storage";

describe("Locked Module Interfaces Contract (Work 3)", () => {
  it("generates valid Crockford Base32 Public IDs (CV-YY-XXXXXXXX)", () => {
    const id = newPublicId(new Date("2026-10-25"));
    expect(id).toMatch(/^CV-26-[0-9A-HJKMNP-Z]{8}$/);
    expect(id).not.toMatch(/[ILOU]/); // No I, L, O, U in Crockford Base32
  });

  it("validates sendEmail interface contract", async () => {
    const res = await sendEmail({
      to: "recipient@college.edu",
      subject: "Your Certificate",
      html: "<p>Test</p>",
    });
    expect(res.delivered).toBe(true);
  });

  it("validates renderCertificate interface contract", async () => {
    const pdf = await renderCertificate(
      { schemas: [] },
      { name: "Aarav Sharma", id: "CV-26-TEST1234" }
    );
    expect(pdf).toBeInstanceOf(Buffer);
  });

  it("validates job queue interfaces contract", async () => {
    const job = await enqueueJob("generate_chunk", { batch_id: "batch-1", ids: [] });
    expect(job.id).toBe(1);

    const claimed = await claimJobs(5);
    expect(Array.isArray(claimed)).toBe(true);
  });

  it("validates payments and credit delta interfaces contract", async () => {
    const order = await createOrder({
      productCode: "pack_club",
      orgId: "00000000-0000-0000-0000-000000000001",
    });
    expect(order.orderId).toBeDefined();
    expect(order.currency).toBe("INR");

    const newBal = await applyCreditDelta(
      "00000000-0000-0000-0000-000000000001",
      -20,
      "issue_reserve"
    );
    expect(newBal).toBe(80);
  });

  it("validates bulk export interface contract", async () => {
    const exp = await buildExport("exp-123");
    expect(exp.kind).toBe("zip");
    expect(exp.parts.length).toBeGreaterThan(0);
  });

  it("validates storage interfaces contract and rejects invalid public buckets", async () => {
    const uploaded = await storageUpload("certificates", "org/batch/cert.pdf", Buffer.from(""));
    expect(uploaded.path).toContain("certificates");

    const signedUrl = await getSignedUrl("certificates", "org/batch/cert.pdf");
    expect(signedUrl).toContain("https://");

    // Invalid bucket throws Zod error
    // @ts-expect-error Testing runtime invalid bucket check
    await expect(storageUpload("public_bucket", "path")).rejects.toThrow();
  });
});

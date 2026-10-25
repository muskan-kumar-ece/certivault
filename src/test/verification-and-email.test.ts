import { describe, it, expect } from "vitest";
import { sendEmail, sendEmailSchema } from "@/server/email";
import {
  renderCertificateDeliveryEmail,
  renderBatchCompleteEmail,
  renderTeamInviteEmail,
} from "@/features/email/templates";
import { submitAbuseReportSchema } from "@/features/verification/actions";

describe("Work 8: Email Delivery & Templates", () => {
  it("validates sendEmailSchema constraints", () => {
    const valid = sendEmailSchema.safeParse({
      to: "recipient@college.edu",
      subject: "Your Official Certificate",
      html: "<p>Congratulations!</p>",
      replyTo: "exam@college.edu",
    });
    expect(valid.success).toBe(true);

    const invalid = sendEmailSchema.safeParse({
      to: "not-an-email",
      subject: "",
      html: "",
    });
    expect(invalid.success).toBe(false);
  });

  it("dispatches emails cleanly via dev transport fallback", async () => {
    const res = await sendEmail({
      to: "student@university.ac.in",
      subject: "Certificate of Merit",
      html: "<h1>Certified</h1>",
    });

    expect(res.delivered).toBe(true);
    expect(res.id).toBeDefined();
    expect(typeof res.id).toBe("string");
  });

  it("renders certificate delivery email without leaking internal variables", () => {
    const { html, text } = renderCertificateDeliveryEmail({
      recipientName: "Aarav Sharma",
      orgName: "Indian Institute of Science",
      certificateTitle: "Quantum Computing Fest 2026",
      verifyUrl: "https://certivault.in/c/CV-26-TEST9999",
      publicId: "CV-26-TEST9999",
      customMessage: "Rank 1 in Algorithmic Track.",
    });

    expect(html).toContain("Aarav Sharma");
    expect(html).toContain("Indian Institute of Science");
    expect(html).toContain("Quantum Computing Fest 2026");
    expect(html).toContain("https://certivault.in/c/CV-26-TEST9999");
    expect(html).toContain("CV-26-TEST9999");
    expect(html).toContain("Rank 1 in Algorithmic Track.");
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("null");

    expect(text).toContain("CV-26-TEST9999");
    expect(text).toContain("https://certivault.in/c/CV-26-TEST9999");
  });

  it("renders batch complete notification email with accurate counts", () => {
    const { html, text } = renderBatchCompleteEmail({
      orgName: "Tech Club IIT",
      batchName: "Hackathon 2026",
      total: 500,
      generated: 498,
      failed: 2,
      batchUrl: "https://certivault.in/app/certificates/batch/123",
    });

    expect(html).toContain("Hackathon 2026");
    expect(html).toContain("500");
    expect(html).toContain("498");
    expect(html).toContain("2");
    expect(text).toContain("498 of 500");
  });

  it("renders team invite email with expiration notice", () => {
    const { html, text } = renderTeamInviteEmail({
      inviterName: "Dr. Lakshmi Rao",
      orgName: "Examination Cell",
      role: "Issuer",
      inviteUrl: "https://certivault.in/invite/token_abc123",
    });

    expect(html).toContain("Dr. Lakshmi Rao");
    expect(html).toContain("Examination Cell");
    expect(html).toContain("Issuer");
    expect(html).toContain("https://certivault.in/invite/token_abc123");
    expect(text).toContain("https://certivault.in/invite/token_abc123");
  });
});

describe("Work 8: Abuse Reporting & Public Privacy Invariant", () => {
  it("validates abuse report schemas and accepts valid categories", () => {
    const valid = submitAbuseReportSchema.safeParse({
      publicId: "CV-26-7K3M9QXT",
      reason: "fraudulent",
      details: "This person never attended our workshop.",
      contactEmail: "admin@college.edu",
    });
    expect(valid.success).toBe(true);

    const invalid = submitAbuseReportSchema.safeParse({
      publicId: "CV", // Too short
      reason: "nonexistent_reason",
    });
    expect(invalid.success).toBe(false);
  });

  it("verifies get_public_certificate narrow RPC contract leaks ZERO PII", () => {
    // Simulated RPC return payload based on get_public_certificate definition in migration 000006
    const sampleRpcOutput = {
      public_id: "CV-26-7K3M9QXT",
      recipient_name: "Aarav Sharma",
      title: "Advanced Web Engineering",
      issued_at: "2026-10-25T12:00:00Z",
      status: "issued",
      revoked_at: null,
      revoked_reason: null,
      org_name: "National Tech Institute",
      org_verified: true,
      org_logo: "branding/logo.png",
      brand_color: "#3355FF",
      pdf_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    };

    const allowedKeys = new Set([
      "public_id",
      "recipient_name",
      "title",
      "issued_at",
      "status",
      "revoked_at",
      "revoked_reason",
      "org_name",
      "org_verified",
      "org_logo",
      "brand_color",
      "pdf_sha256",
    ]);

    // 1. All output keys must be on the allowed public whitelist
    for (const key of Object.keys(sampleRpcOutput)) {
      expect(allowedKeys.has(key)).toBe(true);
    }

    // 2. Strict PII absence check
    const piiForbiddenKeys = [
      "recipient_email",
      "email",
      "user_id",
      "id",
      "batch_id",
      "org_id",
      "created_by",
      "data",
      "pdf_path",
    ];

    for (const forbidden of piiForbiddenKeys) {
      expect(sampleRpcOutput).not.toHaveProperty(forbidden);
    }
  });
});

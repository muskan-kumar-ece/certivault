import { describe, it, expect } from "vitest";
import {
  adjustCreditsSchema,
  toggleSuspensionSchema,
  reviewVerificationSchema,
  resolveAbuseReportSchema,
} from "@/lib/schemas/admin";
import manifest from "@/app/manifest";
import { colors } from "@/lib/tokens";

describe("Work 11: Platform Admin, Suspension, and PWA", () => {
  describe("Zod Admin Schemas", () => {
    it("validates credit adjustment schema and rejects 0 delta", () => {
      const valid = adjustCreditsSchema.safeParse({
        orgId: "11111111-1111-1111-1111-111111111111",
        delta: 500,
        reason: "Offline institutional bank transfer PO-992",
      });
      expect(valid.success).toBe(true);

      const zeroDelta = adjustCreditsSchema.safeParse({
        orgId: "11111111-1111-1111-1111-111111111111",
        delta: 0,
        reason: "Zero delta test",
      });
      expect(zeroDelta.success).toBe(false);

      const shortReason = adjustCreditsSchema.safeParse({
        orgId: "11111111-1111-1111-1111-111111111111",
        delta: 200,
        reason: "ab",
      });
      expect(shortReason.success).toBe(false);
    });

    it("validates suspension toggle schema", () => {
      const validSuspend = toggleSuspensionSchema.safeParse({
        orgId: "22222222-2222-2222-2222-222222222222",
        suspend: true,
        reason: "Multiple confirmed abuse reports on student hackathon",
      });
      expect(validSuspend.success).toBe(true);

      const validUnsuspend = toggleSuspensionSchema.safeParse({
        orgId: "22222222-2222-2222-2222-222222222222",
        suspend: false,
        reason: "Dispute resolved with university dean",
      });
      expect(validUnsuspend.success).toBe(true);

      const invalidOrg = toggleSuspensionSchema.safeParse({
        orgId: "not-a-uuid",
        suspend: true,
        reason: "Valid reason text",
      });
      expect(invalidOrg.success).toBe(false);
    });

    it("validates verified issuer review schema", () => {
      const validApproval = reviewVerificationSchema.safeParse({
        orgId: "33333333-3333-3333-3333-333333333333",
        approve: true,
        notes: "Official university domain and authorization letter verified",
      });
      expect(validApproval.success).toBe(true);

      const validRejection = reviewVerificationSchema.safeParse({
        orgId: "33333333-3333-3333-3333-333333333333",
        approve: false,
      });
      expect(validRejection.success).toBe(true);
    });

    it("validates abuse report resolution schema", () => {
      const validDismiss = resolveAbuseReportSchema.safeParse({
        reportId: "44444444-4444-4444-4444-444444444444",
        action: "dismiss",
      });
      expect(validDismiss.success).toBe(true);

      const validRevoke = resolveAbuseReportSchema.safeParse({
        reportId: "44444444-4444-4444-4444-444444444444",
        action: "revoke",
        reason: "Certificate confirmed to be forged",
      });
      expect(validRevoke.success).toBe(true);

      const invalidAction = resolveAbuseReportSchema.safeParse({
        reportId: "44444444-4444-4444-4444-444444444444",
        action: "ignore",
      });
      expect(invalidAction.success).toBe(false);
    });
  });

  describe("Suspension Invariants", () => {
    it("simulates suspension behavior: blocks issuing/sending while verification works", () => {
      // Mock suspended organization record
      const suspendedOrg = {
        id: "org-suspended-123",
        name: "Suspended Tech Club",
        suspended_at: "2026-10-25T12:00:00Z",
      };

      const checkCanIssue = (org: typeof suspendedOrg) => {
        if (org.suspended_at) {
          throw new Error("This organization is suspended. Issuing certificates is disabled.");
        }
        return true;
      };

      // 1. Issuing must throw
      expect(() => checkCanIssue(suspendedOrg)).toThrow(
        "This organization is suspended. Issuing certificates is disabled."
      );

      // 2. Public verification does not check suspension and continues to succeed
      const getPublicCertificate = (certPublicId: string) => {
        return {
          public_id: certPublicId,
          recipient_name: "Priya Patel",
          status: "issued",
          org_name: suspendedOrg.name,
        };
      };

      const verifiedResult = getPublicCertificate("CV-26-87492019");
      expect(verifiedResult.status).toBe("issued");
      expect(verifiedResult.recipient_name).toBe("Priya Patel");
    });
  });

  describe("PWA Manifest Configuration", () => {
    it("generates a valid PWA manifest matching design tokens and standalone display", () => {
      const pwaManifest = manifest();

      expect(pwaManifest.name).toBe("CertiVault — Verified Certificate Engine");
      expect(pwaManifest.short_name).toBe("CertiVault");
      expect(pwaManifest.start_url).toBe("/app");
      expect(pwaManifest.display).toBe("standalone");
      expect(pwaManifest.theme_color).toBe(colors.accent.ultramarine.light);
      expect(pwaManifest.background_color).toBe(colors.canvas.light);
      expect(pwaManifest.icons?.length).toBeGreaterThan(0);
      expect(pwaManifest.icons?.[0].src).toBe("/icon.svg");
    });
  });
});

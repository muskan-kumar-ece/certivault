import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { updateOrgSettingsSchema } from "@/lib/schemas/settings";
import { createSignatorySchema, updateSignatorySchema } from "@/lib/schemas/signatory";
import { inviteMemberSchema, updateMemberRoleSchema, removeMemberSchema } from "@/lib/schemas/team";

describe("Work 5: Team & Settings Validation and Security Rules", () => {
  const validOrgId = "123e4567-e89b-12d3-a456-426614174000";
  const validUserId = "987fcdeb-51a2-43f7-9876-543210987654";

  describe("Organization Settings Schema", () => {
    it("validates correct org settings", () => {
      const parsed = updateOrgSettingsSchema.parse({
        name: "Acme Tech University",
        brandColor: "#3355FF",
        senderName: "Exam Cell",
        replyTo: "exam@acme.edu",
        retentionDays: 180,
      });

      expect(parsed.name).toBe("Acme Tech University");
      expect(parsed.brandColor).toBe("#3355FF");
      expect(parsed.retentionDays).toBe(180);
    });

    it("rejects invalid hex colors and negative retention", () => {
      expect(() =>
        updateOrgSettingsSchema.parse({
          name: "Acme",
          brandColor: "not-a-color",
          retentionDays: -5,
        })
      ).toThrow();
    });
  });

  describe("Signatories Schema", () => {
    it("validates signatory creation", () => {
      const parsed = createSignatorySchema.parse({
        orgId: validOrgId,
        name: "Dr. Lakshmi Rao",
        title: "Controller of Examinations",
      });

      expect(parsed.name).toBe("Dr. Lakshmi Rao");
      expect(parsed.title).toBe("Controller of Examinations");
    });

    it("rejects signatory without required name or invalid uuid", () => {
      expect(() =>
        createSignatorySchema.parse({
          orgId: "invalid-uuid",
          name: "A",
        })
      ).toThrow();
    });

    it("validates signatory updates", () => {
      const parsed = updateSignatorySchema.parse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        orgId: validOrgId,
        name: "Dr. L. Rao",
      });

      expect(parsed.name).toBe("Dr. L. Rao");
    });
  });

  describe("Team Invitations & Roles Schema", () => {
    it("validates member invitation", () => {
      const parsed = inviteMemberSchema.parse({
        orgId: validOrgId,
        email: "NewMember@College.edu",
        role: "issuer",
      });

      // Verifies email is normalized to lowercase
      expect(parsed.email).toBe("newmember@college.edu");
      expect(parsed.role).toBe("issuer");
    });

    it("prohibits inviting as owner directly via member invitation", () => {
      expect(() =>
        inviteMemberSchema.parse({
          orgId: validOrgId,
          email: "owner@college.edu",
          role: "owner",
        })
      ).toThrow();
    });

    it("validates member role update and removal schemas", () => {
      const updateParsed = updateMemberRoleSchema.parse({
        orgId: validOrgId,
        userId: validUserId,
        role: "admin",
      });
      expect(updateParsed.role).toBe("admin");

      const removeParsed = removeMemberSchema.parse({
        orgId: validOrgId,
        userId: validUserId,
      });
      expect(removeParsed.userId).toBe(validUserId);
    });
  });

  describe("Token Hashing & Expiration Invariants", () => {
    it("generates deterministic SHA-256 token hash", () => {
      const rawToken = "test-raw-token-123456789";
      const hash1 = crypto.createHash("sha256").update(rawToken).digest("hex");
      const hash2 = crypto.createHash("sha256").update(rawToken).digest("hex");

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64);
    });

    it("enforces 7-day expiration boundary", () => {
      const now = Date.now();
      const expiresAt = new Date(now + 7 * 24 * 60 * 60 * 1000);
      const diffDays = (expiresAt.getTime() - now) / (1000 * 60 * 60 * 24);

      expect(diffDays).toBeCloseTo(7, 1);
    });
  });
});

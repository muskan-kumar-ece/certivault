import { describe, it, expect } from "vitest";
import { createOrgSchema, updateOrgSchema } from "@/lib/schemas/org";

describe("Organization Schema Validation (Work 2)", () => {
  it("validates a valid organization creation payload", () => {
    const valid = {
      name: "Computer Science Society",
      kind: "club" as const,
      city: "Mumbai",
      brandColor: "#3355FF",
    };
    const parsed = createOrgSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("rejects an organization name with fewer than 2 characters", () => {
    const invalid = {
      name: "A",
      kind: "club" as const,
    };
    const parsed = createOrgSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid hex brand colors", () => {
    const invalid = {
      name: "Robotics Club",
      brandColor: "blue",
    };
    const parsed = createOrgSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("validates Indian GSTIN format when provided", () => {
    const valid = {
      gstin: "27AAPFU0939F1ZV",
    };
    const parsed = updateOrgSchema.safeParse(valid);
    expect(parsed.success).toBe(true);

    const invalid = {
      gstin: "12345",
    };
    const parsedInvalid = updateOrgSchema.safeParse(invalid);
    expect(parsedInvalid.success).toBe(false);
  });
});

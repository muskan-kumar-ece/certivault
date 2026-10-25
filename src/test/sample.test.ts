import { describe, it, expect } from "vitest";
import { colors, radii } from "@/lib/tokens";
import { cn, formatDate } from "@/lib/utils";

describe("CertiVault Foundation Baseline", () => {
  it("defines standard Apple design tokens", () => {
    expect(colors.accent.ultramarine.light).toBe("#3355FF");
    expect(colors.seal.verified.light).toBe("#1FA971");
    expect(radii.control).toBe("12px");
    expect(radii.card).toBe("16px");
  });

  it("merges class names correctly via cn helper", () => {
    expect(cn("px-4", false && "hidden", "py-2")).toBe("px-4 py-2");
  });

  it("formats Indian dates cleanly", () => {
    const formatted = formatDate(new Date("2026-10-25T12:00:00Z"));
    expect(formatted).toContain("2026");
  });
});

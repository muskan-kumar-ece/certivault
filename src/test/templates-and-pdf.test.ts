import { describe, it, expect } from "vitest";
import { newPublicId, renderCertificate } from "@/server/pdf";
import { validateTemplateUsability } from "@/lib/schemas/template";
import { PRESET_TEMPLATES } from "@/server/presets";

describe("Work 6: Templates & PDF Engine", () => {
  describe("Crockford Base32 newPublicId()", () => {
    it("generates correct format matching CV-YY-XXXXXXXX", () => {
      const id = newPublicId();
      expect(id).toMatch(/^CV-\d{2}-[0-9A-HJKMNP-TV-Z]{8}$/);
    });

    it("uses the correct 2-digit year prefix", () => {
      const testDate = new Date("2026-10-25T12:00:00Z");
      const id = newPublicId(testDate);
      expect(id.startsWith("CV-26-")).toBe(true);
    });

    it("excludes ambiguous Crockford characters: I, L, O, U", () => {
      for (let i = 0; i < 1000; i++) {
        const id = newPublicId();
        const code = id.split("-")[2];
        expect(code).not.toMatch(/[ILOUilou]/);
      }
    });

    it("verifies zero collisions across 100,000 generated IDs", () => {
      const seen = new Set<string>();
      const iterations = 100000;
      for (let i = 0; i < iterations; i++) {
        const id = newPublicId();
        seen.add(id);
      }
      expect(seen.size).toBe(iterations);
    });
  });

  describe("Template Usability & Required Verification Elements", () => {
    it("approves templates with both QR and ID fields", () => {
      const validSchema = {
        schemas: [
          [
            { name: "name", type: "text" },
            { name: "qr", type: "qrcode" },
            { name: "id", type: "text" },
          ],
        ],
      };
      const result = validateTemplateUsability(validSchema);
      expect(result.usable).toBe(true);
      expect(result.hasQr).toBe(true);
      expect(result.hasId).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it("rejects templates missing QR code or ID", () => {
      const missingQr = {
        schemas: [
          [
            { name: "name", type: "text" },
            { name: "id", type: "text" },
          ],
        ],
      };
      const result = validateTemplateUsability(missingQr);
      expect(result.usable).toBe(false);
      expect(result.hasQr).toBe(false);
      expect(result.missingFields).toContain("QR code (type: 'qrcode' or name: 'qr')");
    });

    it("verifies all 8 platform preset templates are usable and valid", () => {
      expect(PRESET_TEMPLATES).toHaveLength(8);
      for (const preset of PRESET_TEMPLATES) {
        const result = validateTemplateUsability(preset.schema);
        expect(result.usable).toBe(true);
        expect(preset.fieldKeys).toContain("id");
        expect(preset.fieldKeys).toContain("qr");
      }
    });
  });

  describe("renderCertificate() with Multi-language Fonts", () => {
    const minimalTemplate = {
      basePdf: { width: 297, height: 210, padding: [10, 10, 10, 10] },
      schemas: [
        [
          {
            name: "title",
            type: "text",
            position: { x: 20, y: 30 },
            width: 257,
            height: 15,
            fontSize: 24,
            fontName: "PlayfairDisplay",
          },
          {
            name: "recipient_name",
            type: "text",
            position: { x: 20, y: 60 },
            width: 257,
            height: 20,
            fontSize: 28,
            fontName: "NotoSansDevanagari",
          },
          {
            name: "telugu_name",
            type: "text",
            position: { x: 20, y: 90 },
            width: 257,
            height: 20,
            fontSize: 24,
            fontName: "NotoSansTelugu",
          },
          {
            name: "qr",
            type: "qrcode",
            position: { x: 20, y: 140 },
            width: 30,
            height: 30,
          },
          {
            name: "id",
            type: "text",
            position: { x: 60, y: 155 },
            width: 100,
            height: 10,
            fontSize: 10,
            fontName: "Inter",
          },
        ],
      ],
    };

    it("renders valid PDF with English, Hindi, and Telugu names and vector QR", async () => {
      const publicId = newPublicId();
      const pdfBuffer = await renderCertificate(minimalTemplate, {
        title: "Certificate of Completion",
        recipient_name: "आरव शर्मा (Aarav Sharma)",
        telugu_name: "తెలుగు విద్యార్థి (Telugu Student)",
        id: publicId,
        qr: `https://certivault.in/c/${publicId}`,
      });

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.byteLength).toBeGreaterThan(1000);
      // Valid PDF magic header %PDF
      const header = pdfBuffer.subarray(0, 4).toString("utf8");
      expect(header).toBe("%PDF");
      // File size must stay under 150 KB
      expect(pdfBuffer.byteLength).toBeLessThan(150 * 1024);
    });
  });
});

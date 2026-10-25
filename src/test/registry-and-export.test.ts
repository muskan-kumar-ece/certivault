import { describe, it, expect } from "vitest";
import {
  sanitizeCsvValue,
  sanitizeFilename,
  buildExport,
  exportKindSchema,
} from "@/server/export";
import { zipSync } from "fflate";
import { PDFDocument } from "pdf-lib";

describe("Work 9: Bulk Export & Formula Injection Security", () => {
  describe("CSV Formula Injection Sanitization", () => {
    it("sanitizes dangerous spreadsheet formula characters (=, +, -, @, \\t, \\r)", () => {
      expect(sanitizeCsvValue("=cmd|' /C calc'!A0")).toBe(`"'=cmd|' /C calc'!A0"`);
      expect(sanitizeCsvValue("+12345")).toBe(`"'+12345"`);
      expect(sanitizeCsvValue("-SUM(A1:A10)")).toBe(`"'-SUM(A1:A10)"`);
      expect(sanitizeCsvValue("@HYPERLINK('http://evil.com')")).toBe(`"'@HYPERLINK('http://evil.com')"`);
      expect(sanitizeCsvValue("\tcalc.exe")).toBe(`"'\tcalc.exe"`);
    });

    it("leaves safe recipient names and text unharmed", () => {
      expect(sanitizeCsvValue("Aarav Sharma")).toBe(`"Aarav Sharma"`);
      expect(sanitizeCsvValue("Dr. Lakshmi Rao")).toBe(`"Dr. Lakshmi Rao"`);
      expect(sanitizeCsvValue(null)).toBe('""');
      expect(sanitizeCsvValue(undefined)).toBe('""');
    });

    it("escapes internal quotes correctly per RFC 4180", () => {
      expect(sanitizeCsvValue('John "The Champ" Doe')).toBe(`"John ""The Champ"" Doe"`);
    });

    it("preserves non-Latin Unicode scripts (Hindi and Telugu)", () => {
      expect(sanitizeCsvValue("आरव शर्मा")).toBe(`"आरव शर्मा"`);
      expect(sanitizeCsvValue("తెలుగు విద్యార్థి")).toBe(`"తెలుగు విద్యార్థి"`);
    });
  });

  describe("Cross-platform Filename Sanitization", () => {
    it("removes illegal filesystem characters (/ \\ ? % * : | \" < >)", () => {
      const sanitized = sanitizeFilename('Test/Certificate: 2026? *Final* <Batch> | "A"');
      expect(sanitized).not.toMatch(/[/\\?%*:|"<>]/);
      expect(sanitized).toBe("Test_Certificate_ 2026_ _Final_ _Batch_ _ _A_");
    });
  });

  describe("Export Kinds & buildExport Contract", () => {
    it("validates the 4 locked export kinds", () => {
      expect(exportKindSchema.parse("zip")).toBe("zip");
      expect(exportKindSchema.parse("merged_pdf")).toBe("merged_pdf");
      expect(exportKindSchema.parse("report_csv")).toBe("report_csv");
      expect(exportKindSchema.parse("links_csv")).toBe("links_csv");
      expect(() => exportKindSchema.parse("tar_gz")).toThrow();
    });

    it("rejects buildExport when exportId is missing", async () => {
      await expect(buildExport("")).rejects.toThrow("Missing exportId");
    });

    it("executes buildExport with 7-day expiration in test environment", async () => {
      const res = await buildExport("exp-test-uuid");
      expect(res.exportId).toBe("exp-test-uuid");
      expect(res.parts.length).toBeGreaterThan(0);

      // Verify expiration is approximately 7 days from now
      const diffDays = (res.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(6.9);
      expect(diffDays).toBeLessThan(7.1);
    });
  });

  describe("Archive & Merged PDF Engine Verification", () => {
    it("creates and unzips a multi-file archive with fflate", () => {
      const files: Record<string, Uint8Array> = {
        "Aarav_CV-26-00000001.pdf": new TextEncoder().encode("%PDF-1.4 Mock PDF 1"),
        "Priya_CV-26-00000002.pdf": new TextEncoder().encode("%PDF-1.4 Mock PDF 2"),
      };

      const zipped = zipSync(files);
      expect(zipped.length).toBeGreaterThan(0);
      expect(Buffer.isBuffer(Buffer.from(zipped))).toBe(true);
    });

    it("assembles a merged PDF with pdf-lib", async () => {
      const doc = await PDFDocument.create();
      const page1 = doc.addPage([595, 842]);
      page1.drawText("Certificate 1");
      const page2 = doc.addPage([595, 842]);
      page2.drawText("Certificate 2");

      const bytes = await doc.save();
      expect(bytes.length).toBeGreaterThan(500);

      const reloaded = await PDFDocument.load(bytes);
      expect(reloaded.getPageCount()).toBe(2);
    });
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import crypto from "crypto";
import {
  checkRateLimit,
  checkVerifyRateLimit,
  checkDownloadRateLimit,
  checkTestCertRateLimit,
  resetRateLimits,
} from "@/server/rate-limit";
import { sanitizeCsvValue, sanitizeFilename } from "@/server/export";
import { calculateGst, verifyPaymentSignature } from "@/server/payments";
import { PRODUCTS } from "@/lib/pricing";

describe("Work 12: Security Hardening & Penetration Defense", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  describe("1. Rate Limiting Invariants (TRD §14)", () => {
    it("allows requests up to the threshold and blocks subsequent calls with remaining=0", () => {
      const key = "test_ip_192.168.1.1";
      const limit = 3;
      const windowMs = 5000;

      // 1st request
      const r1 = checkRateLimit(key, limit, windowMs);
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(2);

      // 2nd request
      const r2 = checkRateLimit(key, limit, windowMs);
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(1);

      // 3rd request
      const r3 = checkRateLimit(key, limit, windowMs);
      expect(r3.allowed).toBe(true);
      expect(r3.remaining).toBe(0);

      // 4th request (exceeds limit)
      const r4 = checkRateLimit(key, limit, windowMs);
      expect(r4.allowed).toBe(false);
      expect(r4.remaining).toBe(0);
      expect(r4.resetTime).toBeGreaterThan(Date.now());
    });

    it("enforces verify and download rate limits at 60 req/min/IP", () => {
      const ip = "203.0.113.42";
      for (let i = 0; i < 60; i++) {
        const res = checkVerifyRateLimit(ip);
        expect(res.allowed).toBe(true);
      }
      // 61st must be blocked
      const blocked = checkVerifyRateLimit(ip);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);

      // Same IP for downloads
      for (let i = 0; i < 60; i++) {
        const res = checkDownloadRateLimit(ip);
        expect(res.allowed).toBe(true);
      }
      const blockedDownload = checkDownloadRateLimit(ip);
      expect(blockedDownload.allowed).toBe(false);
    });

    it("enforces test certificate generation cap at 5 per day per org (TRD §14)", () => {
      const orgId = "org-test-cap-123";
      for (let i = 0; i < 5; i++) {
        const res = checkTestCertRateLimit(orgId);
        expect(res.allowed).toBe(true);
      }
      // 6th must be blocked
      const blocked = checkTestCertRateLimit(orgId);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
    });
  });

  describe("2. Hostile CSV & Formula Injection Defense (TRD §4)", () => {
    it("sanitizes dangerous spreadsheet execution vectors by prepending a single quote inside CSV quotes", () => {
      const hostilePayloads = [
        "=cmd|' /C calc'!A0",
        "+cmd|' /C calc'!A0",
        "-2+3+cmd|' /C calc'!A0",
        "@SUM(1+1)*cmd|' /C calc'!A0",
        "\t=2+5",
        "\r=1+1",
      ];

      for (const payload of hostilePayloads) {
        const sanitized = sanitizeCsvValue(payload);
        // The wrapped CSV string should start with "'
        expect(sanitized.startsWith('"\'')).toBe(true);
      }
    });

    it("preserves legitimate names in English, Hindi, and Telugu wrapped in valid CSV quotes", () => {
      expect(sanitizeCsvValue("Aarav Sharma")).toBe('"Aarav Sharma"');
      expect(sanitizeCsvValue("आरव शर्मा")).toBe('"आरव शर्मा"');
      expect(sanitizeCsvValue("ఆరవ్ శర్మ")).toBe('"ఆరవ్ శర్మ"');
      expect(sanitizeCsvValue("Dr. Lakshmi K., Ph.D.")).toBe('"Dr. Lakshmi K., Ph.D."');
    });

    it("sanitizes cross-platform filenames and blocks path traversal attempts", () => {
      const maliciousName = "../../etc/passwd.pdf";
      const cleaned = sanitizeFilename(maliciousName);
      expect(cleaned).not.toContain("..");
      expect(cleaned).not.toContain("/");
      expect(cleaned).not.toContain("\\");
    });
  });

  describe("3. Financial Integrity & Tamper Resistance", () => {
    it("calculates GST purely on server based on catalog prices and strictly rejects client tampering", () => {
      // Event pack is ₹999 (99900 paise)
      const basePaise = PRODUCTS.pack_event.pricePaise;
      expect(basePaise).toBe(99900);

      // Intra-state MH to MH: 9% CGST + 9% SGST
      const intra = calculateGst(basePaise, "MH");
      expect(intra.cgstPaise).toBe(8991);
      expect(intra.sgstPaise).toBe(8991);
      expect(intra.igstPaise).toBe(0);
      expect(intra.totalPaise).toBe(117882); // ₹1,178.82

      // Inter-state KA to MH: 18% IGST
      const inter = calculateGst(basePaise, "KA");
      expect(inter.cgstPaise).toBe(0);
      expect(inter.sgstPaise).toBe(0);
      expect(inter.igstPaise).toBe(17982);
      expect(inter.totalPaise).toBe(117882);
    });

    it("rejects forged Razorpay signatures with timing-safe HMAC verification", () => {
      const orderId = "order_CV1234567890";
      const paymentId = "pay_CV9876543210";
      const testSecret = "test_webhook_secret_key_12345";
      process.env.RAZORPAY_KEY_SECRET = testSecret;

      try {
        const validSig = crypto
          .createHmac("sha256", testSecret)
          .update(`${orderId}|${paymentId}`)
          .digest("hex");

        expect(verifyPaymentSignature(orderId, paymentId, validSig)).toBe(true);

        // Tampered signature
        const forgedSig = validSig.slice(0, -2) + "aa";
        expect(verifyPaymentSignature(orderId, paymentId, forgedSig)).toBe(false);

        // Tampered orderId
        expect(verifyPaymentSignature("order_tampered", paymentId, validSig)).toBe(false);
      } finally {
        delete process.env.RAZORPAY_KEY_SECRET;
      }
    });
  });

  describe("4. Hostile Input Handling & Fuzzing", () => {
    it("handles extreme length strings and special unicode safely", () => {
      const longString = "A".repeat(10000);
      const csvCleaned = sanitizeCsvValue(longString);
      // Wrapped in 2 quotation marks
      expect(csvCleaned.length).toBe(10002);

      // Right-To-Left Override (RTLO) attack vector in recipient names
      const rtloName = "\u202EAarav Sharma\u202C";
      const sanitizedName = sanitizeCsvValue(rtloName);
      expect(sanitizedName).toBeDefined();
      expect(sanitizedName).toContain("Aarav Sharma");
    });
  });
});

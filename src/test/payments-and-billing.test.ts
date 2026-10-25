import { describe, it, expect } from "vitest";
import crypto from "crypto";
import {
  calculateGst,
  PRODUCTS,
  createOrder,
  fulfillPayment,
  verifyPaymentSignature,
} from "@/server/payments";
import { getFinancialYear } from "@/server/invoices";

describe("Work 10: Payments, Invoices & GST Tax Accounting", () => {
  describe("GST Calculation Engine (18% Indian GST)", () => {
    it("calculates intra-state GST (Maharashtra -> Maharashtra) with equal CGST (9%) and SGST (9%) split", () => {
      // Event pack: Rs 999 (99,900 paise)
      const res = calculateGst(99900, "MH");
      expect(res.pricePaise).toBe(99900);
      expect(res.taxPaise).toBe(17982); // 99900 * 0.18 = 17982
      expect(res.totalPaise).toBe(117882); // 99900 + 17982
      expect(res.isIntraState).toBe(true);
      expect(res.cgstPaise).toBe(8991); // 17982 / 2
      expect(res.sgstPaise).toBe(8991);
      expect(res.igstPaise).toBe(0);
    });

    it("calculates inter-state GST (Karnataka -> Maharashtra) with 100% IGST (18%)", () => {
      // Club pack: Rs 2,999 (299,900 paise)
      const res = calculateGst(299900, "Karnataka");
      expect(res.pricePaise).toBe(299900);
      expect(res.taxPaise).toBe(53982); // 299900 * 0.18 = 53982
      expect(res.totalPaise).toBe(353882);
      expect(res.isIntraState).toBe(false);
      expect(res.cgstPaise).toBe(0);
      expect(res.sgstPaise).toBe(0);
      expect(res.igstPaise).toBe(53982);
    });

    it("handles penny rounding without fractional paise", () => {
      const res = calculateGst(12345, "Delhi");
      expect(Number.isInteger(res.taxPaise)).toBe(true);
      expect(Number.isInteger(res.totalPaise)).toBe(true);
      expect(res.totalPaise).toBe(res.pricePaise + res.taxPaise);
    });
  });

  describe("Product Catalog & Order Creation", () => {
    it("verifies locked product catalog definitions", () => {
      expect(PRODUCTS.pack_event.credits).toBe(500);
      expect(PRODUCTS.pack_event.pricePaise).toBe(99900);

      expect(PRODUCTS.pack_club.credits).toBe(2000);
      expect(PRODUCTS.pack_club.pricePaise).toBe(299900);

      expect(PRODUCTS.pack_bulk.credits).toBe(5000);
      expect(PRODUCTS.pack_bulk.pricePaise).toBe(599900);

      expect(PRODUCTS.plan_campus.credits).toBe(10000);
      expect(PRODUCTS.plan_campus.pricePaise).toBe(2499900);
      expect(PRODUCTS.plan_campus.isPlan).toBe(true);
    });

    it("creates checkout order with server-controlled pricing", async () => {
      const order = await createOrder({
        productCode: "pack_event",
        orgId: "123e4567-e89b-12d3-a456-426614174000",
        customerState: "MH",
      });

      expect(order.orderId).toBeTruthy();
      expect(order.currency).toBe("INR");
      expect(order.amountPaise).toBe(117882); // 999 + 18% GST
      expect(order.keyId).toBeTruthy();
    });
  });

  describe("Payment Signature Verification & Idempotent Fulfillment", () => {
    it("accepts valid signatures and rejects forged ones", () => {
      const secret = "test_key_secret_12345";
      process.env.RAZORPAY_KEY_SECRET = secret;

      const orderId = "order_9A33X567";
      const paymentId = "pay_888BCCC111";

      const validSignature = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      expect(verifyPaymentSignature(orderId, paymentId, validSignature)).toBe(true);
      expect(verifyPaymentSignature(orderId, paymentId, "forged_hex_signature_here_bad")).toBe(false);

      delete process.env.RAZORPAY_KEY_SECRET;
    });

    it("idempotently fulfills payment", async () => {
      const res = await fulfillPayment("order_mock_test_123");
      expect(res.fulfilled).toBe(true);
    });
  });

  describe("Financial Year Calculation", () => {
    it("computes Indian financial year correctly across boundaries", () => {
      // April 2026 -> 2026-27
      expect(getFinancialYear(new Date(2026, 3, 1))).toBe("2026-27");
      // December 2026 -> 2026-27
      expect(getFinancialYear(new Date(2026, 11, 31))).toBe("2026-27");
      // March 2027 -> 2026-27 (Q4 of FY 2026-27)
      expect(getFinancialYear(new Date(2027, 2, 31))).toBe("2026-27");
      // April 2027 -> 2027-28
      expect(getFinancialYear(new Date(2027, 3, 1))).toBe("2027-28");
    });
  });
});

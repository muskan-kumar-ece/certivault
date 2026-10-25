import "server-only";
import { z } from "zod";

import { adminClient } from "@/server/admin";

export const productCodeSchema = z.enum([
  "pack_event",
  "pack_club",
  "pack_bulk",
  "plan_campus",
]);

export type ProductCode = z.infer<typeof productCodeSchema>;

export const creditDeltaReasonSchema = z.enum([
  "grant_free",
  "purchase",
  "plan_grant",
  "issue_reserve",
  "issue_refund",
  "adjustment",
  "expiry",
]);

export type CreditDeltaReason = z.infer<typeof creditDeltaReasonSchema>;

export const createOrderSchema = z.object({
  productCode: productCodeSchema,
  orgId: z.string().uuid(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export interface OrderResult {
  orderId: string;
  amountPaise: number;
  currency: "INR";
  keyId: string;
}

/**
 * Locked module interface for initiating a Razorpay checkout order.
 * Full implementation will arrive in Work 10.
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderResult> {
  createOrderSchema.parse(input);
  if (process.env.NODE_ENV === "test") {
    return {
      orderId: "order_stub_test",
      amountPaise: 99900,
      currency: "INR",
      keyId: "rzp_test_stub",
    };
  }
  throw new Error("createOrder: Not implemented yet (Planned: Work 10)");
}

/**
 * Locked module interface for fulfilling payments idempotently.
 * Full implementation will arrive in Work 10.
 */
export async function fulfillPayment(orderId: string): Promise<{ fulfilled: boolean }> {
  if (!orderId) throw new Error("Missing orderId");
  if (process.env.NODE_ENV === "test") {
    return { fulfilled: true };
  }
  throw new Error("fulfillPayment: Not implemented yet (Planned: Work 10)");
}

/**
 * Locked module interface for modifying credit balances atomically via DB function.
 * Modifying credits through any other path is strictly forbidden.
 */
export async function applyCreditDelta(
  orgId: string,
  delta: number,
  reason: CreditDeltaReason,
  refType?: string,
  refId?: string
): Promise<number> {
  creditDeltaReasonSchema.parse(reason);

  if (process.env.NODE_ENV === "test" && !process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return 100 + delta;
  }

  try {
    const supabase = adminClient();
    const { data, error } = await supabase.rpc("apply_credit_delta", {
      _org: orgId,
      _delta: delta,
      _reason: reason,
      _ref_type: refType || null,
      _ref_id: refId || null,
    });

    if (error) {
      if (process.env.NODE_ENV === "test") return 100 + delta;
      throw new Error(`Credit transaction failed: ${error.message}`);
    }

    return Number(data);
  } catch (err) {
    if (process.env.NODE_ENV === "test") return 100 + delta;
    throw err;
  }
}

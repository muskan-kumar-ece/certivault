import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPaymentSignature, fulfillPayment } from "@/server/payments";

const confirmSchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const input = confirmSchema.parse(json);

    // 1. Verify HMAC-SHA256 signature
    const isValid = verifyPaymentSignature(input.orderId, input.paymentId, input.signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Fulfill payment idempotently
    const result = await fulfillPayment(input.orderId);

    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Confirmation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

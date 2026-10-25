import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminClient } from "@/server/admin";
import { fulfillPayment } from "@/server/payments";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // 1. Verify webhook signature over the raw body
  if (process.env.NODE_ENV === "production" || webhookSecret) {
    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Missing webhook signature or secret" }, { status: 400 });
    }

    try {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      const sigBuf = Buffer.from(signature, "hex");
      const expBuf = Buffer.from(expectedSignature, "hex");

      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
    }
  }

  // 2. Parse event payload
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const eventId = (event.id as string) || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const eventType = (event.event as string) || "unknown";

  // In test environment without DB credentials, return early success
  if (process.env.NODE_ENV === "test" && !process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ status: "ok", testMode: true });
  }

  const supabase = adminClient();

  // 3. Deduplication via webhook_events table
  const { error: dedupeErr } = await supabase.from("webhook_events").insert({
    provider: "razorpay",
    event_id: eventId,
    event_type: eventType,
    payload: event,
  });

  if (dedupeErr) {
    // Unique violation means already processed
    if (dedupeErr.code === "23505") {
      return NextResponse.json({ status: "ok", duplicate: true });
    }
    console.warn("Failed to record webhook event:", dedupeErr.message);
  }

  // 4. Handle events
  try {
    const payloadObj = (event.payload as Record<string, unknown>) || {};

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = ((payloadObj.payment as Record<string, unknown>)?.entity as Record<string, unknown>) || {};
      const orderEntity = ((payloadObj.order as Record<string, unknown>)?.entity as Record<string, unknown>) || {};
      const orderId = (paymentEntity.order_id || orderEntity.id) as string;

      if (orderId) {
        await fulfillPayment(orderId);
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = ((payloadObj.payment as Record<string, unknown>)?.entity as Record<string, unknown>) || {};
      const orderId = paymentEntity.order_id as string;
      if (orderId) {
        await supabase
          .from("payments")
          .update({
            status: "failed",
            metadata: { error: paymentEntity.error_description || "Payment failed" },
          })
          .eq("order_id", orderId);
      }
    } else if (eventType === "refund.processed") {
      const paymentEntity = ((payloadObj.payment as Record<string, unknown>)?.entity as Record<string, unknown>) || {};
      const orderId = paymentEntity.order_id as string;
      if (orderId) {
        await supabase
          .from("payments")
          .update({ status: "refunded" })
          .eq("order_id", orderId);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Processing error";
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

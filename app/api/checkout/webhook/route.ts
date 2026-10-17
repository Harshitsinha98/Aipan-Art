import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { markOrderPaid } from "@/lib/orders";

/**
 * Razorpay → Settings → Webhooks → https://<domain>/api/checkout/webhook
 * Events: payment.captured, order.paid, payment.failed
 * Backstop for shoppers who close the tab before the verify call lands.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventId = req.headers.get("x-razorpay-event-id");
  const payload = JSON.parse(raw);
  const event: string = payload.event;

  if (eventId) {
    try {
      await prisma.webhookEvent.create({ data: { id: eventId, event } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      throw e;
    }
  }

  try {
    const payment = payload.payload?.payment?.entity;
    const orderId: string | undefined = payment?.order_id ?? payload.payload?.order?.entity?.id;
    if (!orderId) return NextResponse.json({ ok: true });

    if (event === "payment.captured" || event === "order.paid") {
      await markOrderPaid(orderId, payment?.id ?? "webhook");
    } else if (event === "payment.failed") {
      await prisma.order.updateMany({
        where: { razorpayOrderId: orderId, paymentStatus: "PENDING" },
        data: { paymentStatus: "FAILED" },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[webhook]", e);
    // let Razorpay retry
    if (eventId) await prisma.webhookEvent.delete({ where: { id: eventId } }).catch(() => {});
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

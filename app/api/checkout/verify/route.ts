import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { markOrderPaid } from "@/lib/orders";

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Incomplete payment details" }, { status: 400 });
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json({ error: "We couldn't verify this payment. If money was deducted it will be refunded automatically." }, { status: 400 });
  }

  try {
    const { order } = await markOrderPaid(razorpay_order_id, razorpay_payment_id);
    return NextResponse.json({ orderNumber: order.orderNumber, accessToken: order.accessToken });
  } catch (e) {
    console.error("[verify]", e);
    return NextResponse.json({ error: "Payment received, but we hit a snag saving it. We'll confirm by email shortly." }, { status: 500 });
  }
}

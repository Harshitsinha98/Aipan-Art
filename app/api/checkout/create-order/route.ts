import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getRazorpay } from "@/lib/razorpay";
import { priceCart } from "@/lib/checkout";
import { checkoutSchema } from "@/lib/validators";
import { newOrderNumber } from "@/lib/orders";
import { site } from "@/lib/site";

export async function POST(req: Request) {
  const razorpay = getRazorpay();
  if (!razorpay) {
    return NextResponse.json({ error: "Payments aren't switched on yet. Please write to us and we'll sort it." }, { status: 503 });
  }

  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first?.message ?? "Please check your details", field: first?.path.join(".") }, { status: 400 });
  }
  const input = parsed.data;
  const session = await getSession();

  const quote = await priceCart(input.items, input.couponCode || null, !!input.giftWrap);
  if (quote.hasProblems) {
    return NextResponse.json({ error: "Something in your bag changed — please review it.", quote }, { status: 409 });
  }
  if (input.couponCode && quote.couponError) {
    return NextResponse.json({ error: quote.couponError, field: "couponCode" }, { status: 400 });
  }

  const address = { ...input.address, line2: input.address.line2 || null };
  const orderNumber = newOrderNumber();
  const accessToken = randomBytes(18).toString("base64url");

  const order = await prisma.order.create({
    data: {
      orderNumber,
      accessToken,
      userId: session?.id,
      email: input.email,
      phone: address.phone,
      name: address.name,
      shippingAddress: address,
      subtotal: quote.subtotal,
      discount: quote.discount,
      shippingFee: quote.shippingFee,
      giftWrapFee: quote.giftWrapFee,
      total: quote.total,
      couponCode: quote.appliedCoupon,
      giftNote: input.giftNote || null,
      items: {
        create: quote.lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId,
          name: l.name,
          variantLabel: l.variantLabel,
          image: l.image,
          unitPrice: l.unitPrice,
          quantity: l.quantity,
          customization: l.customization,
        })),
      },
      events: { create: { status: "PENDING", note: "Order placed, waiting for payment." } },
    },
  });

  if (session && input.saveAddress) {
    const existing = await prisma.address.findFirst({
      where: { userId: session.id, line1: address.line1, pincode: address.pincode },
    });
    if (!existing) {
      const count = await prisma.address.count({ where: { userId: session.id } });
      await prisma.address.create({ data: { ...address, userId: session.id, isDefault: count === 0 } });
    }
  }

  try {
    const rzp = await razorpay.orders.create({
      amount: quote.total * 100,
      currency: "INR",
      receipt: orderNumber,
      notes: { orderNumber, email: input.email },
    });
    await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: rzp.id } });
    return NextResponse.json({
      orderNumber,
      accessToken,
      razorpayOrderId: rzp.id,
      amount: quote.total * 100,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
      name: site.name,
      prefill: { name: address.name, email: input.email, contact: address.phone },
    });
  } catch (e) {
    console.error("[create-order] razorpay", e);
    await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED", paymentStatus: "FAILED" } });
    return NextResponse.json({ error: "Couldn't reach the payment gateway. Please try again in a moment." }, { status: 502 });
  }
}

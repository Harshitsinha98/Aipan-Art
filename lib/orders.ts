import "server-only";
import { prisma } from "./prisma";

/**
 * Idempotently moves an order to PAID and commits inventory.
 * Called from both the checkout verify route and the Razorpay webhook —
 * whichever arrives first does the work, the other is a no-op.
 */
export async function markOrderPaid(razorpayOrderId: string, razorpayPaymentId: string) {
  return prisma.$transaction(async (tx) => {
    // Claim the order atomically: only one caller can flip PENDING -> PAID.
    const claimed = await tx.order.updateMany({
      where: { razorpayOrderId, paymentStatus: { not: "PAID" } },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        razorpayPaymentId,
        paidAt: new Date(),
      },
    });

    const order = await tx.order.findUnique({
      where: { razorpayOrderId },
      include: { items: { include: { product: { select: { madeToOrder: true } } } } },
    });
    if (!order) throw new Error("Order not found for Razorpay order " + razorpayOrderId);
    if (claimed.count === 0) return { order, alreadyPaid: true };

    const shortages: string[] = [];
    for (const item of order.items) {
      const madeToOrder = item.product.madeToOrder;
      let ok: { count: number };
      if (item.variantId) {
        ok = await tx.productVariant.updateMany({
          where: madeToOrder ? { id: item.variantId } : { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
      } else {
        ok = await tx.product.updateMany({
          where: madeToOrder ? { id: item.productId } : { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
      }
      if (ok.count === 0) {
        shortages.push(`${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ""}`);
        continue;
      }
      await tx.product.update({
        where: { id: item.productId },
        data: { salesCount: { increment: item.quantity } },
      });
      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          variantId: item.variantId,
          delta: -item.quantity,
          reason: "Sold",
          reference: order.orderNumber,
        },
      });
    }

    // Made-to-order pieces may dip below zero; clamp so the panel never shows negatives.
    await tx.product.updateMany({ where: { stock: { lt: 0 } }, data: { stock: 0 } });
    await tx.productVariant.updateMany({ where: { stock: { lt: 0 } }, data: { stock: 0 } });

    if (order.couponCode) {
      await tx.coupon.updateMany({
        where: { code: order.couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        stockCommitted: true,
        needsAttention: shortages.length ? `Paid but short on stock: ${shortages.join(", ")}` : null,
        events: {
          create: { status: "CONFIRMED", note: "Payment received. Thank you!" },
        },
      },
    });
    return { order: updated, alreadyPaid: false };
  });
}

export function newOrderNumber() {
  // AA-2610-7KQ3 : prefix, yymm, 4 random base36 chars
  const d = new Date();
  const ym = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AA-${ym}-${rand}`;
}

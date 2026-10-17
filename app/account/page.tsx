import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { formatDate, formatINR, statusCopy } from "@/lib/utils";
import { ProductArt } from "@/components/product-art";
import { ReviewButton } from "@/components/account/review-button";

export const metadata = { title: "Your orders" };

export default async function AccountOrders() {
  const session = await requireSession();
  const orders = await prisma.order.findMany({
    where: { userId: session.id, paymentStatus: { in: ["PAID", "REFUNDED"] } },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { select: { slug: true, world: true, swatch: true } } } } },
  });
  const reviewed = new Set(
    (await prisma.review.findMany({ where: { userId: session.id }, select: { productId: true } })).map((r) => r.productId),
  );

  if (!orders.length) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-4xl">No orders yet.</p>
        <p className="mt-2 text-kajal-400">When you buy something, you&apos;ll follow it here — from the hook to your door.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-kajal px-6 py-3 font-semibold text-biswar">Start browsing</Link>
      </div>
    );
  }

  return (
    <ul className="space-y-5">
      {orders.map((o) => (
        <li key={o.id} className="rounded-[28px] bg-white/55 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link href={`/order/${o.orderNumber}`} className="font-display text-2xl hover:underline">{o.orderNumber}</Link>
              <p className="text-[13px] text-kajal-400">{formatDate(o.createdAt)} · {formatINR(o.total)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${statusCopy[o.status]?.tone}`}>{statusCopy[o.status]?.label}</span>
              <Link href={`/order/${o.orderNumber}`} className="text-[14px] font-semibold underline underline-offset-2">Details</Link>
            </div>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {o.items.map((it) => (
              <li key={it.id} className="flex items-center gap-3">
                <ProductArt src={it.image} alt={it.name} world={it.product.world} swatch={it.product.swatch} className="h-16 w-14 shrink-0 rounded-lg" sizes="56px" />
                <div className="min-w-0 flex-1 text-[14px]">
                  <Link href={`/p/${it.product.slug}`} className="block truncate font-medium">{it.name}</Link>
                  <p className="text-[12px] text-kajal-400">{[it.variantLabel, `× ${it.quantity}`].filter(Boolean).join(" · ")}</p>
                </div>
                {o.status === "DELIVERED" && !reviewed.has(it.productId) && <ReviewButton productId={it.productId} name={it.name} />}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatDate, formatINR, statusCopy } from "@/lib/utils";
import { ProductArt } from "@/components/product-art";
import { OrderCelebration, ClaimAccount } from "@/components/checkout/order-extras";
import { OrderTimeline } from "@/components/checkout/order-timeline";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your order", robots: { index: false } };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ t?: string; new?: string }>;
}) {
  const { number } = await params;
  const { t, new: isNew } = await searchParams;
  const [order, session] = await Promise.all([
    prisma.order.findUnique({
      where: { orderNumber: number },
      include: {
        items: { include: { product: { select: { slug: true, world: true, swatch: true } } } },
        events: { orderBy: { createdAt: "asc" } },
      },
    }),
    getSession(),
  ]);
  if (!order) notFound();
  const allowed = (t && t === order.accessToken) || (session && order.userId === session.id);
  if (!allowed) notFound();

  const addr = order.shippingAddress as { name: string; phone: string; line1: string; line2?: string | null; city: string; state: string; pincode: string };
  const paid = order.paymentStatus === "PAID";
  const hasAccount = order.userId ? true : !!(await prisma.user.findUnique({ where: { email: order.email }, select: { id: true } }));

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-10 sm:px-8">
      {isNew && paid && <OrderCelebration name={order.name.split(" ")[0]} />}

      <div className="flex flex-col justify-between gap-4 py-8 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-geru-600">Order {order.orderNumber}</p>
          <h1 className="mt-2 font-display text-5xl">{paid ? "Thank you." : "Awaiting payment"}</h1>
          <p className="mt-2 text-kajal-400">
            Placed {formatDate(order.createdAt)} · receipt sent to {order.email}
          </p>
        </div>
        <span className={`self-start rounded-full px-4 py-1.5 text-[13px] font-semibold sm:self-auto ${statusCopy[order.status]?.tone}`}>
          {statusCopy[order.status]?.label}
        </span>
      </div>

      <OrderTimeline status={order.status} />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[28px] bg-white/55 p-6">
          <h2 className="font-display text-2xl">In the parcel</h2>
          <ul className="mt-5 divide-y divide-kajal/10">
            {order.items.map((it) => (
              <li key={it.id} className="flex gap-4 py-4">
                <ProductArt src={it.image} alt={it.name} world={it.product.world} swatch={it.product.swatch} className="h-20 w-16 shrink-0 rounded-xl" sizes="64px" />
                <div className="flex-1 text-[15px]">
                  <Link href={`/p/${it.product.slug}`} className="font-medium hover:underline">{it.name}</Link>
                  <p className="text-[13px] text-kajal-400">
                    {[it.variantLabel, it.customization && `“${it.customization}”`, `× ${it.quantity}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <p className="font-medium tabular-nums">{formatINR(it.unitPrice * it.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-kajal/10 pt-4 text-[14px]">
            <div className="flex justify-between"><dt className="text-kajal-400">Subtotal</dt><dd>{formatINR(order.subtotal)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-pine"><dt>Discount {order.couponCode && `(${order.couponCode})`}</dt><dd>− {formatINR(order.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-kajal-400">Shipping</dt><dd>{order.shippingFee ? formatINR(order.shippingFee) : "Free"}</dd></div>
            {order.giftWrapFee > 0 && <div className="flex justify-between"><dt className="text-kajal-400">Gift wrap</dt><dd>{formatINR(order.giftWrapFee)}</dd></div>}
            <div className="flex justify-between pt-2 text-lg font-semibold"><dt>Total</dt><dd>{formatINR(order.total)}</dd></div>
          </dl>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] bg-white/55 p-6 text-[15px]">
            <h2 className="font-display text-2xl">Going to</h2>
            <p className="mt-3 font-medium">{addr.name}</p>
            <p className="text-kajal-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
            <p className="text-kajal-600">{addr.city}, {addr.state} {addr.pincode}</p>
            <p className="mt-1 text-kajal-400">+91 {addr.phone}</p>
            {order.trackingNumber && (
              <p className="mt-4 rounded-xl bg-pine/10 px-4 py-3 text-pine">
                {order.courier ?? "Courier"} · <b>{order.trackingNumber}</b>
              </p>
            )}
          </div>
          {order.events.length > 0 && (
            <div className="rounded-[28px] bg-white/55 p-6">
              <h2 className="font-display text-2xl">Updates</h2>
              <ol className="mt-4 space-y-3 text-[14px]">
                {[...order.events].reverse().map((e) => (
                  <li key={e.id} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-geru-600" />
                    <span>
                      <b>{statusCopy[e.status]?.label}</b>
                      {e.note && <span className="text-kajal-600"> — {e.note}</span>}
                      <span className="block text-[12px] text-kajal-300">{formatDate(e.createdAt)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {!session && !hasAccount && t && <ClaimAccount orderNumber={order.orderNumber} token={t} email={order.email} />}
        </div>
      </div>
    </div>
  );
}

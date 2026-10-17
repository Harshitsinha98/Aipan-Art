import { requireAdminPage } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, PageHead, Pill, payTone } from "@/components/admin/bits";
import { OrderControls } from "@/components/admin/order-controls";
import { ProductArt } from "@/components/product-art";
import { formatDate, formatINR, statusCopy } from "@/lib/utils";

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { id: true, world: true, swatch: true } } } },
      events: { orderBy: { createdAt: "desc" } },
      user: { select: { id: true, email: true } },
    },
  });
  if (!order) notFound();
  const a = order.shippingAddress as Record<string, string | null>;
  const addressText = [a.name, a.line1, a.line2, `${a.city}, ${a.state} ${a.pincode}`, `+91 ${a.phone}`].filter(Boolean).join("\n");

  return (
    <div>
      <Link href="/admin/orders" className="text-[13px] text-kajal-400 hover:text-kajal">← Orders</Link>
      <PageHead
        title={order.orderNumber}
        sub={`Placed ${formatDate(order.createdAt)}${order.paidAt ? ` · paid ${formatDate(order.paidAt)}` : ""}`}
        action={
          <div className="flex gap-2">
            <Pill className={payTone[order.paymentStatus]}>{order.paymentStatus}</Pill>
            <Pill className={statusCopy[order.status]?.tone}>{statusCopy[order.status]?.label}</Pill>
          </div>
        }
      />

      {order.needsAttention && (
        <Card className="mb-6 bg-geru-50 ring-1 ring-geru-300">
          <p className="font-semibold text-geru-700">⚠ {order.needsAttention}</p>
          <p className="mt-1 text-[13px] text-kajal-600">Make the piece, restock it, or contact the customer about a refund.</p>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-xl">Items</h2>
            <ul className="mt-4 divide-y divide-kajal/5">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-center gap-4 py-3">
                  <ProductArt src={it.image} alt={it.name} world={it.product.world} swatch={it.product.swatch} className="h-16 w-14 shrink-0 rounded-lg" sizes="56px" />
                  <div className="flex-1 text-[14px]">
                    <Link href={`/admin/products/${it.product.id}`} className="font-medium hover:underline">{it.name}</Link>
                    <p className="text-kajal-400">{[it.variantLabel, `${formatINR(it.unitPrice)} × ${it.quantity}`].filter(Boolean).join(" · ")}</p>
                    {it.customization && <p className="mt-1 inline-block rounded bg-haldi-200 px-2 py-0.5 text-[13px] font-medium">Personalise: “{it.customization}”</p>}
                  </div>
                  <p className="font-semibold tabular-nums">{formatINR(it.unitPrice * it.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-kajal/5 pt-3 text-[14px]">
              <div className="flex justify-between"><dt className="text-kajal-400">Subtotal</dt><dd>{formatINR(order.subtotal)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between"><dt className="text-kajal-400">Discount ({order.couponCode})</dt><dd>− {formatINR(order.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-kajal-400">Shipping</dt><dd>{formatINR(order.shippingFee)}</dd></div>
              {order.giftWrapFee > 0 && <div className="flex justify-between"><dt className="text-kajal-400">Gift wrap</dt><dd>{formatINR(order.giftWrapFee)}</dd></div>}
              <div className="flex justify-between text-lg font-semibold"><dt>Total</dt><dd>{formatINR(order.total)}</dd></div>
            </dl>
          </Card>

          {order.giftNote && (
            <Card className="bg-haldi-200">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em]">🎁 Gift wrap · handwritten note</p>
              <p className="mt-2 font-display text-lg">“{order.giftNote}”</p>
            </Card>
          )}

          <Card>
            <h2 className="font-display text-xl">History</h2>
            <ol className="mt-3 space-y-3 text-[14px]">
              {order.events.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-geru-600" />
                  <span><b>{statusCopy[e.status]?.label}</b>{e.note && ` — ${e.note}`}<span className="block text-[12px] text-kajal-400">{new Date(e.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span></span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <OrderControls
            id={order.id}
            status={order.status}
            paymentStatus={order.paymentStatus}
            courier={order.courier ?? ""}
            trackingNumber={order.trackingNumber ?? ""}
            needsAttention={!!order.needsAttention}
          />
          <Card>
            <h2 className="font-display text-xl">Ship to</h2>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-[14px] leading-relaxed">{addressText}</pre>
            <p className="mt-3 text-[14px]"><a className="underline" href={`mailto:${order.email}`}>{order.email}</a></p>
            <p className="mt-1 text-[12px] text-kajal-400">{order.user ? "Registered customer" : "Guest checkout"}</p>
          </Card>
          <Card>
            <h2 className="font-display text-xl">Payment</h2>
            <dl className="mt-3 space-y-1 text-[13px]">
              <div className="flex justify-between gap-3"><dt className="text-kajal-400">Razorpay order</dt><dd className="truncate font-mono">{order.razorpayOrderId ?? "—"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-kajal-400">Payment id</dt><dd className="truncate font-mono">{order.razorpayPaymentId ?? "—"}</dd></div>
            </dl>
            {order.razorpayPaymentId && (
              <a className="mt-3 inline-block text-[13px] font-semibold underline" target="_blank" rel="noreferrer" href={`https://dashboard.razorpay.com/app/payments/${order.razorpayPaymentId}`}>
                Open in Razorpay ↗
              </a>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

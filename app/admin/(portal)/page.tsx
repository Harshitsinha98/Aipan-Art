import { requireAdminPage } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, PageHead, Pill, Stat, Table } from "@/components/admin/bits";
import { formatDate, formatINR, statusCopy } from "@/lib/utils";

export default async function Dashboard() {
  await requireAdminPage();
  const now = new Date();
  const startToday = new Date(now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) + "T00:00:00+05:30");
  const d30 = new Date(now.getTime() - 30 * 864e5);
  const d7 = new Date(now.getTime() - 7 * 864e5);

  const [today, week, month, toShip, attention, recent, products, variants, daily] = await Promise.all([
    prisma.order.aggregate({ where: { paymentStatus: "PAID", paidAt: { gte: startToday } }, _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID", paidAt: { gte: d7 } }, _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID", paidAt: { gte: d30 } }, _sum: { total: true }, _count: true }),
    prisma.order.count({ where: { paymentStatus: "PAID", status: { in: ["CONFIRMED", "CRAFTING"] } } }),
    prisma.order.findMany({ where: { needsAttention: { not: null } }, select: { id: true, orderNumber: true, needsAttention: true } }),
    prisma.order.findMany({ where: { paymentStatus: "PAID" }, orderBy: { paidAt: "desc" }, take: 8 }),
    prisma.product.findMany({ where: { status: "ACTIVE", madeToOrder: false, variants: { none: {} } }, select: { id: true, name: true, stock: true, lowStockAt: true } }),
    prisma.productVariant.findMany({ where: { product: { status: "ACTIVE", madeToOrder: false } }, include: { product: { select: { id: true, name: true, lowStockAt: true } } } }),
    prisma.$queryRaw<{ day: Date; total: bigint }[]>`
      SELECT date_trunc('day', ("paidAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata') AS day, SUM(total)::bigint AS total
      FROM "Order" WHERE "paymentStatus" = 'PAID' AND "paidAt" >= ${d30}
      GROUP BY 1 ORDER BY 1`,
  ]);

  const low = [
    ...products.filter((p) => p.stock <= p.lowStockAt).map((p) => ({ id: p.id, name: p.name, stock: p.stock })),
    ...variants.filter((v) => v.stock <= v.product.lowStockAt).map((v) => ({ id: v.product.id, name: `${v.product.name} — ${v.label}`, stock: v.stock })),
  ].sort((a, b) => a.stock - b.stock);

  // 30-day sparkline
  const byDay = new Map(daily.map((d) => [new Date(d.day).toISOString().slice(0, 10), Number(d.total)]));
  const series = Array.from({ length: 30 }, (_, i) => {
    const day = new Date(now.getTime() - (29 - i) * 864e5).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    return byDay.get(day) ?? 0;
  });
  const max = Math.max(1, ...series);

  return (
    <div>
      <PageHead title="Today" sub={now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" })} />

      {attention.length > 0 && (
        <Card className="mb-6 bg-geru-50 ring-1 ring-geru-300">
          <p className="font-semibold text-geru-700">Needs your attention</p>
          <ul className="mt-2 space-y-1 text-[14px]">
            {attention.map((o) => (
              <li key={o.id}><Link href={`/admin/orders/${o.id}`} className="font-semibold underline">{o.orderNumber}</Link> — {o.needsAttention}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Today" value={formatINR(today._sum.total ?? 0)} hint={`${today._count} orders`} tone="geru" />
        <Stat label="Last 7 days" value={formatINR(week._sum.total ?? 0)} hint={`${week._count} orders`} />
        <Stat label="Last 30 days" value={formatINR(month._sum.total ?? 0)} hint={`${month._count} orders`} />
        <Link href="/admin/orders?status=CONFIRMED"><Stat label="To make / pack" value={String(toShip)} hint="Paid, not shipped yet →" tone="haldi" /></Link>
      </div>

      <Card className="mt-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-kajal-400">Sales, last 30 days</p>
        <div className="mt-4 flex h-28 items-end gap-1">
          {series.map((v, i) => (
            <div key={i} title={formatINR(v)} className="flex-1 rounded-t bg-geru-600/80 transition hover:bg-geru-600" style={{ height: `${Math.max(3, (v / max) * 100)}%`, opacity: v ? 1 : 0.15 }} />
          ))}
        </div>
      </Card>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div>
          <h2 className="mb-3 font-display text-2xl">Latest paid orders</h2>
          <Table head={["Order", "Customer", "Total", "Status", "Paid"]}>
            {recent.map((o) => (
              <tr key={o.id} className="hover:bg-biswar/50">
                <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-semibold underline-offset-2 hover:underline">{o.orderNumber}</Link></td>
                <td className="px-4 py-3">{o.name}</td>
                <td className="px-4 py-3 tabular-nums">{formatINR(o.total)}</td>
                <td className="px-4 py-3"><Pill className={statusCopy[o.status]?.tone}>{statusCopy[o.status]?.label}</Pill></td>
                <td className="px-4 py-3 text-kajal-400">{o.paidAt ? formatDate(o.paidAt) : "—"}</td>
              </tr>
            ))}
            {!recent.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-kajal-400">No paid orders yet.</td></tr>}
          </Table>
        </div>
        <div>
          <h2 className="mb-3 font-display text-2xl">Running low</h2>
          <Card className="p-0">
            <ul className="divide-y divide-kajal/5">
              {low.slice(0, 12).map((l, i) => (
                <li key={i} className="flex items-center justify-between px-5 py-3 text-[14px]">
                  <Link href={`/admin/products/${l.id}`} className="truncate hover:underline">{l.name}</Link>
                  <Pill className={l.stock === 0 ? "bg-geru-600 text-biswar" : "bg-haldi-200"}>{l.stock === 0 ? "Out" : `${l.stock} left`}</Pill>
                </li>
              ))}
              {!low.length && <li className="px-5 py-8 text-center text-[14px] text-kajal-400">All stocked up.</li>}
            </ul>
            <Link href="/admin/inventory" className="block border-t border-kajal/5 px-5 py-3 text-[13px] font-semibold">Open inventory →</Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

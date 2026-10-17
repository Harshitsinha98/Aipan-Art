import { requireAdminPage } from "@/lib/auth";
import Link from "next/link";
import type { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageHead, Pill, Table, payTone } from "@/components/admin/bits";
import { formatDate, formatINR, statusCopy, cn } from "@/lib/utils";

const filters: { key: string; label: string }[] = [
  { key: "open", label: "To do" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "CRAFTING", label: "Making" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "unpaid", label: "Unpaid / abandoned" },
  { key: "all", label: "All" },
];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireAdminPage();
  const { status = "open", q } = await searchParams;
  const where: Prisma.OrderWhereInput = {};
  if (status === "open") Object.assign(where, { paymentStatus: "PAID", status: { in: ["CONFIRMED", "CRAFTING"] } });
  else if (status === "unpaid") Object.assign(where, { paymentStatus: { in: ["PENDING", "FAILED"] } });
  else if (status !== "all") Object.assign(where, { status: status as OrderStatus });
  if (q) where.OR = [{ orderNumber: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }];

  const orders = await prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: { _count: { select: { items: true } } } });

  return (
    <div>
      <PageHead title="Orders" sub={`${orders.length} shown`} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <Link key={f.key} href={`/admin/orders?status=${f.key}`} className={cn("rounded-full px-3.5 py-1.5 text-[13px] font-medium", status === f.key ? "bg-kajal text-biswar" : "bg-white hover:bg-kajal/5")}>
            {f.label}
          </Link>
        ))}
        <form className="ml-auto">
          <input type="hidden" name="status" value={status} />
          <input name="q" defaultValue={q} placeholder="Search number, name, email, phone" className="field w-72 py-2" />
        </form>
      </div>
      <Table head={["Order", "Customer", "Items", "Total", "Payment", "Status", "Placed"]}>
        {orders.map((o) => (
          <tr key={o.id} className="hover:bg-biswar/50">
            <td className="px-4 py-3">
              <Link href={`/admin/orders/${o.id}`} className="font-semibold hover:underline">{o.orderNumber}</Link>
              {o.needsAttention && <span className="ml-2 text-geru-600" title={o.needsAttention}>●</span>}
            </td>
            <td className="px-4 py-3"><p>{o.name}</p><p className="text-[12px] text-kajal-400">{o.email}</p></td>
            <td className="px-4 py-3">{o._count.items}</td>
            <td className="px-4 py-3 tabular-nums">{formatINR(o.total)}</td>
            <td className="px-4 py-3"><Pill className={payTone[o.paymentStatus]}>{o.paymentStatus}</Pill></td>
            <td className="px-4 py-3"><Pill className={statusCopy[o.status]?.tone}>{statusCopy[o.status]?.label}</Pill></td>
            <td className="px-4 py-3 text-kajal-400">{formatDate(o.createdAt)}</td>
          </tr>
        ))}
        {!orders.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-kajal-400">Nothing here.</td></tr>}
      </Table>
    </div>
  );
}

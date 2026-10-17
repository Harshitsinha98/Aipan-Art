import { requireAdminPage } from "@/lib/auth";
import Link from "next/link";
import type { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageHead, Pill, Stat, Table, payTone } from "@/components/admin/bits";
import { formatINR, cn } from "@/lib/utils";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  await requireAdminPage();
  const { s } = await searchParams;
  const filter = (["PAID", "PENDING", "FAILED", "REFUNDED"].includes(s ?? "") ? s : undefined) as PaymentStatus | undefined;
  const [rows, sums] = await Promise.all([
    prisma.order.findMany({
      where: { razorpayOrderId: { not: null }, ...(filter ? { paymentStatus: filter } : {}) },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, orderNumber: true, name: true, total: true, paymentStatus: true, razorpayOrderId: true, razorpayPaymentId: true, createdAt: true, paidAt: true },
    }),
    prisma.order.groupBy({ by: ["paymentStatus"], where: { razorpayOrderId: { not: null } }, _sum: { total: true }, _count: true }),
  ]);
  const sum = (k: PaymentStatus) => sums.find((x) => x.paymentStatus === k);

  return (
    <div>
      <PageHead title="Payments" sub="Every Razorpay attempt, newest first. Settlements land in your bank per your Razorpay schedule." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Collected" value={formatINR(sum("PAID")?._sum.total ?? 0)} hint={`${sum("PAID")?._count ?? 0} payments`} tone="pine" />
        <Stat label="Refunded" value={formatINR(sum("REFUNDED")?._sum.total ?? 0)} hint={`${sum("REFUNDED")?._count ?? 0} refunds`} />
        <Stat label="Failed" value={String(sum("FAILED")?._count ?? 0)} hint="attempts" />
        <Stat label="Abandoned" value={String(sum("PENDING")?._count ?? 0)} hint="opened checkout, didn't pay" />
      </div>
      <div className="my-5 flex gap-2">
        {["All", "PAID", "PENDING", "FAILED", "REFUNDED"].map((k) => (
          <Link key={k} href={k === "All" ? "/admin/payments" : `/admin/payments?s=${k}`} className={cn("rounded-full px-3.5 py-1.5 text-[13px] font-medium", (filter ?? "All") === k ? "bg-kajal text-biswar" : "bg-white")}>
            {k[0] + k.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>
      <Table head={["Order", "Customer", "Amount", "Status", "Razorpay payment", "When"]}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="px-4 py-3"><Link href={`/admin/orders/${r.id}`} className="font-semibold hover:underline">{r.orderNumber}</Link></td>
            <td className="px-4 py-3">{r.name}</td>
            <td className="px-4 py-3 tabular-nums">{formatINR(r.total)}</td>
            <td className="px-4 py-3"><Pill className={payTone[r.paymentStatus]}>{r.paymentStatus}</Pill></td>
            <td className="px-4 py-3 font-mono text-[12px]">
              {r.razorpayPaymentId ? (
                <a className="underline" target="_blank" rel="noreferrer" href={`https://dashboard.razorpay.com/app/payments/${r.razorpayPaymentId}`}>{r.razorpayPaymentId}</a>
              ) : (
                <span className="text-kajal-300">{r.razorpayOrderId}</span>
              )}
            </td>
            <td className="px-4 py-3 text-kajal-400">{(r.paidAt ?? r.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

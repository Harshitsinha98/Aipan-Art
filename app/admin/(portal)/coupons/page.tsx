import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, PageHead, Table } from "@/components/admin/bits";
import { ActiveToggle, CouponForm } from "@/components/admin/forms";
import { formatDate, formatINR } from "@/lib/utils";

export default async function CouponsPage() {
  await requireAdminPage();
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <PageHead title="Coupons" sub="Codes customers type at checkout." />
      <Card className="mb-6"><CouponForm /></Card>
      <Table head={["Code", "Discount", "Rules", "Used", "Expires", ""]}>
        {coupons.map((c) => (
          <tr key={c.id}>
            <td className="px-4 py-3 font-mono font-semibold">{c.code}<p className="font-sans text-[12px] font-normal text-kajal-400">{c.description}</p></td>
            <td className="px-4 py-3">{c.type === "PERCENT" ? `${c.value}%` : formatINR(c.value)}{c.maxDiscount ? ` (max ${formatINR(c.maxDiscount)})` : ""}</td>
            <td className="px-4 py-3 text-kajal-600">{c.minimumOrder ? `Min ${formatINR(c.minimumOrder)}` : "—"}</td>
            <td className="px-4 py-3 tabular-nums">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
            <td className="px-4 py-3 text-kajal-400">{c.expiresAt ? formatDate(c.expiresAt) : "Never"}</td>
            <td className="px-4 py-3"><ActiveToggle id={c.id} active={c.active} kind="coupon" /></td>
          </tr>
        ))}
        {!coupons.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-kajal-400">No codes yet.</td></tr>}
      </Table>
    </div>
  );
}

import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHead, Pill, Table } from "@/components/admin/bits";
import { formatDate, formatINR } from "@/lib/utils";

/** Everyone who has paid, registered or not — grouped by email. */
export default async function CustomersPage() {
  await requireAdminPage();
  const [buyers, users] = await Promise.all([
    prisma.order.groupBy({
      by: ["email"],
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
      _count: true,
      _max: { paidAt: true },
      orderBy: { _sum: { total: "desc" } },
      take: 500,
    }),
    prisma.user.findMany({ where: { role: "CUSTOMER" }, select: { email: true, name: true, phone: true, createdAt: true } }),
  ]);
  const byEmail = new Map(users.map((u) => [u.email, u]));
  const names = new Map(
    (await prisma.order.findMany({ where: { email: { in: buyers.map((b) => b.email) } }, select: { email: true, name: true, phone: true }, distinct: ["email"] })).map((o) => [o.email, o]),
  );
  const nonBuyers = users.filter((u) => !buyers.some((b) => b.email === u.email));

  return (
    <div>
      <PageHead title="Customers" sub={`${buyers.length} buyers · ${users.length} accounts`} />
      <Table head={["Customer", "Contact", "Orders", "Spent", "Last order", ""]}>
        {buyers.map((b) => {
          const u = byEmail.get(b.email);
          const o = names.get(b.email);
          return (
            <tr key={b.email}>
              <td className="px-4 py-3 font-medium">{u?.name ?? o?.name}</td>
              <td className="px-4 py-3 text-[13px]"><a href={`mailto:${b.email}`} className="underline">{b.email}</a><p className="text-kajal-400">{u?.phone ?? o?.phone}</p></td>
              <td className="px-4 py-3 tabular-nums">{b._count}</td>
              <td className="px-4 py-3 font-semibold tabular-nums">{formatINR(b._sum.total ?? 0)}</td>
              <td className="px-4 py-3 text-kajal-400">{b._max.paidAt ? formatDate(b._max.paidAt) : "—"}</td>
              <td className="px-4 py-3">{u ? <Pill className="bg-pine/15 text-pine">Account</Pill> : <Pill className="bg-kajal/10">Guest</Pill>}</td>
            </tr>
          );
        })}
        {nonBuyers.map((u) => (
          <tr key={u.email} className="text-kajal-400">
            <td className="px-4 py-3">{u.name}</td>
            <td className="px-4 py-3 text-[13px]">{u.email}</td>
            <td className="px-4 py-3">0</td>
            <td className="px-4 py-3">—</td>
            <td className="px-4 py-3">Joined {formatDate(u.createdAt)}</td>
            <td className="px-4 py-3"><Pill className="bg-pine/15 text-pine">Account</Pill></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

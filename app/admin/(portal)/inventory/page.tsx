import { requireAdminPage } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, PageHead, Pill, Table } from "@/components/admin/bits";
import { StockAdjust } from "@/components/admin/stock-row";
import { ProductArt } from "@/components/product-art";

export default async function InventoryPage() {
  await requireAdminPage();
  const [products, logs] = await Promise.all([
    prisma.product.findMany({
      where: { status: { not: "ARCHIVED" } },
      orderBy: [{ world: "asc" }, { name: "asc" }],
      include: { variants: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.inventoryLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      include: { product: { select: { name: true } }, variant: { select: { label: true } } },
    }),
  ]);

  const rows = products.flatMap((p) =>
    p.variants.length
      ? p.variants.map((v) => ({ key: v.id, product: p, variantId: v.id, label: v.label, sku: v.sku, stock: v.stock, color: v.colorHex }))
      : [{ key: p.id, product: p, variantId: null as string | null, label: null as string | null, sku: p.sku, stock: p.stock, color: null as string | null }],
  );
  const out = rows.filter((r) => !r.product.madeToOrder && r.stock === 0).length;
  const low = rows.filter((r) => !r.product.madeToOrder && r.stock > 0 && r.stock <= r.product.lowStockAt).length;

  return (
    <div>
      <PageHead title="Inventory" sub={`${rows.length} stock lines · ${low} low · ${out} out of stock`} />
      <div className="grid gap-6 2xl:grid-cols-[1fr_360px]">
        <Table head={["", "Piece", "SKU", "Stock", ""]}>
          {rows.map((r) => (
            <tr key={r.key} className={r.stock === 0 && !r.product.madeToOrder ? "bg-geru-50/50" : ""}>
              <td className="w-14 px-4 py-2"><ProductArt src={r.product.images[0]} alt="" world={r.product.world} swatch={r.color ?? r.product.swatch} className="h-10 w-10 rounded-lg" sizes="40px" /></td>
              <td className="px-4 py-2">
                <Link href={`/admin/products/${r.product.id}`} className="font-medium hover:underline">{r.product.name}</Link>
                {r.label && (
                  <p className="flex items-center gap-1.5 text-[12px] text-kajal-400">
                    {r.color && <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />} {r.label}
                  </p>
                )}
              </td>
              <td className="px-4 py-2 font-mono text-[12px] text-kajal-400">{r.sku}</td>
              <td className="px-4 py-2"><StockAdjust productId={r.product.id} variantId={r.variantId} stock={r.stock} low={r.product.lowStockAt} /></td>
              <td className="px-4 py-2">{r.product.madeToOrder && <Pill className="bg-haldi-200">Made to order</Pill>}</td>
            </tr>
          ))}
        </Table>
        <Card className="self-start">
          <h2 className="font-display text-xl">Stock history</h2>
          <ul className="mt-3 space-y-2.5 text-[13px]">
            {logs.map((l) => (
              <li key={l.id} className="flex justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{l.product.name}{l.variant ? ` — ${l.variant.label}` : ""}</span>
                  <span className="text-kajal-400">{l.reason}{l.reference ? ` · ${l.reference}` : ""}</span>
                </span>
                <span className={`shrink-0 font-semibold tabular-nums ${l.delta < 0 ? "text-geru-600" : "text-pine"}`}>{l.delta > 0 ? `+${l.delta}` : l.delta}</span>
              </li>
            ))}
            {!logs.length && <li className="text-kajal-400">No movements yet.</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}

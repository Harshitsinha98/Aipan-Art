import { requireAdminPage } from "@/lib/auth";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageHead, Pill, Table } from "@/components/admin/bits";
import { ProductArt } from "@/components/product-art";
import { formatINR, cn } from "@/lib/utils";

const statusTone = { ACTIVE: "bg-pine/15 text-pine", DRAFT: "bg-kajal/10 text-kajal-600", ARCHIVED: "bg-geru-100 text-geru-700" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ w?: string; q?: string }> }) {
  await requireAdminPage();
  const { w, q } = await searchParams;
  const where: Prisma.ProductWhereInput = {};
  if (w === "AIPAN" || w === "CROCHET") where.world = w;
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }];
  const products = await prisma.product.findMany({
    where,
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: { category: { select: { name: true } }, variants: { select: { stock: true } } },
  });

  return (
    <div>
      <PageHead
        title="Products"
        sub={`${products.length} pieces`}
        action={<Link href="/admin/products/new" className="rounded-full bg-geru-600 px-5 py-2.5 text-[14px] font-semibold text-biswar">+ New product</Link>}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[["", "All"], ["AIPAN", "Aipan"], ["CROCHET", "Crochet"]].map(([k, label]) => (
          <Link key={k} href={k ? `/admin/products?w=${k}` : "/admin/products"} className={cn("rounded-full px-3.5 py-1.5 text-[13px] font-medium", (w ?? "") === k ? "bg-kajal text-biswar" : "bg-white")}>{label}</Link>
        ))}
        <form className="ml-auto">
          {w && <input type="hidden" name="w" value={w} />}
          <input name="q" defaultValue={q} placeholder="Search name or SKU" className="field w-64 py-2" />
        </form>
      </div>
      <Table head={["", "Product", "Category", "Price", "Stock", "Sold", "Status"]}>
        {products.map((p) => {
          const stock = p.variants.length ? p.variants.reduce((s, v) => s + v.stock, 0) : p.stock;
          return (
            <tr key={p.id} className="hover:bg-biswar/50">
              <td className="w-16 px-4 py-2"><ProductArt src={p.images[0]} alt="" world={p.world} swatch={p.swatch} className="h-12 w-12 rounded-lg" sizes="48px" /></td>
              <td className="px-4 py-2">
                <Link href={`/admin/products/${p.id}`} className="font-semibold hover:underline">{p.name}</Link>
                <p className="text-[12px] text-kajal-400">{p.sku}{p.variants.length ? ` · ${p.variants.length} colours` : ""}{p.featured ? " · ★ featured" : ""}</p>
              </td>
              <td className="px-4 py-2">{p.category.name}</td>
              <td className="px-4 py-2 tabular-nums">{formatINR(p.price)}</td>
              <td className="px-4 py-2">
                {p.madeToOrder ? <Pill className="bg-haldi-200">To order</Pill> : <span className={cn("tabular-nums", stock <= p.lowStockAt && "font-semibold text-geru-600")}>{stock}</span>}
              </td>
              <td className="px-4 py-2 tabular-nums">{p.salesCount}</td>
              <td className="px-4 py-2"><Pill className={statusTone[p.status]}>{p.status === "ACTIVE" ? "Live" : p.status.toLowerCase()}</Pill></td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}

import { requireAdminPage } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHead } from "@/components/admin/bits";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const [p, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { variants: { orderBy: { sortOrder: "asc" } } } }),
    prisma.category.findMany({ orderBy: [{ world: "asc" }, { sortOrder: "asc" }], select: { id: true, name: true, world: true } }),
  ]);
  if (!p) notFound();
  return (
    <div>
      <Link href="/admin/products" className="text-[13px] text-kajal-400 hover:text-kajal">← Products</Link>
      <PageHead
        title={p.name}
        sub={`${p.salesCount} sold`}
        action={p.status === "ACTIVE" ? <Link href={`/p/${p.slug}`} target="_blank" className="text-[13px] font-semibold underline">View in shop ↗</Link> : null}
      />
      <ProductForm
        key={p.updatedAt.toISOString()}
        id={p.id}
        categories={categories}
        initial={{
          name: p.name, slug: p.slug, sku: p.sku, categoryId: p.categoryId, world: p.world,
          tagline: p.tagline ?? "", description: p.description, makerNote: p.makerNote ?? "", materials: p.materials ?? "",
          care: p.care ?? "", dimensions: p.dimensions ?? "", price: p.price, compareAtPrice: p.compareAtPrice,
          images: p.images, swatch: p.swatch, stock: p.stock, lowStockAt: p.lowStockAt, madeToOrder: p.madeToOrder,
          leadTimeDays: p.leadTimeDays, customizable: p.customizable, customizationLabel: p.customizationLabel ?? "",
          featured: p.featured, status: p.status, weightGrams: p.weightGrams,
          variants: p.variants.map((v) => ({ id: v.id, label: v.label, colorHex: v.colorHex, sku: v.sku, price: v.price, stock: v.stock })),
        }}
      />
    </div>
  );
}

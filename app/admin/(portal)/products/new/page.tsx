import { requireAdminPage } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHead } from "@/components/admin/bits";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProduct() {
  await requireAdminPage();
  const categories = await prisma.category.findMany({ orderBy: [{ world: "asc" }, { sortOrder: "asc" }], select: { id: true, name: true, world: true } });
  const first = categories.find((c) => c.world === "CROCHET") ?? categories[0];
  return (
    <div>
      <Link href="/admin/products" className="text-[13px] text-kajal-400 hover:text-kajal">← Products</Link>
      <PageHead title="New product" />
      {categories.length === 0 ? (
        <p>Create a <Link className="underline" href="/admin/categories">category</Link> first.</p>
      ) : (
        <ProductForm
          id={null}
          categories={categories}
          initial={{
            name: "", slug: "", sku: "", categoryId: first?.id ?? "", world: first?.world ?? "CROCHET",
            tagline: "", description: "", makerNote: "", materials: "", care: "", dimensions: "",
            price: 0, compareAtPrice: null, images: [], swatch: first?.world === "AIPAN" ? "#9B2D20" : "#1E3A2C",
            stock: 1, lowStockAt: 2, madeToOrder: false, leadTimeDays: null, customizable: false, customizationLabel: "",
            featured: false, status: "ACTIVE", weightGrams: null, variants: [],
          }}
        />
      )}
    </div>
  );
}

import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, PageHead } from "@/components/admin/bits";
import { ActiveToggle, CategoryForm } from "@/components/admin/forms";

export default async function CategoriesPage() {
  await requireAdminPage();
  const cats = await prisma.category.findMany({
    orderBy: [{ world: "asc" }, { sortOrder: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return (
    <div className="max-w-5xl">
      <PageHead title="Categories" sub="Shown as filter chips on each craft's shop page." />
      <Card className="mb-6">
        <p className="mb-3 font-semibold">Add a category</p>
        <CategoryForm />
      </Card>
      {(["AIPAN", "CROCHET"] as const).map((w) => (
        <div key={w} className="mb-8">
          <h2 className="mb-3 font-display text-2xl">{w === "AIPAN" ? "Aipan · Likhai" : "Crochet · Hook"}</h2>
          <div className="space-y-3">
            {cats.filter((c) => c.world === w).map((c) => (
              <Card key={c.id}>
                <div className="mb-3 flex items-center justify-between text-[13px]">
                  <span className="text-kajal-400">{c._count.products} products</span>
                  <ActiveToggle id={c.id} active={c.active} kind="category" />
                </div>
                <CategoryForm initial={c} />
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

import Link from "next/link";
import type { World } from "@prisma/client";
import { getCategories, getProducts, type ShopQuery } from "@/lib/catalog";
import { ProductCard } from "./product-card";
import { ShopControls } from "./shop-controls";
import { ChowkiMandala, Vasudhara } from "../motifs";
import { worlds } from "@/lib/site";
import { cn } from "@/lib/utils";

type Params = { category?: string; sort?: string; q?: string; instock?: string; focus?: string };

export async function ShopView({ world, params }: { world?: World; params: Params }) {
  const query: ShopQuery = {
    world,
    category: params.category || undefined,
    sort: (["new", "price-asc", "price-desc", "loved"].includes(params.sort ?? "") ? params.sort : "new") as ShopQuery["sort"],
    q: params.q?.slice(0, 60) || undefined,
    inStock: params.instock === "1",
  };
  const [products, categories] = await Promise.all([getProducts(query), getCategories(world)]);
  const base = world ? `/shop/${worlds[world].slug}` : "/shop";
  const w = world ? worlds[world] : null;

  return (
    <div>
      <section className="px-3 sm:px-6">
        <div
          className={cn(
            "relative mx-auto flex min-h-[340px] max-w-[1500px] flex-col justify-end overflow-hidden rounded-[28px] p-6 sm:rounded-[40px] sm:p-12",
            world === "AIPAN" && "grain bg-geru-600 text-biswar",
            world === "CROCHET" && "rib text-biswar",
            !world && "bg-kajal text-biswar",
          )}
          style={world === "CROCHET" ? { ["--swatch" as string]: "#1E3A2C" } : undefined}
        >
          {world === "AIPAN" && <ChowkiMandala className="absolute -right-24 -top-24 w-[520px] text-biswar/40" />}
          {world !== "AIPAN" && <Vasudhara className="absolute right-10 top-0 h-56 text-haldi/80" lines={8} />}
          <div className="relative z-[2]">
            {w && <p className="font-deva text-2xl text-haldi">{w.deva}</p>}
            <h1 className="mt-2 font-display text-mega">{w ? w.name : "Everything"}</h1>
            <p className="mt-4 max-w-lg text-biswar/80">{w ? w.blurb : "Both crafts, every piece in the shop right now."}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <div className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Chip href={base} active={!query.category}>All</Chip>
          {!world && (
            <>
              <Chip href="/shop/aipan" active={false}>Likhai · Aipan</Chip>
              <Chip href="/shop/crochet" active={false}>Hook · Crochet</Chip>
            </>
          )}
          {categories.map((c) => (
            <Chip key={c.id} href={`${base}?category=${c.slug}`} active={query.category === c.slug}>
              {c.name} <span className="opacity-50">{c._count.products}</span>
            </Chip>
          ))}
        </div>

        <ShopControls total={products.length} autoFocus={params.focus === "search"} />

        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-4xl">Nothing on the table here — yet.</p>
            <p className="mt-3 text-kajal-400">Try another category, or ask for it made to order.</p>
            <Link href="/shop" className="mt-6 inline-block rounded-full bg-kajal px-6 py-3 font-semibold text-biswar">Browse everything</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} p={p} index={i} tall={i % 7 === 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-medium transition",
        active ? "bg-kajal text-biswar" : "bg-kajal/[0.06] hover:bg-kajal/10",
      )}
    >
      {children}
    </Link>
  );
}

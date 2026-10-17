import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { MakerLetter, Process, Promises, TwoWorlds, WordMarquee } from "@/components/home/sections";
import { ProductCard } from "@/components/shop/product-card";
import { getFeatured } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import type { CardProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";

async function load() {
  try {
    const [picks, crochet, aipan, counts] = await Promise.all([
      getFeatured(undefined, 6),
      getFeatured("CROCHET", 4),
      getFeatured("AIPAN", 4),
      prisma.product.groupBy({ by: ["world"], where: { status: "ACTIVE" }, _count: true }),
    ]);
    const c = { AIPAN: 0, CROCHET: 0 };
    counts.forEach((r) => (c[r.world] = r._count));
    return { picks, crochet, aipan, counts: c };
  } catch (e) {
    console.error("[home] catalogue unavailable", e);
    return { picks: [] as CardProduct[], crochet: [] as CardProduct[], aipan: [] as CardProduct[], counts: { AIPAN: 0, CROCHET: 0 } };
  }
}

export default async function Home() {
  const { picks, crochet, aipan, counts } = await load();
  return (
    <>
      <Hero picks={picks} />
      <WordMarquee />
      <TwoWorlds counts={counts} />
      {crochet.length > 0 && <Shelf title="Fresh off the hook" eyebrow="Crochet" href="/shop/crochet" items={crochet} />}
      <Process />
      {aipan.length > 0 && <Shelf title="For the puja room & the wall" eyebrow="Aipan" href="/shop/aipan" items={aipan} />}
      <MakerLetter />
      <Promises />
    </>
  );
}

function Shelf({ title, eyebrow, href, items }: { title: string; eyebrow: string; href: string; items: CardProduct[] }) {
  return (
    <section className="mx-auto mt-28 max-w-[1400px] px-4 sm:px-8">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-geru-600">{eyebrow}</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[0.98] tracking-[-0.02em]">{title}</h2>
        </div>
        <Link href={href} className="group hidden shrink-0 items-center gap-2 font-semibold sm:flex">
          <span className="link-underline">See all</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {items.map((p, i) => (
          <div key={p.id} className={i % 2 === 1 ? "lg:mt-16" : ""}>
            <ProductCard p={p} index={i} />
          </div>
        ))}
      </div>
      <Link href={href} className="mt-10 flex items-center justify-center gap-2 rounded-full border border-kajal/15 py-3 font-semibold sm:hidden">
        See all <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

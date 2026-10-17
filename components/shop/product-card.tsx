"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import type { CardProduct } from "@/lib/catalog";
import { ProductArt } from "../product-art";
import { formatINR, cn } from "@/lib/utils";
import { useCart } from "@/store/cart";

export function ProductCard({ p, index = 0, tall }: { p: CardProduct; index?: number; tall?: boolean }) {
  const add = useCart((s) => s.add);
  const setOpen = useCart((s) => s.setOpen);
  const reduce = useReducedMotion();
  const quickAddable = !p.soldOut && !p.customizable && p.maxQty > 0;
  const off = p.compareAtPrice && p.compareAtPrice > p.price ? Math.round(100 - (p.price / p.compareAtPrice) * 100) : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: reduce ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <Link href={`/p/${p.slug}`} className="block">
        <div className={cn("relative overflow-hidden rounded-[22px]", tall ? "aspect-[3/4.2]" : "aspect-[4/5]")}>
          <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.045]">
            <ProductArt src={p.images[0]} alt={p.name} world={p.world} swatch={p.swatch} className="h-full w-full" seed={index} />
          </div>
          {p.images[1] && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <ProductArt src={p.images[1]} alt="" world={p.world} swatch={p.swatch} className="h-full w-full" />
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {p.soldOut && <Tag className="bg-kajal text-biswar">Sold out</Tag>}
            {p.lowStock && <Tag className="bg-haldi text-kajal">Last few</Tag>}
            {p.madeToOrder && !p.soldOut && <Tag className="bg-biswar/90 text-kajal">Made to order</Tag>}
            {off > 0 && <Tag className="bg-geru-600 text-biswar">−{off}%</Tag>}
          </div>
        </div>
      </Link>

      {quickAddable && (
        <button
          onClick={() => {
            add({
              productId: p.id,
              variantId: p.defaultVariantId,
              slug: p.slug,
              name: p.name,
              variantLabel: p.defaultVariantLabel,
              image: p.images[0] ?? null,
              swatch: p.swatch,
              world: p.world,
              price: p.defaultPrice,
              maxQty: p.maxQty,
              customization: null,
            });
            setOpen(true);
          }}
          className="absolute right-3 top-3 flex h-10 items-center gap-1.5 rounded-full bg-biswar/95 px-3 text-[13px] font-semibold text-kajal shadow-sm transition-all duration-300 hover:bg-kajal hover:text-biswar sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
          aria-label={`Add ${p.name} to bag`}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add</span>
        </button>
      )}

      <Link href={`/p/${p.slug}`} className="mt-3 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-medium">{p.name}</h3>
          <p className="truncate text-[13px] text-kajal-400">{p.tagline ?? p.categoryName}</p>
          {p.colors.length > 1 && (
            <div className="mt-2 flex gap-1">
              {p.colors.slice(0, 5).map((c) => (
                <span key={c.label} title={c.label} className="h-3 w-3 rounded-full ring-1 ring-kajal/15" style={{ background: c.hex ?? p.swatch }} />
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-semibold tabular-nums">{formatINR(p.price)}</p>
          {off > 0 && <p className="text-[12px] text-kajal-300 line-through tabular-nums">{formatINR(p.compareAtPrice!)}</p>}
        </div>
      </Link>
    </motion.article>
  );
}

function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em]", className)}>{children}</span>;
}

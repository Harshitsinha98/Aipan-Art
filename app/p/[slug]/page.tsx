import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductBySlug, getRelated } from "@/lib/catalog";
import { ProductBuy } from "@/components/shop/product-buy";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductCard } from "@/components/shop/product-card";
import { BelBorder, Pagla } from "@/components/motifs";
import { worlds } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug).catch(() => null);
  if (!p) return {};
  return {
    title: p.name,
    description: p.tagline ?? p.description.slice(0, 150),
    openGraph: { images: p.images[0] ? [p.images[0]] : [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const related = await getRelated(product.id, product.world);
  const w = worlds[product.world];
  const rating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null;

  const buy = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    tagline: product.tagline,
    world: product.world,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    image: product.images[0] ?? null,
    swatch: product.swatch,
    stock: product.stock,
    madeToOrder: product.madeToOrder,
    leadTimeDays: product.leadTimeDays,
    customizable: product.customizable,
    customizationLabel: product.customizationLabel,
    description: product.description,
    makerNote: product.makerNote,
    materials: product.materials,
    care: product.care,
    dimensions: product.dimensions,
    rating,
    reviewCount: product.reviews.length,
    variants: product.variants.map((v) => ({ id: v.id, label: v.label, colorHex: v.colorHex, price: v.price, stock: v.stock })),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: product.madeToOrder || product.stock > 0 || product.variants.some((v) => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="flex gap-2 py-4 text-[13px] text-kajal-400" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-kajal">Shop</Link>/
        <Link href={`/shop/${w.slug}`} className="hover:text-kajal">{w.name}</Link>/
        <Link href={`/shop/${w.slug}?category=${product.category.slug}`} className="hover:text-kajal">{product.category.name}</Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <ProductGallery images={product.images} name={product.name} world={product.world} swatch={product.swatch} />
        <ProductBuy p={buy} />
      </div>

      {product.reviews.length > 0 && (
        <section className="mt-28">
          <BelBorder className="text-geru-600/40" id="rev-bel" />
          <div className="grid gap-10 py-14 lg:grid-cols-[1fr_2fr]">
            <div>
              <p className="eyebrow text-geru-600">Kind words</p>
              <p className="mt-3 font-display text-7xl">{rating?.toFixed(1)}</p>
              <p className="text-kajal-400">from {product.reviews.length} {product.reviews.length === 1 ? "review" : "reviews"}</p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {product.reviews.map((r) => (
                <li key={r.id} className="rounded-3xl bg-white/60 p-6">
                  <div className="flex gap-1 text-geru-600">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Pagla key={i} className={`h-4 ${i < r.rating ? "" : "opacity-20"}`} />
                    ))}
                  </div>
                  <p className="mt-3 leading-relaxed">{r.body}</p>
                  <p className="mt-4 text-[13px] text-kajal-400">
                    {r.user.name ?? "A customer"} · {formatDate(r.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 font-display text-4xl sm:text-5xl">You might also like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {related.map((r, i) => (
              <ProductCard key={r.id} p={r} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

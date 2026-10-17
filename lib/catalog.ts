import "server-only";
import type { Prisma, World } from "@prisma/client";
import { prisma } from "./prisma";

export type CardProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  world: World;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  swatch: string;
  categoryName: string;
  soldOut: boolean;
  lowStock: boolean;
  madeToOrder: boolean;
  colors: { label: string; hex: string | null }[];
  defaultVariantId: string | null;
  defaultVariantLabel: string | null;
  defaultPrice: number;
  maxQty: number;
  hasVariants: boolean;
  customizable: boolean;
  createdAt: string;
};

const cardInclude = {
  category: { select: { name: true } },
  variants: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.ProductInclude;

type WithCard = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

export function toCard(p: WithCard): CardProduct {
  const totalStock = p.variants.length ? p.variants.reduce((s, v) => s + v.stock, 0) : p.stock;
  const firstAvailable = p.variants.find((v) => v.stock > 0) ?? p.variants[0];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    world: p.world,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: p.images,
    swatch: p.swatch,
    categoryName: p.category.name,
    soldOut: !p.madeToOrder && totalStock <= 0,
    lowStock: !p.madeToOrder && totalStock > 0 && totalStock <= p.lowStockAt,
    madeToOrder: p.madeToOrder,
    colors: p.variants.map((v) => ({ label: v.label, hex: v.colorHex })),
    defaultVariantId: firstAvailable?.id ?? null,
    defaultVariantLabel: firstAvailable?.label ?? null,
    defaultPrice: firstAvailable?.price ?? p.price,
    maxQty: p.madeToOrder ? 10 : Math.min(10, firstAvailable ? firstAvailable.stock : p.stock),
    hasVariants: p.variants.length > 0,
    customizable: p.customizable,
    createdAt: p.createdAt.toISOString(),
  };
}

export type ShopQuery = {
  world?: World;
  category?: string;
  sort?: "new" | "price-asc" | "price-desc" | "loved";
  q?: string;
  inStock?: boolean;
};

export async function getProducts(query: ShopQuery = {}) {
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
  if (query.world) where.world = query.world;
  if (query.category) where.category = { slug: query.category };
  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { tagline: { contains: query.q, mode: "insensitive" } },
      { category: { name: { contains: query.q, mode: "insensitive" } } },
    ];
  }
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    query.sort === "price-asc"
      ? [{ price: "asc" }]
      : query.sort === "price-desc"
        ? [{ price: "desc" }]
        : query.sort === "loved"
          ? [{ salesCount: "desc" }]
          : [{ featured: "desc" }, { createdAt: "desc" }];

  const rows = await prisma.product.findMany({ where, orderBy, include: cardInclude, take: 120 });
  let cards = rows.map(toCard);
  if (query.inStock) cards = cards.filter((c) => !c.soldOut);
  return cards;
}

export async function getFeatured(world?: World, take = 8) {
  const rows = await prisma.product.findMany({
    where: { status: "ACTIVE", ...(world ? { world } : {}) },
    orderBy: [{ featured: "desc" }, { salesCount: "desc" }, { createdAt: "desc" }],
    include: cardInclude,
    take,
  });
  return rows.map(toCard);
}

export async function getCategories(world?: World) {
  return prisma.category.findMany({
    where: { active: true, ...(world ? { world } : {}) },
    orderBy: [{ world: "asc" }, { sortOrder: "asc" }],
    include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      category: true,
      variants: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export async function getRelated(productId: string, world: World, take = 4) {
  const rows = await prisma.product.findMany({
    where: { status: "ACTIVE", world, id: { not: productId } },
    orderBy: [{ salesCount: "desc" }],
    include: cardInclude,
    take,
  });
  return rows.map(toCard);
}

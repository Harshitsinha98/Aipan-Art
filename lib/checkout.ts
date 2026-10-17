import "server-only";
import { prisma } from "./prisma";
import { computeTotals, couponDiscount, couponProblem } from "./pricing";

type InLine = { productId: string; variantId?: string | null; quantity: number; customization?: string | null };

export type PricedLine = {
  productId: string;
  variantId: string | null;
  name: string;
  variantLabel: string | null;
  image: string | null;
  unitPrice: number;
  quantity: number;
  customization: string | null;
  available: number; // how many we can sell right now
  problem: string | null;
};

/** Re-prices a bag from the database. The client's prices are never trusted. */
export async function priceCart(items: InLine[], couponCode?: string | null, giftWrap = false) {
  const products = await prisma.product.findMany({
    where: { id: { in: [...new Set(items.map((i) => i.productId))] } },
    include: { variants: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: PricedLine[] = items.map((item) => {
    const p = byId.get(item.productId);
    if (!p || p.status !== "ACTIVE") {
      return {
        productId: item.productId,
        variantId: item.variantId ?? null,
        name: p?.name ?? "Unavailable piece",
        variantLabel: null,
        image: null,
        unitPrice: 0,
        quantity: item.quantity,
        customization: null,
        available: 0,
        problem: "No longer available",
      };
    }
    const v = item.variantId ? p.variants.find((x) => x.id === item.variantId) : null;
    if (item.variantId && !v) {
      return {
        productId: p.id, variantId: null, name: p.name, variantLabel: null, image: p.images[0] ?? null,
        unitPrice: 0, quantity: item.quantity, customization: null, available: 0, problem: "That colour is no longer available",
      };
    }
    if (!item.variantId && p.variants.length > 0) {
      return {
        productId: p.id, variantId: null, name: p.name, variantLabel: null, image: p.images[0] ?? null,
        unitPrice: 0, quantity: item.quantity, customization: null, available: 0, problem: "Please choose a colour",
      };
    }
    const stock = v ? v.stock : p.stock;
    const available = p.madeToOrder ? 20 : stock;
    let problem: string | null = null;
    if (available <= 0) problem = "Sold out";
    else if (available < item.quantity) problem = `Only ${available} left`;
    if (p.customizable && !item.customization?.trim()) problem = `Needs ${p.customizationLabel ?? "personalisation text"}`;
    return {
      productId: p.id,
      variantId: v?.id ?? null,
      name: p.name,
      variantLabel: v?.label ?? null,
      image: p.images[0] ?? null,
      unitPrice: v?.price ?? p.price,
      quantity: item.quantity,
      customization: p.customizable ? item.customization?.trim() || null : null,
      available,
      problem,
    };
  });

  const subtotal = lines.filter((l) => !l.problem).reduce((s, l) => s + l.unitPrice * l.quantity, 0);

  let discount = 0;
  let couponError: string | null = null;
  let appliedCoupon: string | null = null;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    couponError = couponProblem(coupon, subtotal);
    if (!couponError && coupon) {
      discount = couponDiscount(coupon, subtotal);
      appliedCoupon = coupon.code;
    }
  }

  return {
    lines,
    hasProblems: lines.some((l) => l.problem),
    couponError,
    appliedCoupon,
    ...computeTotals(subtotal, discount, giftWrap),
  };
}

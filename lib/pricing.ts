import { site } from "./site";

export type CouponLike = {
  code: string;
  type: string; // PERCENT | FLAT
  value: number;
  minimumOrder: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: Date | string | null;
  active: boolean;
};

export function couponProblem(coupon: CouponLike | null, subtotal: number): string | null {
  if (!coupon || !coupon.active) return "That code doesn't exist.";
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return "This code has expired.";
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return "This code has been fully used.";
  if (coupon.minimumOrder && subtotal < coupon.minimumOrder)
    return `Add ₹${coupon.minimumOrder - subtotal} more to use this code.`;
  return null;
}

export function couponDiscount(coupon: CouponLike, subtotal: number) {
  const raw = coupon.type === "PERCENT" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  const capped = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
  return Math.max(0, Math.min(capped, subtotal));
}

/** One function, used by the bag preview, the checkout summary and the server. */
export function computeTotals(subtotal: number, discount = 0, giftWrap = false) {
  const afterDiscount = Math.max(0, subtotal - discount);
  const shippingFee = subtotal === 0 || afterDiscount >= site.freeShippingAt ? 0 : site.shippingFee;
  const giftWrapFee = giftWrap ? site.giftWrapFee : 0;
  return {
    subtotal,
    discount,
    shippingFee,
    giftWrapFee,
    total: afterDiscount + shippingFee + giftWrapFee,
    toFreeShipping: Math.max(0, site.freeShippingAt - afterDiscount),
  };
}

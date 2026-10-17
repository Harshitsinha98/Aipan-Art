import { NextResponse } from "next/server";
import { z } from "zod";
import { priceCart } from "@/lib/checkout";
import { cartLineSchema } from "@/lib/validators";

const schema = z.object({
  items: z.array(cartLineSchema).max(30),
  couponCode: z.string().trim().max(30).optional().nullable(),
  giftWrap: z.boolean().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid bag" }, { status: 400 });
  const { items, couponCode, giftWrap } = parsed.data;
  const quote = await priceCart(items, couponCode, giftWrap);
  return NextResponse.json(quote);
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(5, "A few words, please").max(1000),
});

/** Only people who bought (and paid for) the piece can review it. Reviews wait for owner approval. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const bought = await prisma.orderItem.findFirst({
    where: { productId: parsed.data.productId, order: { userId: session.id, paymentStatus: "PAID" } },
  });
  if (!bought) return NextResponse.json({ error: "You can review pieces you've bought." }, { status: 403 });
  await prisma.review.upsert({
    where: { userId_productId: { userId: session.id, productId: parsed.data.productId } },
    create: { ...parsed.data, userId: session.id },
    update: { rating: parsed.data.rating, body: parsed.data.body, approved: false },
  });
  return NextResponse.json({ ok: true });
}

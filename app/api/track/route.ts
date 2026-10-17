import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  orderNumber: z.string().trim().toUpperCase().min(3).max(30),
  email: z.string().trim().toLowerCase().email(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Order number and email, please" }, { status: 400 });
  const order = await prisma.order.findUnique({
    where: { orderNumber: parsed.data.orderNumber },
    select: { orderNumber: true, accessToken: true, email: true },
  });
  if (!order || order.email !== parsed.data.email)
    return NextResponse.json({ error: "We couldn't find an order with those details." }, { status: 404 });
  return NextResponse.json({ url: `/order/${order.orderNumber}?t=${order.accessToken}` });
}

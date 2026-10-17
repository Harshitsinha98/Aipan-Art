import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, startSession } from "@/lib/auth";

/** Turns a guest order into an account: proof of ownership is the order's secret token. */
const schema = z.object({
  orderNumber: z.string().min(3),
  token: z.string().min(10),
  password: z.string().min(8, "At least 8 characters").max(100),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const { orderNumber, token, password } = parsed.data;

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order || order.accessToken !== token) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.userId) return NextResponse.json({ error: "This order is already saved to an account." }, { status: 409 });
  if (await prisma.user.findUnique({ where: { email: order.email } }))
    return NextResponse.json({ error: "You already have an account with this email — please sign in." }, { status: 409 });

  const addr = order.shippingAddress as { name: string; phone: string; line1: string; line2?: string | null; city: string; state: string; pincode: string };
  const user = await prisma.user.create({
    data: {
      email: order.email,
      name: order.name,
      phone: order.phone,
      passwordHash: await hashPassword(password),
      addresses: { create: { ...addr, line2: addr.line2 ?? null, isDefault: true } },
    },
  });
  await prisma.order.update({ where: { id: order.id }, data: { userId: user.id } });
  await startSession(user);
  return NextResponse.json({ ok: true });
}

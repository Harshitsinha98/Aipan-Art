import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { addressSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const parsed = addressSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const count = await prisma.address.count({ where: { userId: session.id } });
  const address = await prisma.address.create({
    data: { ...parsed.data, line2: parsed.data.line2 || null, userId: session.id, isDefault: count === 0 },
  });
  return NextResponse.json({ address });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.address.deleteMany({ where: { id, userId: session.id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  const owned = id && (await prisma.address.findFirst({ where: { id, userId: session.id } }));
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId: session.id }, data: { isDefault: false } }),
    prisma.address.update({ where: { id: owned.id }, data: { isDefault: true } }),
  ]);
  return NextResponse.json({ ok: true });
}

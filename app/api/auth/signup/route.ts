import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, startSession } from "@/lib/auth";
import { signupSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const parsed = signupSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your details" }, { status: 400 });
  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "An account with this email already exists — sign in instead." }, { status: 409 });
  const user = await prisma.user.create({ data: { name, email, passwordHash: await hashPassword(password) } });
  await startSession(user);
  return NextResponse.json({ ok: true });
}

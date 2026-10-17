import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Email and password, please" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const ok = user?.passwordHash ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !ok) return NextResponse.json({ error: "That email and password don't match." }, { status: 401 });
  await startSession(user);
  return NextResponse.json({ ok: true });
}

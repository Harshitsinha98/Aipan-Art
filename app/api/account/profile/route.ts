import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, startSession, verifyPassword } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(15).optional().or(z.literal("")),
  currentPassword: z.string().max(100).optional().or(z.literal("")),
  newPassword: z.string().min(8, "New password needs 8+ characters").max(100).optional().or(z.literal("")),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const { name, phone, currentPassword, newPassword } = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let passwordHash: string | undefined;
  if (newPassword) {
    if (!user.passwordHash || !currentPassword || !(await verifyPassword(currentPassword, user.passwordHash)))
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    passwordHash = await hashPassword(newPassword);
  }
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name, phone: phone || null, ...(passwordHash ? { passwordHash } : {}) },
  });
  await startSession(updated);
  return NextResponse.json({ ok: true });
}

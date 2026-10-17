import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { startSession } from "@/lib/auth";
import { exchangeCodeForProfile, googleConfigured } from "@/lib/google";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fail = (reason: string) => NextResponse.redirect(new URL(`/login?error=${reason}`, req.url));

  if (!googleConfigured()) return fail("google-off");
  if (url.searchParams.get("error")) return fail("google-cancelled");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") ?? "";
  const [nonce, nextB64] = state.split(".");
  const jar = await cookies();
  const expected = jar.get("aa_oauth")?.value;
  jar.delete("aa_oauth");

  if (!code || !nonce || !expected || nonce !== expected) return fail("google-state");

  let next = "/account";
  try {
    const decoded = Buffer.from(nextB64 ?? "", "base64url").toString();
    if (decoded.startsWith("/") && !decoded.startsWith("//")) next = decoded;
  } catch {}

  try {
    const profile = await exchangeCodeForProfile(code);
    const email = profile.email.toLowerCase();

    // Find by email; create the account on first Google sign-in.
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: profile.name ?? undefined },
      create: { email, name: profile.name ?? null },
    });

    await startSession(user);
    return NextResponse.redirect(new URL(next, req.url));
  } catch (e) {
    console.error("[google callback]", e);
    return fail("google-failed");
  }
}

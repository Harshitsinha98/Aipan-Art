import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { googleAuthUrl, googleConfigured } from "@/lib/google";

export async function GET(req: Request) {
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google-off", req.url));
  }
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/account";
  // CSRF state: random value echoed back by Google and checked in the callback.
  const nonce = randomBytes(16).toString("hex");
  const state = `${nonce}.${Buffer.from(next).toString("base64url")}`;

  (await cookies()).set("aa_oauth", nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return NextResponse.redirect(googleAuthUrl(state));
}

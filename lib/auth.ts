import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "aa_session";
export const ADMIN_COOKIE = "aa_admin";

const base = process.env.AUTH_SECRET ?? "dev-only-secret-change-me-dev-only-secret";
if (!process.env.AUTH_SECRET && process.env.NODE_ENV === "production") {
  console.warn("[auth] AUTH_SECRET is not set — sessions are insecure.");
}
const customerKey = new TextEncoder().encode(base);
const adminKey = new TextEncoder().encode(`${base}::owner-panel`);

export type Session = { id: string; email: string; name: string | null };

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

async function sign(payload: Record<string, unknown>, sub: string, key: Uint8Array, exp: string) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setSubject(sub).setIssuedAt().setExpirationTime(exp).sign(key);
}

const secure = process.env.NODE_ENV === "production";

export async function startSession(user: { id: string; email: string; name: string | null }) {
  const token = await sign({ email: user.email, name: user.name }, user.id, customerKey, "30d");
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, customerKey);
    if (!payload.sub) return null;
    return { id: payload.sub, email: String(payload.email), name: (payload.name as string) ?? null };
  } catch {
    return null;
  }
}

/* ---------------- Owner / admin ---------------- */

export async function startAdminSession(user: { id: string; email: string }) {
  const token = await sign({ email: user.email, scope: "owner" }, user.id, adminKey, "12h");
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure,
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

/** Verifies the token AND re-checks the database, so demoting a user takes effect immediately. */
export async function getAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, adminKey);
    if (payload.scope !== "owner" || !payload.sub) return null;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true },
    });
    return user?.role === "ADMIN" ? user : null;
  } catch {
    return null;
  }
}

/**
 * Call at the top of EVERY admin page. Next renders layouts and pages in parallel,
 * so a layout-only check would still let the page's data render into the response.
 */
export async function requireAdminPage() {
  const admin = await getAdmin();
  if (!admin) {
    const { redirect } = await import("next/navigation");
    redirect("/admin/login");
  }
  return admin!;
}

export async function requireSession(next = "/account") {
  const session = await getSession();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return session!;
}

import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "aa_session";
const ADMIN_COOKIE = "aa_admin";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // CSRF: state-changing API calls must come from our own pages. Razorpay's webhook is exempt (it's HMAC-signed).
  if (pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(req.method) && pathname !== "/api/checkout/webhook") {
    const origin = req.headers.get("origin");
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    const allowed = new Set([`https://${host}`, `http://${host}`, process.env.NEXT_PUBLIC_APP_URL].filter(Boolean));
    if (!origin || !allowed.has(origin)) {
      return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 });
    }
  }

  if (pathname.startsWith("/account") && !req.cookies.get(SESSION_COOKIE)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !req.cookies.get(ADMIN_COOKIE)) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/api/:path*"],
};

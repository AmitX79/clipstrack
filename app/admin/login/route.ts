import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminSecretHash } from "@/lib/admin";

// Convenience login for scripts/curl: GET /admin/login?secret=... sets the
// operator cookie and redirects to /admin. Wrong or absent secrets redirect
// to the login form without a cookie.
export function GET(request: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  const given = request.nextUrl.searchParams.get("secret") ?? "";
  const ok =
    secret != null &&
    adminSecretHash(given) === adminSecretHash(secret);
  const res = NextResponse.redirect(new URL("/admin", request.url));
  res.headers.set("Referrer-Policy", "no-referrer");
  if (ok && secret) {
    res.cookies.set(ADMIN_COOKIE, adminSecretHash(secret), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }
  return res;
}
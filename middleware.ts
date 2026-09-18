import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE } from "@/lib/i18n";

// As-needed locale strategy: the default locale (English) lives at bare paths
// (`/`, `/accounts`); every other locale keeps its /{locale} prefix. Bare paths
// rewrite onto the English route so one route tree serves both, and any
// `/en`-prefixed URL is canonicalized onto the bare path.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The accounts page was renamed from /tracked. Redirect every old URL —
  // bare, /en-prefixed, or any /{locale} variant — so bookmarks keep working.
  if (pathname.endsWith("/tracked")) {
    const base = pathname.slice(0, -"/tracked".length);
    const locale = base === "" || base === "/en" ? "" : base;
    const url = request.nextUrl.clone();
    url.pathname = `${locale}/accounts`;
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/en" || pathname === "/en/accounts") {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/en" ? "/" : "/accounts";
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/", "/accounts", "/en", "/en/accounts", "/:path*/tracked"],
};
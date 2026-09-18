import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE } from "@/lib/i18n";

// As-needed locale strategy: the default locale (English) lives at bare paths
// (`/`, `/tracked`); every other locale keeps its /{locale} prefix. Bare paths
// rewrite onto the English route so one route tree serves both, and any
// `/en`-prefixed URL is canonicalized onto the bare path.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/en" || pathname === "/en/tracked") {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/en" ? "/" : "/tracked";
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/", "/tracked", "/en", "/en/tracked"],
};
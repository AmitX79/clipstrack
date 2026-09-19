import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE } from "@/lib/i18n";

// Routes that live at bare paths in the default locale (English). Every other
// locale keeps its /{locale} prefix and resolves through the dynamic [locale]
// route, so no /{locale} variant belongs here.
const BARE_PATHS = ["/", "/accounts", "/faq"] as const;

// As-needed locale strategy: the default locale (English) lives at bare paths
// (`/`, `/accounts`, `/faq`); every other locale keeps its /{locale} prefix.
// Bare paths are rewritten onto the English route so one route tree serves
// both, and any `/en`-prefixed URL is canonicalized onto the bare path.
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

  // Canonicalize /en-prefixed URLs onto the bare path. Only known bare paths
  // redirect; an unknown /en/* 404s anyway (dynamicParams: false).
  const bare =
    pathname === "/en"
      ? "/"
      : pathname.startsWith("/en/")
        ? pathname.slice("/en".length)
        : null;
  if (bare && (BARE_PATHS as readonly string[]).includes(bare)) {
    const url = request.nextUrl.clone();
    url.pathname = bare;
    return NextResponse.redirect(url, 308);
  }

  // Every other bare path rewrites onto the default (English) route.
  const url = request.nextUrl.clone();
  url.pathname =
    pathname === "/" ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/",
    "/accounts",
    "/faq",
    "/en",
    "/en/accounts",
    "/en/faq",
    "/:path*/tracked",
  ],
};
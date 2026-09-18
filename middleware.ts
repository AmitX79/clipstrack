import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/lib/i18n";

// ClipsTrack pages live under /{locale}. Bare paths (`/`, `/tracked`) redirect
// to the visitor's negotiated locale (cookie > Accept-Language > en). Only the
// two top-level routes matter here; every other path is either already
// locale-prefixed or a static asset.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = getLocale(request);
  const target = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  const url = request.nextUrl.clone();
  url.pathname = target;
  return NextResponse.redirect(url, 308);
}

function getLocale(request: NextRequest): (typeof LOCALES)[number] {
  const cookie = request.cookies.get("clipstrack.locale")?.value;
  if (cookie && isLocale(cookie)) return cookie;

  const accept = request.headers.get("accept-language") ?? "";
  const candidates = accept
    .split(",")
    .map((part) => part.split(";")[0]?.trim().split("-")[0]?.toLowerCase())
    .filter(Boolean);
  for (const candidate of candidates) {
    if (isLocale(candidate)) return candidate;
  }
  return DEFAULT_LOCALE;
}

export const config = {
  matcher: ["/", "/tracked"],
};
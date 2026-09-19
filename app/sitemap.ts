import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE, LOCALES, localizedHref } from "@/lib/i18n";

const base = "https://clipstrack.vercel.app";

function hrefFor(locale: (typeof LOCALES)[number], path: string): string {
  const p = localizedHref(locale, path);
  return p === "/" ? base : `${base}${p}`;
}

function variants(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = hrefFor(locale, path);
  }
  languages["x-default"] = hrefFor(DEFAULT_LOCALE, path);
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    entries.push({
      url: hrefFor(locale, ""),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: variants("") },
    });
  }

  for (const locale of LOCALES) {
    entries.push({
      url: hrefFor(locale, "/faq"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: { languages: variants("/faq") },
    });
  }

  for (const path of ["/about", "/privacy", "/terms", "/contact"] as const) {
    for (const locale of LOCALES) {
      entries.push({
        url: hrefFor(locale, path),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
        alternates: { languages: variants(path) },
      });
    }
  }

  return entries;
}
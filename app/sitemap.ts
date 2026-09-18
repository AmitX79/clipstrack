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
      url: hrefFor(locale, "/tracked"),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.4,
      alternates: { languages: variants("/tracked") },
    });
  }

  return entries;
}
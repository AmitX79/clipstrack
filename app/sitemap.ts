import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";

const base = "https://clipstrack.vercel.app";

function variants(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = `${base}/${locale}${path}`;
  }
  languages["x-default"] = `${base}/en${path}`;
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    entries.push({
      url: `${base}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: variants("") },
    });
  }

  for (const locale of LOCALES) {
    entries.push({
      url: `${base}/${locale}/tracked`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.4,
      alternates: { languages: variants("/tracked") },
    });
  }

  return entries;
}
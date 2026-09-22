import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

const base = siteUrl();

export default function robots(): MetadataRoute.Robots {
  const accountsPaths = [
    "/accounts",
    ...LOCALES.filter((l) => l !== DEFAULT_LOCALE).map((l) => `/${l}/accounts`),
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...accountsPaths, "/api/", "/admin"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
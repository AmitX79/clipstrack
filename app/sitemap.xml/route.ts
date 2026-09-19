import type { Locale } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES, localizedHref } from "@/lib/i18n";

// Static at build time: the whole sitemap is known ahead of every deploy.
export const dynamic = "force-static";

const base = "https://clipstrack.vercel.app";
const lastModified = new Date().toISOString();

function hrefFor(locale: Locale, path: string): string {
  const p = localizedHref(locale, path);
  return p === "/" ? base : `${base}${p}`;
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&apos;";
      default:
        return ch;
    }
  });
}

const PAGES: ReadonlyArray<{ path: string; changeFrequency: string; priority: string }> = [
  { path: "", changeFrequency: "weekly", priority: "1.0" },
  { path: "/faq", changeFrequency: "monthly", priority: "0.6" },
  { path: "/about", changeFrequency: "monthly", priority: "0.5" },
  { path: "/privacy", changeFrequency: "monthly", priority: "0.5" },
  { path: "/terms", changeFrequency: "monthly", priority: "0.5" },
  { path: "/contact", changeFrequency: "monthly", priority: "0.5" },
];

export function GET(): Response {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  for (const locale of LOCALES) {
    for (const page of PAGES) {
      const loc = hrefFor(locale, page.path);
      lines.push("  <url>");
      lines.push(`    <loc>${escapeXml(loc)}</loc>`);
      for (const other of LOCALES) {
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="${other}" href="${escapeXml(hrefFor(other, page.path))}" />`,
        );
      }
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(hrefFor(DEFAULT_LOCALE, page.path))}" />`,
      );
      lines.push(`    <lastmod>${lastModified}</lastmod>`);
      lines.push(`    <changefreq>${page.changeFrequency}</changefreq>`);
      lines.push(`    <priority>${page.priority}</priority>`);
      lines.push("  </url>");
    }
  }

  lines.push("</urlset>");

  return new Response(lines.join("\n") + "\n", {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}
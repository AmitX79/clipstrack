import type { Metadata } from "next";
import {
  DEFAULT_LOCALE,
  LOCALES,
  getDictionary,
  isLocale,
  localizedHref,
  type Locale,
} from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l, localizedHref(l, "")]),
  );
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: localizedHref(locale, ""),
      languages: {
        ...languages,
        "x-default": localizedHref(DEFAULT_LOCALE, ""),
      },
    },
    openGraph: {
      type: "website",
      siteName: "Clips Track",
      url: localizedHref(locale, ""),
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "Clips Track — every view, tracked in full numbers",
        },
      ],
      locale: OG_LOCALES[locale],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
      images: ["/og.png"],
    },
  };
}

const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
  ja: "ja_JP",
  fr: "fr_FR",
  de: "de_DE",
  pt: "pt_BR",
  ko: "ko_KR",
  it: "it_IT",
};

export default function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          // The root <html lang="en"> is a static fallback; correct the
          // document language to the routed locale as soon as this layout
          // parses, before the bulk of the page renders.
          __html: `(function(){try{document.documentElement.lang=${JSON.stringify(locale)};}catch(e){}})();`,
        }}
      />
      {children}
    </>
  );
}
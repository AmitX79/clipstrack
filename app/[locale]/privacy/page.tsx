import type { Metadata } from "next";
import { SubPage } from "@/components/SubPage";
import {
  DEFAULT_LOCALE,
  LOCALES,
  isLocale,
  localizedHref,
} from "@/lib/i18n";
import { getPageContent } from "@/lib/i18n/pages";

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const meta = getPageContent(locale).meta.privacy;
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l, localizedHref(l, "/privacy")]),
  );
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: localizedHref(locale, "/privacy"),
      languages: {
        ...languages,
        "x-default": localizedHref(DEFAULT_LOCALE, "/privacy"),
      },
    },
  };
}

export default function PrivacyPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const content = getPageContent(locale).privacy;

  return (
    <SubPage locale={locale} eyebrow={content.eyebrow} title={content.title} sub={content.intro}>
      {content.sections.map((section) => (
        <section key={section.h} className="max-w-3xl">
          <h2 className="text-xl font-semibold text-ink">{section.h}</h2>
          <p className="mt-2 text-base text-body">{section.p}</p>
        </section>
      ))}
    </SubPage>
  );
}
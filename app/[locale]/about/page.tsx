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
  const meta = getPageContent(locale).meta.about;
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l, localizedHref(l, "/about")]),
  );
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: localizedHref(locale, "/about"),
      languages: {
        ...languages,
        "x-default": localizedHref(DEFAULT_LOCALE, "/about"),
      },
    },
  };
}

export default function AboutPage({ params }: { params: { locale: string } }) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const content = getPageContent(locale);

  return (
    <SubPage
      locale={locale}
      eyebrow={content.about.eyebrow}
      title={content.about.title}
      sub={content.about.intro}
    >
      {content.about.sections.map((section) => (
        <section key={section.h} className="max-w-3xl">
          <h2 className="text-xl font-semibold text-ink">{section.h}</h2>
          <p className="mt-2 text-base text-body">{section.p}</p>
        </section>
      ))}
      <p className="max-w-3xl border-t border-hairline pt-8 text-base text-body">
        {content.about.closing}
      </p>
    </SubPage>
  );
}
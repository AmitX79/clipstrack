import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { SubPage } from "@/components/SubPage";
import {
  DEFAULT_LOCALE,
  LOCALES,
  isLocale,
  localizedHref,
} from "@/lib/i18n";
import { getPageContent } from "@/lib/i18n/pages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const meta = getPageContent(locale).meta.contact;
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l, localizedHref(l, "/contact")]),
  );
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: localizedHref(locale, "/contact"),
      languages: {
        ...languages,
        "x-default": localizedHref(DEFAULT_LOCALE, "/contact"),
      },
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const content = getPageContent(locale);
  const c = content.contact;

  return (
    <SubPage locale={locale} eyebrow={c.eyebrow} title={c.title} sub={c.sub}>
      <div className="max-w-5xl">
        <ContactForm content={content} locale={locale} />
      </div>
      <div className="max-w-3xl border-t border-hairline pt-8">
        <p className="text-sm text-body">
          {c.email}
        </p>
        <a
          href={`mailto:${c.email}`}
          className="mt-1 inline-block text-link hover:text-link-deep"
        >
          {c.email}
        </a>
      </div>
    </SubPage>
  );
}
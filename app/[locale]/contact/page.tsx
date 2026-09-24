import type { Metadata } from "next";
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
      <div className="max-w-3xl rounded-md border border-hairline bg-elevated p-5">
        <p className="text-sm text-body">
          <span className="font-medium text-ink">Email:</span>{" "}
          <a
            href={`mailto:${c.email}`}
            className="text-link underline underline-offset-2 hover:text-link-deep"
          >
            {c.email}
          </a>
        </p>
      </div>
    </SubPage>
  );
}
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import {
  DEFAULT_LOCALE,
  LOCALES,
  getDictionary,
  isLocale,
  localizedHref,
  type Dictionary,
} from "@/lib/i18n";

const FAQ_COUNT = 11;

function buildFaqs(dict: Dictionary): { q: string; a: string }[] {
  return Array.from({ length: FAQ_COUNT }, (_, i) => {
    const n = i + 1;
    return {
      q: dict.faq[`q${n}` as "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7" | "q8" | "q9" | "q10" | "q11"],
      a: dict.faq[`a${n}` as "a1" | "a2" | "a3" | "a4" | "a5" | "a6" | "a7" | "a8" | "a9" | "a10" | "a11"],
    };
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l, localizedHref(l, "/faq")]),
  );
  return {
    title: dict.meta.faqTitle,
    description: dict.meta.faqDescription,
    alternates: {
      canonical: localizedHref(locale, "/faq"),
      languages: {
        ...languages,
        "x-default": localizedHref(DEFAULT_LOCALE, "/faq"),
      },
    },
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const faqs = buildFaqs(dict);

  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-canvas">
      <NavBar active="faq" locale={locale} />
      <main className="mx-auto max-w-6xl px-6 pb-12">
        <section aria-label={dict.faq.title} className="pt-8 md:pt-12">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
          />
          <p className="mono-eyebrow text-mute">{dict.faq.eyebrow}</p>
          <h1 className="display-lg mt-3 text-ink">{dict.faq.title}</h1>
          <p className="mt-3 max-w-2xl text-base text-body">{dict.faq.sub}</p>
          <div className="mt-6 divide-y divide-hairline border-y border-hairline">
            {faqs.map((faq) => (
              <details key={faq.q} className="group">
                <summary className="flex cursor-pointer select-none items-center justify-between gap-4 py-5 text-lg font-medium text-ink hover:text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span
                    aria-hidden="true"
                    className="text-lg leading-none text-mute transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-5 pr-8 text-base text-body">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
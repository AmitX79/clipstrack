import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { getDictionary, isLocale, localizedHref, type Locale } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

function FeatureCard({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-hairline bg-elevated p-6">
      <p className="mono-eyebrow text-faint">{index}</p>
      <h3 className="display-md mt-3 text-ink">{title}</h3>
      <p className="mt-2 text-base text-body">{children}</p>
    </div>
  );
}

function webAppSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Clips Track",
    alternateName: "ClipsTrack",
    url: `${siteUrl()}${localizedHref(locale, "")}`,
    description:
      "A clip tracker for YouTube Shorts, Instagram Reels and TikTok videos. Snapshots views, likes and comments every hour, shown in full numbers, so you can track video views over time.",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    inLanguage: locale,
    keywords:
      "clip tracker, video tracker, YouTube Shorts tracker, Instagram Reels tracker, TikTok video tracker",
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "en";
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-canvas">
      <NavBar active="home" locale={locale} />
      <main className="pb-16">
        {/* Hero — full-bleed (edge-to-edge), no contained/boxed boundary */}
        <section
          aria-label={dict.hero.eyebrow}
          className="relative mb-6 overflow-hidden"
        >
          <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-10 md:pb-16 md:pt-14">
            <p className="mono-eyebrow mono-eyebrow-lg text-mute">
              {dict.hero.eyebrow}
            </p>
            <h1 className="display-2xl mt-4 max-w-3xl text-ink">
              {dict.hero.titleBefore}
              {dict.hero.titleAfter}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-body">
              {dict.hero.subtitleBefore}
              <span className="font-bold text-link">{dict.hero.subtitleAccent}</span>
              {dict.hero.subtitleAfter}
            </p>
            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href={localizedHref(locale, "/accounts#add")}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-ink px-8 text-base font-medium text-on-ink hover:bg-ink-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 sm:w-auto"
              >
                {dict.hero.add}
              </a>
              <a
                href={localizedHref(locale, "/accounts")}
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-hairline bg-elevated px-8 text-base font-medium text-ink hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 sm:w-auto"
              >
                {dict.hero.view}
              </a>
            </div>
            <p className="mono-eyebrow mt-10 text-mute">
              {dict.hero.platforms}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-6">

        {/* What is ClipsTrack */}
        <section id="about" aria-label={dict.about.title} className="scroll-mt-24">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema(locale)) }}
          />
          <p className="mono-eyebrow text-mute">{dict.about.eyebrow}</p>
          <h2 className="display-lg mt-3 text-ink">{dict.about.title}</h2>
          <div className="mt-4 max-w-3xl space-y-4 text-base text-body">
            <p>{dict.about.p1}</p>
            <p>{dict.about.p2}</p>
          </div>
        </section>

        {/* Per-platform rules */}
        <section id="rules" aria-label={dict.rules.title} className="scroll-mt-24 pt-16">
          <p className="mono-eyebrow text-mute">{dict.rules.eyebrow}</p>
          <h2 className="display-lg mt-3 text-ink">{dict.rules.title}</h2>
          <div className="mt-4 space-y-4">
            <FeatureCard index="01" title={dict.rules.ytTitle}>
              {dict.rules.ytBody}
            </FeatureCard>
            <FeatureCard index="02" title={dict.rules.igTitle}>
              {dict.rules.igBody}
            </FeatureCard>
            <FeatureCard index="03" title={dict.rules.ttTitle}>
              {dict.rules.ttBody}
            </FeatureCard>
          </div>
        </section>

        {/* How it works */}
        <section id="how" aria-label={dict.why.title} className="scroll-mt-24 pt-16">
          <p className="mono-eyebrow text-mute">{dict.why.eyebrow}</p>
          <h2 className="display-lg mt-3 text-ink">{dict.why.title}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <FeatureCard index="01" title={dict.why.f1Title}>
              {dict.why.f1Body}
            </FeatureCard>
            <FeatureCard index="02" title={dict.why.f2Title}>
              {dict.why.f2Body}
            </FeatureCard>
            <FeatureCard index="03" title={dict.why.f3Title}>
              {dict.why.f3Body}
            </FeatureCard>
          </div>
          <div className="mt-4 max-w-3xl space-y-4 text-base text-body">
            <p>{dict.why.p1}</p>
            <p>{dict.why.p2}</p>
          </div>
        </section>

        {/* Buckets */}
        <section aria-label={dict.buckets.title} className="pt-16">
          <div className="border-t border-hairline pt-14">
            <p className="mono-eyebrow text-mute">{dict.buckets.eyebrow}</p>
            <h2 className="display-lg mt-3 text-ink">{dict.buckets.title}</h2>
            <div className="mt-4 max-w-3xl space-y-4 text-base text-body">
              <h3 className="display-md text-ink">{dict.buckets.sub1Title}</h3>
              <p>{dict.buckets.sub1Body}</p>
              <h3 className="display-md text-ink">{dict.buckets.sub2Title}</h3>
              <p>{dict.buckets.sub2Body}</p>
              <h3 className="display-md text-ink">{dict.buckets.sub3Title}</h3>
              <p>{dict.buckets.sub3Body}</p>
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section aria-label={dict.cta.title} className="pt-16">
          <div className="border-t border-hairline pt-14 text-center">
            <p className="mono-eyebrow text-mute">{dict.cta.eyebrow}</p>
            <h2 className="display-lg mt-3 text-ink">{dict.cta.title}</h2>
            <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href={localizedHref(locale, "/accounts#add")}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-ink px-8 text-base font-medium text-on-ink hover:bg-ink-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 sm:w-auto"
              >
                {dict.hero.add}
              </a>
              <a
                href={localizedHref(locale, "/accounts")}
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-hairline bg-elevated px-8 text-base font-medium text-ink hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 sm:w-auto"
              >
                {dict.hero.view}
              </a>
            </div>
          </div>
        </section>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
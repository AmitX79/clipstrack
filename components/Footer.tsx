import { FooterLanguageSelect } from "@/components/FooterLanguageSelect";
import { getDictionary, localizedHref, type Locale } from "@/lib/i18n";

const TRACK_LINKS = (locale: Locale) => [
  { href: localizedHref(locale, "/accounts"), key: "trackAccounts" },
  { href: localizedHref(locale, "/accounts#add"), key: "trackAdd" },
] as const;

const PLATFORM_LINKS = (locale: Locale) => [
  { href: localizedHref(locale, "/#rules"), key: "yt" },
  { href: localizedHref(locale, "/#rules"), key: "ig" },
  { href: localizedHref(locale, "/#rules"), key: "tt" },
] as const;

const LEARN_LINKS = (locale: Locale) => [
  { href: localizedHref(locale, "/#how"), key: "learnHow" },
  { href: localizedHref(locale, "/faq"), key: "learnFaq" },
  { href: localizedHref(locale, "/about"), key: "learnAbout" },
] as const;

const LEGAL_LINKS = (locale: Locale) => [
  { href: localizedHref(locale, "/privacy"), key: "privacy" },
  { href: localizedHref(locale, "/terms"), key: "terms" },
  { href: localizedHref(locale, "/contact"), key: "contact" },
] as const;

export function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const linkClass =
    "text-sm text-body transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] lg:gap-8">
          {/* Brand block */}
          <div className="flex flex-col items-start gap-4">
            <a
              href={localizedHref(locale, "")}
              className="flex items-center gap-2 text-base font-medium tracking-[-0.4px] text-ink"
            >
              <img src="/logo.svg" alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
              ClipsTrack
            </a>
            <p className="max-w-xs text-sm text-body">{dict.footer.tagline}</p>
            <FooterLanguageSelect locale={locale} label={dict.footer.lang} />
          </div>

          {/* TRACK */}
          <nav aria-label={dict.footer.trackTitle}>
            <p className="mono-eyebrow text-mute">{dict.footer.trackTitle}</p>
            <ul className="mt-4 space-y-2.5">
              {TRACK_LINKS(locale).map((link) => (
                <li key={link.key}>
                  <a href={link.href} className={linkClass}>
                    {dict.footer[link.key]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* PLATFORMS */}
          <nav aria-label={dict.footer.platformsTitle}>
            <p className="mono-eyebrow text-mute">{dict.footer.platformsTitle}</p>
            <ul className="mt-4 space-y-2.5">
              {PLATFORM_LINKS(locale).map((link) => (
                <li key={link.key}>
                  <a href={link.href} className={linkClass}>
                    {dict.footer[link.key]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* LEARN */}
          <nav aria-label={dict.footer.learnTitle}>
            <p className="mono-eyebrow text-mute">{dict.footer.learnTitle}</p>
            <ul className="mt-4 space-y-2.5">
              {LEARN_LINKS(locale).map((link) => (
                <li key={link.key}>
                  <a href={link.href} className={linkClass}>
                    {dict.footer[link.key]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* LEGAL */}
          <nav aria-label={dict.footer.legalTitle}>
            <p className="mono-eyebrow text-mute">{dict.footer.legalTitle}</p>
            <ul className="mt-4 space-y-2.5">
              {LEGAL_LINKS(locale).map((link) => (
                <li key={link.key}>
                  <a href={link.href} className={linkClass}>
                    {dict.footer[link.key]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline py-6">
          <span className="text-sm text-body">{dict.footer.bottomLeft}</span>
          <span className="mono-eyebrow text-faint">{dict.footer.bottomRight}</span>
        </div>
      </div>
    </footer>
  );
}
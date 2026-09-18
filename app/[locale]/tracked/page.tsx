import type { Metadata } from "next";
import { AddChannelBar } from "@/components/AddChannelBar";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { TrackedAccounts } from "@/components/TrackedAccounts";
import { loadChannels } from "@/lib/channels";
import type { LoadedChannel } from "@/lib/channels";
import {
  DEFAULT_LOCALE,
  LOCALES,
  getDictionary,
  isLocale,
  localizedHref,
} from "@/lib/i18n";
import { getVisitorId } from "@/lib/visitor";

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l, localizedHref(l, "/tracked")]),
  );
  return {
    title: dict.meta.trackedTitle,
    description: dict.meta.trackedDescription,
    robots: { index: false, follow: true },
    alternates: {
      canonical: localizedHref(locale, "/tracked"),
      languages,
    },
  };
}

export default async function TrackedPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const userId = getVisitorId();

  let channels: LoadedChannel[] = [];
  let dbError = false;
  if (userId) {
    try {
      channels = await loadChannels(userId);
    } catch (err) {
      console.error("[tracked] db query failed:", err);
      dbError = true;
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <NavBar active="tracked" locale={locale} />
      <main className="mx-auto max-w-6xl px-6 pb-12">
        <section
          aria-label={dict.acct.eyebrow}
          className="flex flex-wrap items-start justify-between gap-6 pt-8 md:pt-12"
        >
          <div>
            <p className="mono-eyebrow text-mute">
              {dict.acct.eyebrow}
              {channels.length > 0 && (
                <span className="text-faint"> · {channels.length}</span>
              )}
            </p>
            <h1 className="display-lg mt-3 text-ink">{dict.acct.title}</h1>
            <p className="mt-3 max-w-xl text-base text-body">
              {dict.acct.sub}
            </p>
          </div>
        </section>

        <div className="pt-6">
          {dbError && (
            <div
              role="status"
              className="rounded-md border border-warning bg-warning-soft p-4 text-sm text-warning-deep"
            >
              {dict.acct.dbError1}
              <code className="font-mono">DATABASE_URL</code>
              {dict.acct.dbError2}
            </div>
          )}

          <section
            id="add"
            aria-label="Track an account"
            className="scroll-mt-24 rounded-md border border-hairline bg-elevated p-5"
          >
            <AddChannelBar locale={locale} />
          </section>

          {!dbError && <TrackedAccounts channels={channels} locale={locale} />}
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
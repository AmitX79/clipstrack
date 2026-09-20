import type { Metadata } from "next";
import { AddChannelBar } from "@/components/AddChannelBar";
import { CreditsBadge } from "@/components/CreditsBadge";
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
  tpl,
} from "@/lib/i18n";
import { getVisitorId } from "@/lib/visitor";
import { ensureUserCode } from "@/lib/usercode";
import {
  comboHash,
  getClientIp,
  getCreditsStatus,
  type CreditsStatus,
} from "@/lib/credits";

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l, localizedHref(l, "/accounts")]),
  );
  return {
    title: dict.meta.trackedTitle,
    description: dict.meta.trackedDescription,
    robots: { index: false, follow: true },
    alternates: {
      canonical: localizedHref(locale, "/accounts"),
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
  let credits: CreditsStatus | null = null;
  let userCode: string | null = null;
  if (userId) {
    try {
      channels = await loadChannels(userId);
      userCode = await ensureUserCode(userId, comboHash(getClientIp(), userId));
      credits = await getCreditsStatus(comboHash(getClientIp(), userId));
    } catch (err) {
      console.error("[accounts] db query failed:", err);
      dbError = true;
    }
  }
  const exhausted = credits?.remaining != null && credits.remaining <= 0;
  const creditsRemaining = credits?.remaining ?? 0;
  const warnSoon =
    credits != null &&
    !exhausted &&
    credits.limit > 0 &&
    credits.used / credits.limit >= 0.8;

  return (
    <div className="min-h-screen bg-canvas">
      <NavBar active="accounts" locale={locale} />
      <main className="mx-auto max-w-6xl px-6 pb-12">
        <section aria-label={dict.acct.eyebrow} className="pt-8 md:pt-12">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div className="min-w-0">
              <p className="mono-eyebrow text-mute">
                {dict.acct.eyebrow}
                {channels.length > 0 && (
                  <span className="text-faint"> · {channels.length}</span>
                )}
              </p>
              <h1 className="display-lg mt-3 text-ink">{dict.acct.title}</h1>
            </div>
            {(credits || userCode) && (
              <div className="ml-auto flex shrink-0 flex-col items-end gap-2">
                {credits && (
                  <CreditsBadge
                    badge={tpl(dict.credits.badge, {
                      used: credits.used,
                      limit: credits.limit,
                    })}
                    tooltipYt={dict.credits.tooltipYt}
                    tooltipIgtt={tpl(dict.credits.tooltipIgtt, {
                      used: credits.used,
                      limit: credits.limit,
                    })}
                  />
                )}
                {userCode && (
                  <p
                    className="mono-eyebrow select-all text-faint"
                    title="Share this ID so an admin can look up your account"
                  >
                    {tpl(dict.acct.yourId, { id: userCode })}
                  </p>
                )}
              </div>
            )}
          </div>
          <p className="mt-3 max-w-xl text-base text-body">{dict.acct.sub}</p>
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

          {exhausted && (
            <div
              role="status"
              className="mb-4 rounded-md border border-error bg-elevated p-4 text-sm font-medium text-error"
            >
              {dict.credits.limitReached}
            </div>
          )}
          {warnSoon && (
            <div
              role="status"
              className="mb-4 rounded-md border border-warning bg-warning-soft p-4 text-sm text-warning-deep"
            >
              {tpl(dict.credits.left, { left: creditsRemaining })}
            </div>
          )}

          <section
            id="add"
            aria-label="Track an account"
            className="scroll-mt-24 rounded-md border border-hairline bg-elevated p-5"
          >
            <AddChannelBar locale={locale} exhausted={exhausted} />
          </section>

          {!dbError && (
            <TrackedAccounts
              channels={channels}
              locale={locale}
              refreshDisabled={exhausted}
            />
          )}
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
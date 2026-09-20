import Link from "next/link";
import type { ReactNode } from "react";
import { prisma } from "@/lib/db";
import { getDailyLimit, istDateKey } from "@/lib/credits";
import { getYoutubeQuotaStatus } from "@/lib/youtubequota";
import { isAdmin } from "@/lib/admin";
import { adminScrapeKeys, refreshKeyBalances } from "@/lib/scrapekeys";
import { adminLogout } from "./actions";
import { AdminLoginForm } from "./AdminLoginForm";
import { AddKeyForm } from "./AddKeyForm";
import { KeyRow } from "./KeyRow";
import { LimitForm } from "./LimitForm";
import { GrantCredits } from "./GrantCredits";
import { RefreshAllButton } from "./RefreshAllButton";

export const dynamic = "force-dynamic";

const inputClass =
  "h-11 rounded-[6px] border border-hairline px-2.5 text-sm text-ink sm:h-9 " +
  "bg-elevated placeholder:text-faint focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-canvas";

const buttonClass =
  "h-11 rounded-[6px] px-3.5 text-sm font-medium transition-colors sm:h-9 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

function Card({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-hairline bg-elevated p-5">
      <h2 className="mono-eyebrow text-mute">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function AdminPage() {
  if (!isAdmin()) {
    const configured = Boolean(process.env.ADMIN_SECRET);
    return (
      <div className="min-h-screen bg-canvas">
        <main className="mx-auto max-w-md px-6 py-16">
          <p className="mono-eyebrow text-mute">Clips Track admin</p>
          <h1 className="display-md mt-3 text-ink">Sign in</h1>
          <AdminLoginForm
            inputClass={inputClass}
            buttonClass={buttonClass}
            configured={configured}
          />
          <p className="mt-8">
            <Link href="/" className="text-sm text-link hover:text-link-deep">
              Back to the site
            </Link>
          </p>
        </main>
      </div>
    );
  }

  const today = istDateKey();
  const [
    limit,
    creditsTodayAgg,
    totalChannels,
    totalUsers,
    activeCombos,
    keys,
    youtubeQuota,
  ] = await Promise.all([
    getDailyLimit(),
    prisma.creditUsage.aggregate({
      where: { date: today },
      _sum: { creditsUsed: true },
    }),
    prisma.channel.count(),
    prisma.user.count(),
    prisma.creditUsage.groupBy({
      by: ["comboHash"],
      where: { date: today },
    }),
    (async () => {
      try {
        await refreshKeyBalances(false);
      } catch {
        // Balances stay stale but the panel still renders.
      }
      return adminScrapeKeys();
    })(),
    getYoutubeQuotaStatus(),
  ]);
  const creditsToday = creditsTodayAgg._sum.creditsUsed ?? 0;

  return (
    <div className="min-h-screen bg-canvas">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mono-eyebrow text-mute">Clips Track admin</p>
            <h1 className="display-md mt-1 text-ink">Dashboard</h1>
          </div>
          <form action={adminLogout}>
            <button
              type="submit"
              className={`${buttonClass} border border-hairline text-body hover:text-ink`}
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Credits used today">
            <p className="display-md text-ink">{creditsToday}</p>
          </Card>
          <Card title="Active visitors today">
            <p className="display-md text-ink">{activeCombos.length}</p>
          </Card>
          <Card title="Channels tracked">
            <p className="display-md text-ink">{totalChannels}</p>
          </Card>
          <Card title="Total users">
            <p className="display-md text-ink">{totalUsers}</p>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card title="Daily per-visitor credit limit (Instagram/TikTok)">
            <LimitForm initialLimit={limit} />
            <p className="mt-3 text-xs text-faint">
              Applies to Instagram/TikTok syncs only - YouTube uses its own
              official API quota. Read by the hourly sync and the request-time
              syncs; resets at midnight IST.
            </p>
          </Card>

          <Card title="YouTube data API quota today">
            <p className="display-md text-ink">
              {youtubeQuota.used}
              <span className="ml-1 text-sm font-normal text-mute">
                / {youtubeQuota.limit} units
              </span>
            </p>
            <p className="mt-3 text-xs text-faint">
              Official YouTube Data API v3 budget (channels.list,
              playlistItems.list and videos.list each cost 1 unit). YouTube
              syncs never touch the per-visitor ScrapeCreators credit limit.
            </p>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card title="ScrapeCreators API keys">
            <div className="flex flex-col gap-2">
              {keys.length === 0 ? (
                <p className="text-sm text-mute">
                  No keys yet - one is seeded from SCRAPECREATORS_API_KEY on
                  first use.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-hairline">
                  {keys.map((key) => (
                    <KeyRow
                      key={key.id}
                      item={{
                        id: key.id,
                        label: key.label,
                        keyMasked: key.keyMasked,
                        active: key.active,
                        quotaExhausted: key.quotaExhausted,
                        remainingCredits: key.remainingCredits,
                        lastCheckedAt: key.lastCheckedAt
                          ? key.lastCheckedAt.toISOString()
                          : null,
                        createdAt: key.createdAt.toISOString(),
                      }}
                    />
                  ))}
                </ul>
              )}
              <RefreshAllButton />
            </div>
          </Card>

          <Card title="Add ScrapeCreators API key">
            <AddKeyForm />
            <p className="mt-3 text-xs text-faint">
              Keys are stored server-side and rotate automatically when one
              runs out of credits.
            </p>
          </Card>
        </div>

        <div className="mt-4 grid gap-4">
          <Card title="Grant credits to a visitor">
            <GrantCredits />
            <p className="mt-3 text-xs text-faint">
              Search by the short User ID shown on a visitor&apos;s /accounts
              page (&quot;Your ID: CT-X7K9P2&quot;). A bonus top-up is one-time
              - it only kicks in after their daily allowance is used (and
              resets with the daily allowance). An override replaces the global
              daily credit limit for just that visitor; leave it blank to clear
              it.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
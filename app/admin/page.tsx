import Link from "next/link";
import type { ReactNode } from "react";
import { prisma } from "@/lib/db";
import { getDailyLimit, istDateKey } from "@/lib/credits";
import { isAdmin } from "@/lib/admin";
import { adminScrapeKeys, refreshKeyBalances } from "@/lib/scrapekeys";
import {
  addScrapeKey,
  adminLogout,
  refreshBalancesNow,
  removeScrapeKey,
  toggleScrapeKey,
  updateDailyLimit,
} from "./actions";
import { AdminLoginForm } from "./AdminLoginForm";

export const dynamic = "force-dynamic";

const inputClass =
  "h-9 rounded-[6px] border border-hairline px-2.5 text-sm text-ink " +
  "bg-elevated placeholder:text-faint focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-canvas";

const buttonClass =
  "h-9 rounded-[6px] px-3.5 text-sm font-medium transition-colors " +
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
  const [limit, creditsTodayAgg, totalChannels, totalUsers, activeCombos, keys] =
    await Promise.all([
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
          <Card title="Daily per-visitor credit limit">
            <form action={updateDailyLimit} className="flex items-end gap-2">
              <label htmlFor="limit" className="flex flex-1 flex-col gap-1">
                <span className="mono-eyebrow text-mute">Credits per day</span>
                <input
                  id="limit"
                  name="limit"
                  type="number"
                  min={1}
                  max={1000000}
                  step={1}
                  defaultValue={limit}
                  className={`${inputClass} w-full`}
                />
              </label>
              <button
                type="submit"
                className={`${buttonClass} bg-ink text-on-ink hover:bg-ink-press`}
              >
                Save
              </button>
            </form>
            <p className="mt-3 text-xs text-faint">
              Read by the hourly sync and the request-time syncs; resets at
              midnight IST.
            </p>
          </Card>

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
                    <li
                      key={key.id}
                      className="flex flex-wrap items-center gap-2 py-2 text-sm"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="font-medium text-ink">{key.label}</span>
                        <span className="ml-2 font-mono text-xs text-faint">
                          {key.keyMasked}
                        </span>
                      </span>
                      <span
                        className={`mono-eyebrow text-xs tabular-nums ${
                          key.remainingCredits == null
                            ? "text-faint"
                            : key.quotaExhausted
                              ? "text-error"
                              : "text-body"
                        }`}
                      >
                        {key.remainingCredits == null
                          ? "balance unknown"
                          : `${key.remainingCredits} credits`}
                      </span>
                      <form action={toggleScrapeKey} className="inline">
                        <input type="hidden" name="id" value={key.id} />
                        <button
                          type="submit"
                          className="text-xs font-medium text-link hover:text-link-deep"
                        >
                          {key.active ? "Disable" : "Enable"}
                        </button>
                      </form>
                      <form action={removeScrapeKey} className="inline">
                        <input type="hidden" name="id" value={key.id} />
                        <button
                          type="submit"
                          className="text-xs font-medium text-error hover:text-error-deep"
                        >
                          Remove
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
              <form action={refreshBalancesNow}>
                <button
                  type="submit"
                  className={`${buttonClass} border border-hairline text-body hover:text-ink`}
                >
                  Refresh balances
                </button>
              </form>
            </div>
          </Card>
        </div>

        <div className="mt-4">
          <Card title="Add ScrapeCreators API key">
            <form action={addScrapeKey} className="flex flex-wrap items-end gap-3">
              <label htmlFor="label" className="flex flex-1 flex-col gap-1">
                <span className="mono-eyebrow text-mute">Label</span>
                <input
                  id="label"
                  name="label"
                  type="text"
                  placeholder="e.g. work, backup"
                  maxLength={60}
                  required
                  className={`${inputClass} w-full`}
                />
              </label>
              <label htmlFor="key" className="flex flex-[2] flex-col gap-1">
                <span className="mono-eyebrow text-mute">API key</span>
                <input
                  id="key"
                  name="key"
                  type="password"
                  autoComplete="off"
                  placeholder="x-api-key from ScrapeCreators"
                  minLength={8}
                  required
                  className={`${inputClass} w-full`}
                />
              </label>
              <button
                type="submit"
                className={`${buttonClass} bg-ink text-on-ink hover:bg-ink-press`}
              >
                Add key
              </button>
            </form>
            <p className="mt-3 text-xs text-faint">
              Keys are stored server-side and rotate automatically when one
              runs out of credits.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
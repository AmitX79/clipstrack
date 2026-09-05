import Link from "next/link";
import { AccountSearch } from "@/components/AccountSearch";
import { ChannelCard } from "@/components/ChannelCard";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { loadAllChannels } from "@/lib/channels";
import type { LoadedChannel } from "@/lib/channels";
import { PLATFORM_LABELS, PLATFORM_VALUES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();

  let all: LoadedChannel[] = [];
  let dbError = false;
  try {
    all = await loadAllChannels();
  } catch (err) {
    console.error("[accounts] db query failed:", err);
    dbError = true;
  }

  const channels = (query
    ? all.filter(
        (channel) =>
          channel.username.toLowerCase().includes(query) ||
          (channel.displayName ?? "").toLowerCase().includes(query),
      )
    : all
  ).sort(
    (a, b) =>
      a.username.localeCompare(b.username) || a.id.localeCompare(b.id),
  );

  const breakdown = PLATFORM_VALUES.map((platform) => ({
    platform,
    count: all.filter((channel) => channel.platform === platform).length,
  }));

  return (
    <div className="min-h-screen bg-canvas">
      <NavBar active="accounts" />
      <main className="mx-auto max-w-6xl px-6 pb-16">
        <section
          aria-label="All accounts"
          className="flex flex-wrap items-start justify-between gap-6 pt-10 md:pt-16"
        >
          <div>
            <p className="mono-eyebrow text-mute">
              All accounts
              {all.length > 0 && (
                <span className="text-faint"> · {all.length}</span>
              )}
            </p>
            <h1 className="display-lg mt-3 text-ink">
              Every tracked account.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-body">
              Worldwide directory of every handle ClipsTrack is watching —
              sorted A–Z, with the latest numbers and sync time for each.
            </p>
          </div>
        </section>

        {dbError && (
          <div
            role="status"
            className="mt-8 rounded-md border border-warning bg-warning-soft p-4 text-sm text-warning-deep"
          >
            Can’t reach the database — check that{" "}
            <code className="font-mono">DATABASE_URL</code> points to a running
            Postgres, then reload.
          </div>
        )}

        {!dbError && (
          <>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <AccountSearch defaultValue={q ?? ""} />
              <p className="mono-eyebrow text-mute">
                {channels.length}
                <span className="text-faint"> shown</span>
              </p>
            </div>

            <p className="mono-eyebrow mt-3 text-faint">
              {breakdown
                .map(
                  ({ platform, count }) =>
                    `${PLATFORM_LABELS[platform]} ${count}`,
                )
                .join(" · ")}
            </p>

            {all.length === 0 ? (
              <div className="mt-4 rounded-md border border-hairline bg-elevated px-6 py-14 text-center">
                <p className="mono-eyebrow text-mute">No accounts yet</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-body">
                  Add the first handle from the{" "}
                  <Link href="/#add" className="text-link hover:text-link-deep">
                    dashboard
                  </Link>{" "}
                  — it will appear here once tracked.
                </p>
              </div>
            ) : channels.length === 0 ? (
              <div className="mt-4 rounded-md border border-hairline bg-elevated px-6 py-14 text-center">
                <p className="mono-eyebrow text-mute">No matches</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-body">
                  Nothing found for “{query}” — try another name.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {channels.map((channel) => (
                  <ChannelCard key={channel.id} channel={channel} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
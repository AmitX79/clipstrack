import Link from "next/link";
import { ChannelGroupSection } from "@/components/ChannelCard";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { GROUP_ORDER, loadChannels } from "@/lib/channels";
import type { LoadedChannel } from "@/lib/channels";
import { getVisitorId } from "@/lib/visitor";

export const dynamic = "force-dynamic";

export default async function TrackedPage() {
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

  const groups = GROUP_ORDER.map((platform) => ({
    platform,
    channels: channels.filter((c) => c.platform === platform),
  })).filter((group) => group.channels.length > 0);

  return (
    <div className="min-h-screen bg-canvas">
      <NavBar active="tracked" />
      <main className="mx-auto max-w-6xl px-6 pb-16">
        <section
          aria-label="Tracked accounts"
          className="flex flex-wrap items-start justify-between gap-6 pt-10 md:pt-16"
        >
          <div>
            <p className="mono-eyebrow text-mute">
              Tracked accounts
              {channels.length > 0 && (
                <span className="text-faint"> · {channels.length}</span>
              )}
            </p>
            <h1 className="display-lg mt-3 text-ink">
              Accounts you&apos;re following.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-body">
              Every tracked handle, grouped by platform. Numbers update on the
              hour — always shown in full, never abbreviated.
            </p>
          </div>
          <Link
            href="/#add"
            className="inline-flex h-10 items-center rounded-full border border-hairline bg-elevated px-5 text-sm font-medium text-ink hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            Add another
          </Link>
        </section>

        <div className="pt-8">
          {dbError && (
            <div
              role="status"
              className="rounded-md border border-warning bg-warning-soft p-4 text-sm text-warning-deep"
            >
              Can’t reach the database — check that{" "}
              <code className="font-mono">DATABASE_URL</code> points to a
              running Postgres, then reload.
            </div>
          )}

          {!dbError && groups.length === 0 && (
            <div className="rounded-md border border-hairline bg-elevated px-6 py-14 text-center">
              <p className="mono-eyebrow text-mute">No accounts yet</p>
              <h2 className="display-md mt-3 text-ink">
                Your tracked accounts will appear here.
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-body">
                Add the first handle{" "}
                <Link href="/#add" className="text-link hover:text-link-deep">
                  here
                </Link>{" "}
                — stats start appearing after the first sync.
              </p>
            </div>
          )}

          {groups.map((group) => (
            <ChannelGroupSection
              key={group.platform}
              platform={group.platform}
              channels={group.channels}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
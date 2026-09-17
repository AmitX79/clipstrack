import Link from "next/link";
import { AddChannelBar } from "@/components/AddChannelBar";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { TrackedAccounts } from "@/components/TrackedAccounts";
import { loadChannels } from "@/lib/channels";
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

  return (
    <div className="min-h-screen bg-canvas">
      <NavBar active="tracked" />
      <main className="mx-auto w-full max-w-[1400px] px-6 pb-12">
        <section
          aria-label="My Accounts"
          className="flex flex-wrap items-start justify-between gap-6 pt-8 md:pt-12"
        >
          <div>
            <p className="mono-eyebrow text-mute">
              My Accounts
              {channels.length > 0 && (
                <span className="text-faint"> · {channels.length}</span>
              )}
            </p>
            <h1 className="display-lg mt-3 text-ink">
              The handles you track.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-body">
              Your tracked accounts — private to you. Video stats update on the
              hour, always shown in full, never abbreviated.
            </p>
          </div>
          <Link
            href="#add"
            className="inline-flex h-10 items-center rounded-full border border-hairline bg-elevated px-5 text-sm font-medium text-ink hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            Add another
          </Link>
        </section>

        <div className="pt-6">
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

          <section
            id="add"
            aria-label="Track an account"
            className="scroll-mt-24 rounded-md border border-hairline bg-elevated p-5"
          >
            <AddChannelBar />
          </section>

          {!dbError && <TrackedAccounts channels={channels} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
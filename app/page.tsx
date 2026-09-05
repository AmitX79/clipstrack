import { AddChannelForm } from "@/components/AddChannelForm";
import { prisma } from "@/lib/db";
import { formatFullNumber, formatLastSynced } from "@/lib/format";
import { PLATFORM_LABELS, PLATFORM_VALUES } from "@/lib/types";
import { getVisitorId } from "@/lib/visitor";

export const dynamic = "force-dynamic";

const GROUP_ORDER = PLATFORM_VALUES;

const CHANNEL_INCLUDE = {
  snapshots: { orderBy: { recordedAt: "desc" as const }, take: 1 },
  videos: {
    orderBy: { publishedAt: "desc" as const },
    take: 5,
    include: { snapshots: { orderBy: { recordedAt: "desc" as const }, take: 1 } },
  },
} as const;

async function loadChannels(userId: string) {
  return prisma.channel.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: CHANNEL_INCLUDE,
  });
}

type LoadedChannel = Awaited<ReturnType<typeof loadChannels>>[number];

function initials(name: string): string {
  const clean = name.trim();
  return (clean[0] ?? "?").toUpperCase();
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full bg-hairline-soft text-sm font-medium text-mute"
    >
      {initials(name)}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="mono-eyebrow text-mute">{label}</dt>
      <dd className="mt-1 truncate text-xl font-semibold tracking-[-0.4px] text-ink tabular-nums">
        {value}
      </dd>
    </div>
  );
}

function VideoRow({
  title,
  views,
  likes,
  comments,
}: {
  title: string | null;
  views: bigint;
  likes: number;
  comments: number;
}) {
  return (
    <li className="flex items-center gap-3 py-2.5 text-sm">
      <span
        className="min-w-0 flex-1 truncate text-body"
        title={title ?? undefined}
      >
        {title ?? "Untitled"}
      </span>
      <span className="shrink-0 font-mono text-xs tabular-nums text-mute">
        {formatFullNumber(views)} views · {formatFullNumber(likes)} ·{" "}
        {formatFullNumber(comments)}
      </span>
    </li>
  );
}

function ChannelCard({ channel }: { channel: LoadedChannel }) {
  const snapshot = channel.snapshots[0];
  const synced = channel.lastSyncedAt ? formatLastSynced(channel.lastSyncedAt) : null;
  const fresh =
    channel.lastSyncedAt &&
    Date.now() - channel.lastSyncedAt.getTime() < 36 * 60 * 60 * 1000;

  return (
    <article className="rounded-md border border-hairline bg-elevated p-6 shadow-[0px_1px_1px_rgba(0,0,0,0.04)]">
      <div className="flex items-start gap-3">
        <Avatar name={channel.displayName ?? channel.username} />
        <div className="min-w-0 flex-1">
          <h3 className="display-md truncate text-ink">
            {channel.displayName ?? channel.username}
          </h3>
          <p className="truncate text-sm text-mute">@{channel.username}</p>
        </div>
        <span className="mono-eyebrow shrink-0 rounded-[64px] border border-hairline px-3 py-1 text-mute">
          {PLATFORM_LABELS[channel.platform]}
        </span>
      </div>

      {snapshot ? (
        <dl className="mt-6 grid grid-cols-3 gap-4">
          <Stat label="Followers" value={formatFullNumber(snapshot.followers)} />
          <Stat label="Posts" value={formatFullNumber(snapshot.totalPosts)} />
          <Stat
            label="Views"
            value={
              snapshot.totalViews == null
                ? "—"
                : formatFullNumber(snapshot.totalViews)
            }
          />
        </dl>
      ) : (
        <p className="mt-6 text-sm text-mute">
          No stats collected yet — waiting for the first sync.
        </p>
      )}

      {channel.videos.length > 0 && (
        <ul className="mt-4 divide-y divide-hairline border-t border-hairline">
          {channel.videos.map((video) => {
            const s = video.snapshots[0];
            if (!s) return null;
            return (
              <VideoRow
                key={video.id}
                title={video.title}
                views={s.views}
                likes={s.likes}
                comments={s.comments}
              />
            );
          })}
        </ul>
      )}

      <p className="mt-5 flex items-center gap-2 text-xs text-mute">
        {fresh && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-link" />}
        {synced ? `Synced ${synced}` : "Not synced yet"}
      </p>
    </article>
  );
}

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
      <p className="mt-2 text-sm leading-relaxed text-body">{children}</p>
    </div>
  );
}

function GroupSection({
  platform,
  channels,
}: {
  platform: (typeof GROUP_ORDER)[number];
  channels: LoadedChannel[];
}) {
  return (
    <section aria-labelledby={`group-${platform}`} className="mt-6">
      <h2
        id={`group-${platform}`}
        className="flex items-baseline gap-2 scroll-mt-24"
      >
        <span className="mono-eyebrow text-mute">{PLATFORM_LABELS[platform]}</span>
        <span className="text-xs tabular-nums text-faint">
          {channels.length}
        </span>
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const userId = getVisitorId();

  let channels: LoadedChannel[] = [];
  let dbError = false;
  if (userId) {
    try {
      channels = await loadChannels(userId);
    } catch (err) {
      console.error("[page] db query failed:", err);
      dbError = true;
    }
  }

  const groups = GROUP_ORDER.map((platform) => ({
    platform,
    channels: channels.filter((c) => c.platform === platform),
  })).filter((group) => group.channels.length > 0);

  const navLinks = [
    { href: "#how", label: "How it works" },
    { href: "#accounts", label: "Tracked accounts" },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-hairline bg-canvas">
        <nav
          className="mx-auto flex h-12 max-w-6xl items-center gap-4 px-6"
          aria-label="Primary"
        >
          <a href="#top" className="text-base font-semibold tracking-[-0.4px] text-ink">
            ClipsTrack
          </a>
          <div className="ml-auto hidden items-center gap-1 sm:flex">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="rounded-full px-3 py-1.5 text-sm text-body hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
              >
                {label}
              </a>
            ))}
          </div>
          <a
            href="#add"
            className="rounded-[6px] bg-ink px-3.5 py-2 text-sm font-medium text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
          >
            Add channel
          </a>
        </nav>
      </header>

      <main id="top" className="mx-auto max-w-6xl px-6 pb-16">
        {/* Hero */}
        <section
          aria-label="Intro"
          className="relative -mx-6 mb-10 overflow-hidden px-6 py-16 md:py-24"
        >
          <div aria-hidden="true" className="hero-mesh pointer-events-none absolute inset-0" />
          <div className="relative">
            <p className="mono-eyebrow text-mute">Multi-platform tracker</p>
            <h1 className="display-2xl mt-4 max-w-2xl text-ink">
              Every view, tracked.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-body">
              Add a YouTube, Instagram or TikTok handle. ClipsTrack snapshots
              its followers, posts and total views every hour — shown in
              full, never abbreviated.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#add"
                className="h-11 rounded-full bg-ink px-7 text-base font-medium text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
              >
                Add a channel
              </a>
              <a
                href="#how"
                className="h-11 rounded-full border border-hairline bg-elevated px-7 text-base font-medium text-ink hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
              >
                How it works
              </a>
            </div>
            <p className="mono-eyebrow mt-10 text-mute">
              YouTube&nbsp;&nbsp;·&nbsp;&nbsp;Instagram&nbsp;&nbsp;·&nbsp;&nbsp;TikTok
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how" aria-label="How it works" className="scroll-mt-24">
          <p className="mono-eyebrow text-mute">Why ClipsTrack</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <FeatureCard index="01" title="Hourly snapshots">
              A background job captures stats on the hour, so you can watch a
              channel climb — day by day, full number by full number.
            </FeatureCard>
            <FeatureCard index="02" title="Full numbers">
              No 1.2M or 400K guesses. Followers, views, likes and comments are
              stored and shown at their exact value.
            </FeatureCard>
            <FeatureCard index="03" title="Multi-platform">
              YouTube, Instagram and TikTok in one place, grouped per platform
              under a single set of cards and charts-ready time series.
            </FeatureCard>
          </div>
        </section>

        {/* Add channel */}
        <section
          id="add"
          aria-label="Track an account"
          className="scroll-mt-24 pt-16"
        >
          <div className="grid items-start gap-8 md:grid-cols-2">
            <div>
              <p className="mono-eyebrow text-mute">Track an account</p>
              <h2 className="display-lg mt-3 text-ink">
                Add a handle to get started.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-body">
                Pick the platform, enter a username, and the first sync starts
                immediately. New numbers are collected hourly after that.
              </p>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-body">
                <li className="flex gap-3">
                  <span aria-hidden="true" className="mt-0.5 text-link">→</span>
                  Everyone only ever sees their own tracked accounts.
                </li>
                <li className="flex gap-3">
                  <span aria-hidden="true" className="mt-0.5 text-link">→</span>
                  Re-adding a handle updates it instead of duplicating.
                </li>
                <li className="flex gap-3">
                  <span aria-hidden="true" className="mt-0.5 text-link">→</span>
                  Not synced yet? It stays queued for the next hourly run.
                </li>
              </ul>
            </div>
            <div className="rounded-md border border-hairline bg-elevated p-6 shadow-[0px_1px_1px_rgba(0,0,0,0.04)]">
              <AddChannelForm />
            </div>
          </div>
        </section>

        {/* Tracked accounts */}
        <section
          id="accounts"
          aria-label="Tracked accounts"
          className="scroll-mt-24 pt-16"
        >
          <p className="mono-eyebrow text-mute">
            Tracked accounts
            {channels.length > 0 && (
              <span className="text-faint"> · {channels.length}</span>
            )}
          </p>

          {dbError && (
            <div
              role="status"
              className="mt-4 rounded-md border border-warning bg-warning-soft p-4 text-sm text-warning-deep"
            >
              Can’t reach the database — check that{" "}
              <code className="font-mono">DATABASE_URL</code> points to a
              running Postgres, then reload.
            </div>
          )}

          {!dbError && groups.length === 0 && (
            <div className="mt-4 rounded-md border border-hairline bg-elevated px-6 py-14 text-center">
              <p className="mono-eyebrow text-mute">No accounts yet</p>
              <h3 className="display-md mt-3 text-ink">
                Your tracked accounts will appear here.
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-body">
                Add the first handle{" "}
                <a href="#add" className="text-link hover:text-link-deep">
                  above
                </a>{" "}
                — stats start appearing after the first sync.
              </p>
            </div>
          )}

          {groups.map((group) => (
            <GroupSection
              key={group.platform}
              platform={group.platform}
              channels={group.channels}
            />
          ))}
        </section>

        {/* CTA band */}
        <section aria-label="Start tracking" className="pt-16">
          <div className="border-t border-hairline pt-14 text-center">
            <p className="mono-eyebrow text-mute">Ready when you are</p>
            <h2 className="display-lg mt-3 text-ink">Start tracking.</h2>
            <a
              href="#add"
              className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-7 text-base font-medium text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
            >
              Add a channel
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-16">
          <span className="text-sm text-body">
            <span className="font-semibold text-ink">ClipsTrack</span> — numbers
            always shown in full.
          </span>
          <span className="mono-eyebrow text-faint">
            Self-hosted · YouTube · Instagram · TikTok
          </span>
        </div>
      </footer>
    </div>
  );
}
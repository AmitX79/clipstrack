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
      <dd className="mt-0.5 truncate font-medium text-ink tabular-nums">
        {value}
      </dd>
    </div>
  );
}

function RecentVideos({ channel }: { channel: LoadedChannel }) {
  if (channel.videos.length === 0) return null;

  return (
    <ul className="mt-4 divide-y divide-hairline border-t border-hairline">
      {channel.videos.map((video) => {
        const snapshot = video.snapshots[0];
        return (
          <li
            key={video.id}
            className="flex items-center gap-3 py-2.5 text-sm"
          >
            <span className="min-w-0 flex-1 truncate text-body" title={video.title ?? undefined}>
              {video.title ?? "Untitled"}
            </span>
            {snapshot && (
              <span className="shrink-0 font-mono text-xs tabular-nums text-mute">
                {formatFullNumber(snapshot.views)} views ·{" "}
                {formatFullNumber(snapshot.likes)} ·{" "}
                {formatFullNumber(snapshot.comments)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ChannelCard({ channel }: { channel: LoadedChannel }) {
  const snapshot = channel.snapshots[0];
  const synced = channel.lastSyncedAt ? formatLastSynced(channel.lastSyncedAt) : null;

  return (
    <article className="rounded-[12px] border border-hairline bg-elevated p-6">
      <div className="flex items-start gap-3">
        <Avatar name={channel.displayName ?? channel.username} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-ink">
            {channel.displayName ?? channel.username}
          </h3>
          <p className="truncate text-sm text-mute">@{channel.username}</p>
        </div>
        <span className="mono-eyebrow shrink-0 rounded-[64px] border border-hairline px-3 py-1 text-mute">
          {PLATFORM_LABELS[channel.platform]}
        </span>
      </div>

      {snapshot ? (
        <dl className="mt-5 grid grid-cols-3 gap-4">
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
        <p className="mt-5 text-sm text-mute">
          No stats collected yet — waiting for the first sync.
        </p>
      )}

      <RecentVideos channel={channel} />

      <p className="mt-4 text-xs text-mute">
        {synced ? `Synced ${synced}` : "Not synced yet"}
      </p>
    </article>
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
    <section aria-labelledby={`group-${platform}`}>
      <h2
        id={`group-${platform}`}
        className="flex items-baseline gap-2 scroll-mt-24 border-t border-hairline pt-8"
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

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-hairline bg-canvas">
        <nav
          className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3"
          aria-label="Primary"
        >
          <span className="text-base font-semibold tracking-tight text-ink">
            ClipsTrack
          </span>
          <span className="mono-eyebrow text-mute">
            Multi-platform tracker
          </span>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <section className="py-10 md:py-14">
          <p className="mono-eyebrow text-mute">
            YouTube · Instagram · TikTok
          </p>
          <h1 className="display-tight mt-3 max-w-xl text-3xl font-semibold leading-tight text-ink md:text-4xl">
            Every view, tracked.
          </h1>
          <p className="mt-3 max-w-lg text-base leading-relaxed text-body">
            Add a handle and ClipsTrack snapshots its followers, views, likes
            and comments every hour — displayed in full, never abbreviated.
          </p>
        </section>

        <section aria-label="Add a channel">
          <div className="rounded-[12px] border border-hairline bg-elevated p-6">
            <AddChannelForm />
          </div>
        </section>

        {dbError && (
          <section
            role="status"
            className="mt-6 rounded-[12px] border border-warning bg-warning-soft p-4 text-sm text-warning-deep"
          >
            Can’t reach the database — check that{" "}
            <code className="font-mono">DATABASE_URL</code> points to a running
            Postgres, then reload.
          </section>
        )}

        {!dbError && groups.length === 0 && (
          <section className="mt-6 rounded-[12px] border border-hairline bg-elevated px-6 py-12 text-center">
            <p className="mono-eyebrow text-mute">No channels yet</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
              Track your first account.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-body">
              Pick a platform and add a username above. Stats start appearing
              after the first sync.
            </p>
          </section>
        )}

        {groups.map((group) => (
          <div key={group.platform} className="mt-6">
            <GroupSection platform={group.platform} channels={group.channels} />
          </div>
        ))}
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-6">
          <span className="text-xs text-mute">
            ClipsTrack — numbers always shown in full.
          </span>
          <span className="mono-eyebrow text-faint">Self-hosted</span>
        </div>
      </footer>
    </div>
  );
}
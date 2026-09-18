"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { editChannel, refreshChannel, removeChannel } from "@/app/actions";
import {
  formatFullNumber,
  formatGrowthPerHour,
  formatLikeRatio,
  formatRelativeCompact,
} from "@/lib/format";
import { PLATFORM_LABELS } from "@/lib/types";
import { PlatformLogoBadge } from "@/components/PlatformLogo";

// Channel avatar with a graceful fallback: when the profile image is missing
// or fails to load (e.g. expired CDN signature), show the platform's brand
// logo instead of a broken image.
function ChannelAvatar({ channel }: { channel: LoadedChannel }) {
  const [failed, setFailed] = useState(false);
  if (!channel.avatarUrl || failed) {
    return <PlatformLogoBadge platform={channel.platform} className="h-10 w-10" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={channel.avatarUrl}
      alt=""
      onError={() => setFailed(true)}
      className="h-10 w-10 shrink-0 rounded-full object-cover"
    />
  );
}
import { sortVideos } from "@/lib/sort";
import type { SortKey } from "@/lib/sort";
import type { LoadedChannel, LoadedVideo } from "@/lib/channels";
import type { PlatformValue } from "@/lib/types";

// Per-channel management buttons (Refresh / Edit / Remove). State is local to
// each card; the Edit button toggles a small count-config form.
function ChannelActions({
  channel,
  onEditToggle,
}: {
  channel: LoadedChannel;
  onEditToggle: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"refresh" | "edit" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(
    key: "refresh" | "edit" | "remove",
    action: () => Promise<
      { ok: true; channel: string } | { ok: false; error: string }
    >,
  ) {
    setError(null);
    setBusy(key);
    startTransition(async () => {
      const result = await action();
      setBusy(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function onRemove() {
    if (!window.confirm(`Remove @${channel.username} and its video history?`)) {
      return;
    }
    run("remove", () => removeChannel(channel.id));
  }

  const disabled = isPending || busy !== null;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={() => run("refresh", () => refreshChannel(channel.id))}
          disabled={disabled}
          aria-label={`Refresh @${channel.username}`}
          className={
            "inline-flex h-7 items-center gap-1.5 rounded-[6px] border border-hairline px-2.5 text-xs font-medium text-body " +
            "hover:border-ink hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-elevated disabled:opacity-50"
          }
        >
          {busy === "refresh" ? (
            <Spinner label="Syncing…" />
          ) : (
            "Refresh"
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setError(null);
            onEditToggle();
          }}
          disabled={disabled}
          aria-label={`Edit @${channel.username} video settings`}
          className="inline-flex h-7 items-center rounded-[6px] border border-hairline px-2.5 text-xs font-medium text-body hover:border-ink hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-elevated disabled:opacity-50"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove @${channel.username}`}
          className="inline-flex h-7 items-center rounded-[6px] border border-hairline px-2.5 text-xs font-medium text-error hover:border-error hover:text-error-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:ring-offset-elevated disabled:opacity-50"
        >
          Remove
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          className="opacity-30"
        />
        <path
          d="M22 12a10 10 0 0 0-10-10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      {label}
    </span>
  );
}

function EditPanel({
  channel,
  onSaved,
  onCancel,
}: {
  channel: LoadedChannel;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const oldVideoCount = Number(data.get("oldVideoCount") ?? "");
    const latestVideoCount = Number(data.get("latestVideoCount") ?? "");
    if (
      !Number.isFinite(oldVideoCount) ||
      !Number.isFinite(latestVideoCount) ||
      oldVideoCount < 0 ||
      latestVideoCount < 0
    ) {
      setError("Counts must be whole numbers between 0 and 200.");
      return;
    }
    startTransition(async () => {
      const result = await editChannel(channel.id, {
        oldVideoCount: Math.min(Math.round(oldVideoCount), 200),
        latestVideoCount: Math.min(Math.round(latestVideoCount), 200),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved();
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-4 flex flex-wrap items-end gap-3 rounded-[6px] border border-hairline p-3"
    >
      <Field
        name="oldVideoCount"
        label="Old videos count"
        hint="Most recent videos to backfill once"
        defaultValue={channel.oldVideoCount}
      />
      <Field
        name="latestVideoCount"
        label="Latest videos count"
        hint="Newest uploads to track going forward"
        defaultValue={channel.latestVideoCount}
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="h-8 rounded-[6px] bg-ink px-3 text-xs font-medium text-white hover:bg-black disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="h-8 rounded-[6px] border border-hairline px-3 text-xs font-medium text-body hover:text-ink disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
      {error && <p className="w-full text-xs text-error">{error}</p>}
    </form>
  );
}

function Field({
  name,
  label,
  hint,
  defaultValue,
}: {
  name: string;
  label: string;
  hint: string;
  defaultValue: number;
}) {
  return (
    <label htmlFor={name} className="flex min-w-[120px] flex-1 flex-col gap-1">
      <span className="mono-eyebrow text-mute">{label}</span>
      <input
        id={name}
        name={name}
        type="number"
        min={0}
        max={200}
        step={1}
        inputMode="numeric"
        defaultValue={defaultValue}
        required
        aria-describedby={`${name}-hint`}
        className="h-8 w-full rounded-[6px] border border-hairline bg-elevated px-2.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-elevated focus-visible:border-link"
      />
      <span id={`${name}-hint`} className="text-xs text-faint">
        {hint}
      </span>
    </label>
  );
}

// Relative times ("3m ago") derive from the current clock, so computing them
// during SSR yields text that can differ from the client's by exactly one
// boundary tick. Return the current clock only after hydration and re-render
// every 30s (`tick`) to keep the strings fresh without a hydration mismatch.
function useNow(): number | null {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setMounted(true);
    const id = window.setInterval(() => setTick((value) => value + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);
  void tick;
  return mounted ? Date.now() : null;
}

export function ChannelCard({
  channel,
  sortBy,
}: {
  channel: LoadedChannel;
  sortBy: SortKey;
}) {
  const [editing, setEditing] = useState(false);
  const now = useNow();
  const name = channel.displayName ?? channel.username;
  const latest = channel.videos.filter((video) => !video.isBackfill);
  const old = channel.videos.filter((video) => video.isBackfill);
  const synced = channel.lastSyncedAt;
  const fresh =
    synced && Date.now() - new Date(synced).getTime() < 36 * 60 * 60 * 1000;

  return (
    <article
      data-channel-id={channel.id}
      className="flex flex-col rounded-md border border-hairline bg-elevated p-6 shadow-[0px_1px_1px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-start gap-3">
        <ChannelAvatar channel={channel} />
        <div className="min-w-0 flex-1">
          <h3 className="display-md truncate text-ink">{name}</h3>
          <p className="truncate text-sm text-mute">
            <a
              href={channel.profileUrl}
              target="_blank"
              rel="noreferrer noopener nofollow"
              className="hover:text-link"
            >
              @{channel.username}
            </a>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="mono-eyebrow rounded-[64px] border border-hairline px-3 py-1 text-mute">
            {PLATFORM_LABELS[channel.platform]}
          </span>
          <ChannelActions channel={channel} onEditToggle={() => setEditing((value) => !value)} />
        </div>
      </div>

      {editing && (
        <EditPanel
          channel={channel}
          onSaved={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      )}

      {latest.length > 0 && (
        <VideoSection
          label="Latest"
          count={latest.length}
          videos={latest}
          sortBy={sortBy}
          platform={channel.platform}
        />
      )}
      {old.length > 0 && (
        <VideoSection
          label="Old"
          count={old.length}
          videos={old}
          sortBy={sortBy}
          platform={channel.platform}
        />
      )}

      {channel.videos.length === 0 && (
        <p className="mono-eyebrow mt-5 border-t border-hairline pt-3 text-faint">
          {channel.backfilled
            ? "No videos tracked yet."
            : `First sync backfills the ${channel.oldVideoCount} most recent videos, then tracks the newest ${channel.latestVideoCount} going forward.`}
        </p>
      )}

      <p className="mt-auto flex items-center gap-2 pt-5 text-xs text-mute">
        {fresh && (
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-link" />
        )}
        {synced
          ? now != null
            ? `Synced ${formatRelativeCompact(new Date(synced), now)}`
            : null
          : "Not synced yet"}
      </p>
    </article>
  );
}

function VideoSection({
  label,
  count,
  videos,
  sortBy,
  platform,
}: {
  label: string;
  count: number;
  videos: LoadedVideo[];
  sortBy: SortKey;
  platform: PlatformValue;
}) {
  const sorted = sortVideos(videos, sortBy);
  return (
    <section className="border-t border-hairline pt-3">
      <h4 className="mono-eyebrow flex items-baseline gap-2 text-mute">
        <span>{label}</span>
        <span className="text-xs tabular-nums text-faint">{count}</span>
      </h4>
      <ul className="mt-2 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {sorted.map((video) => (
          <VideoRow key={video.id} video={video} platform={platform} />
        ))}
      </ul>
    </section>
  );
}

function VideoRow({
  video,
  platform,
}: {
  video: LoadedVideo;
  platform: PlatformValue;
}) {
  const now = useNow();
  const latest = video.latest;
  const likes = latest?.likes ?? 0;
  const comments = latest?.comments ?? 0;
  const ratio = latest ? formatLikeRatio(likes, latest.views) : null;
  const growth = latest
    ? formatGrowthPerHour(
        video.previous
          ? {
              views: video.previous.views,
              recordedAt: new Date(video.previous.recordedAt),
            }
          : null,
        { views: latest.views, recordedAt: new Date(latest.recordedAt) },
      )
    : null;
  const updatedAt = latest ? new Date(latest.recordedAt) : new Date(video.updatedAt);

  return (
    <li className="flex w-[280px] shrink-0 snap-start flex-col gap-2.5 text-sm">
      {video.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={video.thumbnailUrl}
          alt=""
          className="aspect-video w-full rounded-[4px] object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="aspect-video w-full rounded-[4px] bg-hairline-soft"
        />
      )}
      <div className="min-w-0 flex-1 flex flex-col">
        <a
          href={video.url}
          target="_blank"
          rel="noreferrer noopener nofollow"
          className="line-clamp-2 text-[13px] font-medium leading-snug text-ink hover:text-link"
        >
          {video.title ?? "Untitled"}
        </a>
        {latest ? (
          <>
            <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
              <span className="col-span-2">
                <dt className="mono-eyebrow text-faint">Views</dt>
                <dd
                  className="mt-0.5 whitespace-nowrap tabular-nums text-body"
                  title={
                    latest.views == null
                      ? platform === "INSTAGRAM"
                        ? "Instagram doesn't expose a view count for photo/carousel posts — only reels"
                        : "No view count available"
                      : undefined
                  }
                >
                  {latest.views == null
                    ? "—"
                    : formatFullNumber(latest.views)}
                </dd>
              </span>
              <span>
                <dt className="mono-eyebrow text-faint">Likes</dt>
                <dd className="mt-0.5 whitespace-nowrap tabular-nums text-body">
                  {formatFullNumber(likes)}
                  {ratio && <span className="ml-1 text-xs text-mute">{ratio}</span>}
                </dd>
              </span>
              <span>
                <dt className="mono-eyebrow text-faint">Comments</dt>
                <dd className="mt-0.5 whitespace-nowrap tabular-nums text-body">
                  {formatFullNumber(comments)}
                </dd>
              </span>
            </dl>
            <p className="mono-eyebrow mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-faint">
              {growth && <span className="text-body">{growth}</span>}
              {now != null &&
                video.publishedAt && (
                  <span>
                    {formatRelativeCompact(new Date(video.publishedAt), now)} old
                  </span>
                )}
              {now != null && (
                <span>updated {formatRelativeCompact(updatedAt, now)}</span>
              )}
            </p>
          </>
        ) : (
          <p className="mt-1.5 text-xs text-mute">No stats collected yet.</p>
        )}
      </div>
    </li>
  );
}

export function ChannelGroupSection({
  platform,
  channels,
  sortBy,
}: {
  platform: PlatformValue;
  channels: LoadedChannel[];
  sortBy: SortKey;
}) {
  return (
    <section aria-labelledby={`group-${platform}`} className="mt-6">
      <h2
        id={`group-${platform}`}
        className="flex items-baseline gap-2 scroll-mt-24"
      >
        <span className="mono-eyebrow text-mute">{PLATFORM_LABELS[platform]}</span>
        <span className="text-xs tabular-nums text-faint">{channels.length}</span>
      </h2>
      <div className="mt-4 flex flex-col gap-4">
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} sortBy={sortBy} />
        ))}
      </div>
    </section>
  );
}
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
import { Spinner } from "@/components/Spinner";
import { getDictionary, tpl, type Dictionary, type Locale } from "@/lib/i18n";

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
  locale,
}: {
  channel: LoadedChannel;
  onEditToggle: () => void;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [busy, setBusy] = useState<"refresh" | "edit" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const user = channel.username;

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
    if (!window.confirm(tpl(dict.card.confirmRemove, { user }))) {
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
          aria-label={tpl(dict.card.ariaRefresh, { user })}
          className={
            "inline-flex h-7 items-center gap-1.5 rounded-[6px] border border-hairline px-2.5 text-xs font-medium text-body " +
            "hover:border-ink hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-elevated disabled:opacity-50"
          }
        >
          {busy === "refresh" ? (
            <Spinner label={dict.card.syncing} />
          ) : (
            dict.card.refresh
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setError(null);
            onEditToggle();
          }}
          disabled={disabled}
          aria-label={tpl(dict.card.ariaEdit, { user })}
          className="inline-flex h-7 items-center rounded-[6px] border border-hairline px-2.5 text-xs font-medium text-body hover:border-ink hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-elevated disabled:opacity-50"
        >
          {dict.card.edit}
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={tpl(dict.card.ariaRemove, { user })}
          className="inline-flex h-7 items-center rounded-[6px] border border-hairline px-2.5 text-xs font-medium text-error hover:border-error hover:text-error-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:ring-offset-elevated disabled:opacity-50"
        >
          {dict.card.remove}
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

function EditPanel({
  channel,
  onSaved,
  onCancel,
  dict,
}: {
  channel: LoadedChannel;
  onSaved: () => void;
  onCancel: () => void;
  dict: Dictionary;
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
    const rawRatio = String(data.get("minLikeRatio") ?? "").trim();
    const minLikeRatio = rawRatio === "" ? null : Number(rawRatio);
    if (
      !Number.isFinite(oldVideoCount) ||
      !Number.isFinite(latestVideoCount) ||
      oldVideoCount < 0 ||
      latestVideoCount < 0
    ) {
      setError(dict.card.errCounts);
      return;
    }
    if (
      minLikeRatio !== null &&
      (!Number.isFinite(minLikeRatio) || minLikeRatio < 0 || minLikeRatio > 100)
    ) {
      setError(dict.card.errRatio);
      return;
    }
    startTransition(async () => {
      const result = await editChannel(channel.id, {
        oldVideoCount: Math.min(Math.round(oldVideoCount), 200),
        latestVideoCount: Math.min(Math.round(latestVideoCount), 200),
        minLikeRatio:
          minLikeRatio === null
            ? null
            : Math.min(Math.max(minLikeRatio, 0), 100),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Raise/lower windows are applied in editChannel; the follow-up sync
      // re-fills any raised bucket and refreshes stats so the dashboard
      // reflects the new counts immediately instead of after the hourly cron.
      const syncResult = await refreshChannel(channel.id);
      if (!syncResult.ok) setError(syncResult.error);
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
        label={dict.card.oldCountLabel}
        hint={dict.card.oldCountHint}
        defaultValue={channel.oldVideoCount}
      />
      <Field
        name="latestVideoCount"
        label={dict.card.latestCountLabel}
        hint={dict.card.latestCountHint}
        defaultValue={channel.latestVideoCount}
      />
      <Field
        name="minLikeRatio"
        label={dict.card.ratioLabel}
        hint={dict.card.ratioHint}
        defaultValue={channel.minLikeRatio}
        required={false}
        min={0}
        max={100}
        step={0.1}
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="h-8 rounded-[6px] bg-ink px-3 text-xs font-medium text-on-ink hover:bg-ink-press disabled:opacity-60"
        >
          {isPending ? dict.card.saving : dict.card.save}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="h-8 rounded-[6px] border border-hairline px-3 text-xs font-medium text-body hover:text-ink disabled:opacity-60"
        >
          {dict.card.cancel}
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
  required = true,
  min = 0,
  max = 200,
  step = 1,
}: {
  name: string;
  label: string;
  hint: string;
  defaultValue: number | null;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number | string;
}) {
  return (
    <label htmlFor={name} className="flex min-w-[120px] flex-1 flex-col gap-1">
      <span className="mono-eyebrow text-mute">{label}</span>
      <input
        id={name}
        name={name}
        type="number"
        min={min}
        max={max}
        step={step}
        inputMode={step === 1 ? "numeric" : "decimal"}
        defaultValue={defaultValue ?? ""}
        required={required}
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
  layout,
  locale,
}: {
  channel: LoadedChannel;
  sortBy: SortKey;
  layout: VideoLayout;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
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
          <ChannelActions
            channel={channel}
            onEditToggle={() => setEditing((value) => !value)}
            locale={locale}
          />
        </div>
      </div>

      {editing && (
        <EditPanel
          channel={channel}
          onSaved={() => setEditing(false)}
          onCancel={() => setEditing(false)}
          dict={dict}
        />
      )}

      {latest.length > 0 && (
        <VideoSection
          label={dict.card.latest}
          count={latest.length}
          videos={latest}
          sortBy={sortBy}
          layout={layout}
          platform={channel.platform}
          minLikeRatio={channel.minLikeRatio}
          dict={dict}
          locale={locale}
        />
      )}
      {old.length > 0 && (
        <VideoSection
          label={dict.card.old}
          count={old.length}
          videos={old}
          sortBy={sortBy}
          layout={layout}
          platform={channel.platform}
          minLikeRatio={channel.minLikeRatio}
          dict={dict}
          locale={locale}
        />
      )}

      {channel.videos.length === 0 && (
        <p className="mono-eyebrow mt-5 border-t border-hairline pt-3 text-faint">
          {channel.backfilled
            ? dict.card.noVideos
            : tpl(dict.card.backfill, {
                old: channel.oldVideoCount,
                latest: channel.latestVideoCount,
              })}
        </p>
      )}

      <p className="mt-auto flex items-center gap-2 pt-5 text-xs text-mute">
        {channel.lastSyncError ? (
          <span className="font-medium text-error">
            {tpl(dict.card.syncFailed, { error: channel.lastSyncError })}
          </span>
        ) : (
          <>
            {fresh && (
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-link" />
            )}
            {synced
              ? now != null
                ? tpl(dict.card.synced, {
                    t: formatRelativeCompact(new Date(synced), now),
                  })
                : null
              : dict.card.notSynced}
          </>
        )}
      </p>
    </article>
  );
}

function VideoSection({
  label,
  count,
  videos,
  sortBy,
  layout,
  platform,
  minLikeRatio,
  dict,
  locale,
}: {
  label: string;
  count: number;
  videos: LoadedVideo[];
  sortBy: SortKey;
  layout: VideoLayout;
  platform: PlatformValue;
  minLikeRatio: number | null;
  dict: Dictionary;
  locale: Locale;
}) {
  const sorted = sortVideos(videos, sortBy);
  return (
    <section className="border-t border-hairline pt-3">
      <h4 className="mono-eyebrow flex items-baseline gap-2 text-mute">
        <span>{label}</span>
        <span className="text-xs tabular-nums text-faint">{count}</span>
      </h4>
      <ul
        className={
          layout === "horizontal"
            ? "mt-2 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
            : "mt-2 flex flex-col gap-1"
        }
      >
        {sorted.map((video) => (
          <VideoRow
            key={video.id}
            video={video}
            platform={platform}
            layout={layout}
            minLikeRatio={minLikeRatio}
            dict={dict}
            locale={locale}
          />
        ))}
      </ul>
    </section>
  );
}

function VideoRow({
  video,
  platform,
  layout,
  minLikeRatio,
  dict,
  locale,
}: {
  video: LoadedVideo;
  platform: PlatformValue;
  layout: VideoLayout;
  minLikeRatio: number | null;
  dict: Dictionary;
  locale: Locale;
}) {
  const now = useNow();
  const latest = video.latest;
  const likes = latest?.likes ?? 0;
  const comments = latest?.comments ?? 0;
  const ratio = latest ? formatLikeRatio(likes, latest.views, locale) : null;
  const views = latest?.views ?? null;
  const likeRatioPct =
    views != null && views > 0 ? (likes / views) * 100 : null;
  const belowMin =
    minLikeRatio != null && likeRatioPct != null && likeRatioPct < minLikeRatio;
  const growth = latest
    ? formatGrowthPerHour(
        video.previous
          ? {
              views: video.previous.views,
              recordedAt: new Date(video.previous.recordedAt),
            }
          : null,
        { views: latest.views, recordedAt: new Date(latest.recordedAt) },
        dict.fmt.growthUnit,
        locale,
      )
    : null;
  const updatedAt = latest ? new Date(latest.recordedAt) : new Date(video.updatedAt);

  return (
    <li
      className={
        layout === "horizontal"
          ? "flex w-[280px] shrink-0 snap-start flex-col gap-2.5 text-sm"
          : "flex gap-3 py-3 text-sm"
      }
    >
      {video.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={video.thumbnailUrl}
          alt=""
          className={
            layout === "horizontal"
              ? "aspect-video w-full rounded-[4px] object-cover"
              : "aspect-video w-28 shrink-0 self-center rounded-[4px] object-cover"
          }
        />
      ) : (
        <span
          aria-hidden="true"
          className={
            layout === "horizontal"
              ? "aspect-video w-full rounded-[4px] bg-hairline-soft"
              : "aspect-video w-28 shrink-0 self-center rounded-[4px] bg-hairline-soft"
          }
        />
      )}
      <div
        className={
          layout === "horizontal"
            ? "min-w-0 flex-1 flex flex-col"
            : "min-w-0 flex-1"
        }
      >
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
                <dt className="mono-eyebrow text-faint">{dict.card.views}</dt>
                <dd
                  className="mt-0.5 whitespace-nowrap tabular-nums text-body"
                  title={
                    latest.views == null
                      ? platform === "INSTAGRAM"
                        ? dict.card.imgViewsTitle
                        : dict.card.noViews
                      : undefined
                  }
                >
                  {latest.views == null
                    ? "-"
                    : formatFullNumber(latest.views, locale)}
                </dd>
              </span>
              <span>
                <dt className="mono-eyebrow text-faint">{dict.card.likes}</dt>
                <dd className="mt-0.5 whitespace-nowrap tabular-nums text-body">
                  {formatFullNumber(likes, locale)}
                  {ratio && (
                    <span
                      className={`ml-1 text-xs ${
                        belowMin ? "font-medium text-error" : "text-mute"
                      }`}
                    >
                      {ratio}
                    </span>
                  )}
                  {belowMin && (
                    <span
                      title={tpl(dict.card.likeRatioTitle, {
                        ratio: ratio ?? "",
                        min: minLikeRatio ?? 0,
                      })}
                      className="ml-1 inline-flex items-center align-[-1px] text-error"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path d="M12 2 1 21h22L12 2Zm1 14.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-.5-2.5h-1V9h1v5Z" />
                      </svg>
                      <span className="sr-only">
                        {tpl(dict.card.ratioBelow, { min: minLikeRatio ?? 0 })}
                      </span>
                    </span>
                  )}
                </dd>
              </span>
              <span>
                <dt className="mono-eyebrow text-faint">{dict.card.comments}</dt>
                <dd className="mt-0.5 whitespace-nowrap tabular-nums text-body">
                  {formatFullNumber(comments, locale)}
                </dd>
              </span>
            </dl>
            <p className="mono-eyebrow mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-faint">
              {growth && <span className="text-body">{growth}</span>}
              {now != null &&
                video.publishedAt && (
                  <span>
                    {tpl(dict.card.publishedOld, {
                      t: formatRelativeCompact(new Date(video.publishedAt), now),
                    })}
                  </span>
                )}
              {now != null && (
                <span>
                  {tpl(dict.card.updated, {
                    t: formatRelativeCompact(updatedAt, now),
                  })}
                </span>
              )}
            </p>
          </>
        ) : (
          <p className="mt-1.5 text-xs text-mute">{dict.card.noStats}</p>
        )}
      </div>
    </li>
  );
}

export type VideoLayout = "horizontal" | "vertical";

export function ChannelGroupSection({
  platform,
  channels,
  sortBy,
  layout,
  locale,
}: {
  platform: PlatformValue;
  channels: LoadedChannel[];
  sortBy: SortKey;
  layout: VideoLayout;
  locale: Locale;
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
          <ChannelCard
            key={channel.id}
            channel={channel}
            sortBy={sortBy}
            layout={layout}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}
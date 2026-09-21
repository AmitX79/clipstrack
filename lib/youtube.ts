// YouTube — official YouTube Data API v3 (no scraping).
// Requires a Google Cloud Console API key in YOUTUBE_API_KEY.
//
// Shorts only: the uploads playlist mixes long-form videos with Shorts, but the
// API exposes no "isShort" flag, so videos over 60s are filtered out via
// contentDetails.duration and playlist pages are walked until enough Shorts are
// collected.
//
// Flow:
//   1. channels?forHandle=@<username>    -> account meta + channel-level stats
//   2. channels?part=contentDetails      -> uploads playlist id
//   3. playlistItems?playlistId=<uploads> -> recent video ids (paginated)
//   4. videos?part=snippet,statistics,contentDetails -> per-video meta+stats,
//      keeping only duration <= 60s (Shorts)

import type {
  AccountMeta,
  ChannelStats,
  MediaMeta,
  MediaSnapshot,
  MediaStats,
  PlatformFetcher,
} from "./types";
import { recordYoutubeQuota } from "./youtubequota";
import {
  markYoutubeKeyExhausted,
  nextYoutubeKey,
  recordYoutubeUnits,
} from "./youtubekeys";

export const PLATFORM = "youtube" as const;

const API_BASE = "https://www.googleapis.com/youtube/v3";
const MAX_RESULTS = 30; // trim to save quota; stats only need a rolling window
const MAX_LIMIT = 50; // playlistItems maxResults ceiling the API accepts

interface YtChannelItem {
  id: string;
  snippet?: { title?: string; thumbnails?: Record<string, { url?: string }> };
  contentDetails?: { relatedPlaylists?: { uploads?: string } };
  statistics?: {
    subscriberCount?: string;
    videoCount?: string;
    viewCount?: string;
  };
}

interface YtPlaylistItem {
  contentDetails?: { videoId?: string };
}

interface YtVideoItem {
  id: string;
  snippet?: {
    title?: string;
    thumbnails?: Record<string, { url?: string }>;
    publishedAt?: string;
  };
  contentDetails?: { duration?: string };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

// Pick the largest thumbnail variant the API returned (default is only
// 120x90 and looks blurry once the card scales it up).
function pickThumb(
  thumbs?: Record<string, { url?: string }>,
): string | undefined {
  if (!thumbs) return undefined;
  for (const key of ["maxres", "standard", "high", "medium", "default"]) {
    const url = thumbs[key]?.url;
    if (url) return url;
  }
  return undefined;
}

// ISO 8601 duration ("PT2M45S") -> seconds; undefined when unparsable.
function parseIsoDuration(iso: string | undefined): number | undefined {
  if (!iso) return undefined;
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return undefined;
  return (
    (Number(m[1] ?? 0) * 3600) + (Number(m[2] ?? 0) * 60) + Number(m[3] ?? 0)
  );
}

// Rotate across the managed API keys: each call uses the enabled key with the
// most quota left, bills one unit to it, and on a quota/permission failure
// retires that key and retries with the next one. The whole app's daily
// capacity is therefore (number of active keys) x 10,000 units.
async function get<T>(path: string): Promise<T> {
  let lastError = "No YouTube API key is configured.";
  for (let attempt = 0; attempt < 10; attempt++) {
    const keyRow = await nextYoutubeKey();
    if (!keyRow) {
      throw new Error(
        "YouTube API daily quota reached on every key - resumes after the quota resets.",
      );
    }

    const url = `${API_BASE}${path}${path.includes("?") ? "&" : "?"}key=${keyRow.key}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    // Every call that reaches the API counts toward the quota (channels.list,
    // playlistItems.list and videos.list each cost 1 unit), whether it succeeds
    // or the API rejects it. Best-effort bookkeeping, globally and per key.
    await recordYoutubeQuota(1).catch(() => undefined);
    await recordYoutubeUnits(keyRow.id, 1).catch(() => undefined);

    if (!res.ok) {
      // 403 = daily quota exceeded for this key (or a bad/disabled key): retire
      // it and try the next one. Other statuses (404/5xx) are not key-specific.
      if (res.status === 403) {
        await markYoutubeKeyExhausted(keyRow.id);
        lastError = `YouTube API ${path} returned ${res.status}`;
        continue;
      }
      throw new Error(`YouTube API ${path} returned ${res.status}`);
    }

    const json = (await res.json()) as { error?: { message?: string } };
    if (json.error) {
      const message = json.error.message ?? "unknown error";
      if (/quota|exceeded|disabled|invalid|permission/i.test(message)) {
        await markYoutubeKeyExhausted(keyRow.id);
        lastError = `YouTube API error: ${message}`;
        continue;
      }
      throw new Error(`YouTube API error: ${message}`);
    }
    return json as T;
  }
  throw new Error(lastError);
}

export const fetchYouTubeChannel: PlatformFetcher = async (username, limit) => {
  const handle = `@${username.replace(/^@/, "")}`;

  const channelResult = await get<{ items?: YtChannelItem[] }>(
    `/channels?part=snippet,statistics,contentDetails&forHandle=${handle}`,
  );
  const item = channelResult.items?.[0];
  if (!item) {
    throw new Error(`YouTube channel ${handle} not found`);
  }

  const stats = item.statistics ?? {};
  const account: AccountMeta = {
    platform: PLATFORM,
    username,
    displayName: item.snippet?.title ?? username,
    externalId: item.id,
    avatarUrl: pickThumb(item.snippet?.thumbnails),
    profileUrl: `https://www.youtube.com/${handle}`,
  };

  const channelStats: ChannelStats = {
    followers: Number(stats.subscriberCount ?? 0),
    totalPosts: Number(stats.videoCount ?? 0),
    totalViews: Number(stats.viewCount ?? 0),
  };

  const uploadsPlaylistId = item.contentDetails?.relatedPlaylists?.uploads;
  const media: MediaSnapshot[] = [];

  const wanted =
    limit == null
      ? MAX_RESULTS
      : limit <= 0
        ? 0
        : Math.min(limit, MAX_LIMIT);

  if (uploadsPlaylistId && wanted > 0) {
    // Shorts only: the uploads playlist mixes long-form videos with Shorts and
    // the API exposes no "isShort" flag, so we keep only videos whose duration
    // is at most 60s (the Shorts rule) and walk playlist pages until enough
    // Shorts are collected or the channel's playlist is exhausted.
    let pageToken: string | undefined;
    let pages = 0;
    while (media.length < wanted && pages < 6) {
      const playlistResult = await get<{
        items?: YtPlaylistItem[];
        nextPageToken?: string;
      }>(
        `/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}` +
          `&maxResults=50${pageToken ? `&pageToken=${pageToken}` : ""}`,
      );
      pageToken = playlistResult.nextPageToken;
      pages += 1;

      const videoIds = (playlistResult.items ?? [])
        .map((i) => i.contentDetails?.videoId)
        .filter((id): id is string => Boolean(id));
      if (videoIds.length === 0 && !pageToken) break;

      for (let i = 0; i < videoIds.length; i += 50) {
        const chunk = videoIds.slice(i, i + 50);
        const videosResult = await get<{ items?: YtVideoItem[] }>(
          `/videos?part=snippet,statistics,contentDetails&id=${chunk.join(",")}`,
        );
        for (const v of videosResult.items ?? []) {
          const seconds = parseIsoDuration(v.contentDetails?.duration);
          // Long-form videos (>60s) are never stored.
          if (seconds == null || seconds > 60) continue;
          const meta: MediaMeta = {
            externalId: v.id,
            title: v.snippet?.title,
            url: `https://www.youtube.com/watch?v=${v.id}`,
            thumbnailUrl: pickThumb(v.snippet?.thumbnails),
            publishedAt: v.snippet?.publishedAt
              ? new Date(v.snippet.publishedAt)
              : undefined,
          };
          const s = v.statistics ?? {};
          const ms: MediaStats = {
            views: Number(s.viewCount ?? 0),
            likes: Number(s.likeCount ?? 0),
            comments: Number(s.commentCount ?? 0),
          };
          media.push({ meta, stats: ms });
        }
      }
      if (!pageToken) break;
    }
  }

  // N most recent by nearest date first — never an even split per day. The
  // uploads playlist is newest-first; sort anyway so the pick is exact.
  media.sort(
    (a, b) =>
      (b.meta.publishedAt?.getTime() ?? 0) - (a.meta.publishedAt?.getTime() ?? 0),
  );
  const trimmed = media.slice(0, wanted);

  return { account, stats: channelStats, media: trimmed };
}
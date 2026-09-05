// YouTube — official YouTube Data API v3 (no scraping).
// Requires a Google Cloud Console API key in YOUTUBE_API_KEY.
//
// Flow:
//   1. channels?forHandle=@<username>  -> account meta + channel-level stats
//   2. channels?part=contentDetails      -> uploads playlist id
//   3. playlistItems?playlistId=<uploads> -> recent video ids
//   4. videos?part=snippet,statistics&id=<ids> -> per-video meta + stats

import type {
  AccountMeta,
  ChannelStats,
  MediaMeta,
  MediaSnapshot,
  MediaStats,
  PlatformFetcher,
} from "./types";

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
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

async function get<T>(path: string): Promise<T> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("YOUTUBE_API_KEY is not set");

  const url = `${API_BASE}${path}${path.includes("?") ? "&" : "?"}key=${apiKey}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) {
    throw new Error(`YouTube API ${path} returned ${res.status}`);
  }
  const json = (await res.json()) as { error?: { message?: string } };
  if (json.error) throw new Error(`YouTube API error: ${json.error.message}`);
  return json as T;
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
    avatarUrl: item.snippet?.thumbnails?.["default"]?.url,
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
    const playlistResult = await get<{ items?: YtPlaylistItem[] }>(
      `/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}` +
        `&maxResults=${wanted}`,
    );
    const videoIds = (playlistResult.items ?? [])
      .map((i) => i.contentDetails?.videoId)
      .filter((id): id is string => Boolean(id));

    for (let i = 0; i < videoIds.length; i += 50) {
      const chunk = videoIds.slice(i, i + 50);
      const videosResult = await get<{ items?: YtVideoItem[] }>(
        `/videos?part=snippet,statistics&id=${chunk.join(",")}`,
      );
      for (const v of videosResult.items ?? []) {
        const meta: MediaMeta = {
          externalId: v.id,
          title: v.snippet?.title,
          url: `https://www.youtube.com/watch?v=${v.id}`,
          thumbnailUrl: v.snippet?.thumbnails?.["default"]?.url,
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
  }

  return { account, stats: channelStats, media };
}
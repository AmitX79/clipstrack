// Platform-agnostic types shared by the scraping modules and the sync job.

export type Platform = "youtube" | "instagram" | "tiktok";

// Prisma enum values used by the form, actions, and UI.
export const PLATFORM_VALUES = ["YOUTUBE", "INSTAGRAM", "TIKTOK"] as const;
export type PlatformValue = (typeof PLATFORM_VALUES)[number];

export const PLATFORM_LABELS: Record<PlatformValue, string> = {
  YOUTUBE: "YouTube",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
};

// Static identity of a tracked account.
export interface AccountMeta {
  platform: Platform;
  username: string; // handle as tracked, e.g. "mrbeast" (no @)
  displayName: string;
  externalId: string; // YT channelId / IG pk / TT uid
  avatarUrl?: string;
  profileUrl: string;
}

// Channel-level stats (subscribers/followers, lifetime views, post count).
export interface ChannelStats {
  followers: number; // subscribers on YouTube
  following?: number; // Instagram only
  totalPosts: number;
  totalViews?: number; // lifetime channel views (YouTube)
}

// Static identity of a video/post/reel/short.
export interface MediaMeta {
  externalId: string; // platform-native id; used for idempotent upserts
  title?: string;
  url: string;
  thumbnailUrl?: string;
  publishedAt?: Date;
}

// Per-item stats. `views` is missing (not 0) when the platform exposes no
// view metric for the post type — Instagram images/carousels, for example.
export interface MediaStats {
  views?: number | null;
  likes: number;
  comments: number;
  favorites?: number; // TikTok "favorites"; null elsewhere
}

export interface MediaSnapshot {
  meta: MediaMeta;
  stats: MediaStats;
}

// The normalized result every platform module returns for one username.
export interface ChannelFetchResult {
  account: AccountMeta;
  stats: ChannelStats;
  media: MediaSnapshot[];
}

// `limit` caps how many of the newest media rows a fetcher returns, so the
// sync job can honor a channel's old/latest video-count configuration. A
// fetcher may return fewer rows than the platform exposes.
export type PlatformFetcher = (
  username: string,
  limit?: number,
) => Promise<ChannelFetchResult>;

// Strip @/path/query noise so users get matching regardless of how they type
// a handle: "@mrbeast/" -> "mrbeast".
export function normalizeUsername(input: string): string {
  return input
    .trim()
    .replace(/^@+/, "")
    .replace(/\/+$/, "")
    .split("/")[0]
    .toLowerCase();
}

// Parse a pasted profile URL (with or without scheme) into host + path.
function splitUrl(input: string): { host: string; path: string } | null {
  const t = input.trim();
  if (!t) return null;
  const m = t.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "").match(
    /^([^\s/?#]+(?:\.[a-z]{2,})?)(?:\/(.*))?$/i,
  );
  if (!m) return null;
  const host = m[1].toLowerCase();
  // Require a real host (contains a dot) and reject anything with an @ in the
  // host portion (handles/emails like "john@x.com" should fall back to plain).
  if (!host.includes(".") || host.includes("@")) return null;
  return { host, path: m[2] ?? "" };
}

// Detect the platform directly from a pasted profile URL. Recognizes only
// channel-level forms:
//   youtube.com/@handle | youtube.com/channel/ID | youtube.com/c/name
//   instagram.com/username
//   tiktok.com/@username
// Content links (watch, shorts, reels, youtu.be shortlinks, TikTok /video/...)
// and malformed URLs return null - callers then reject the input (a URL-shaped
// token that can't be read as a profile link is not a handle).
export function detectProfileUrl(
  input: string,
): { platform: PlatformValue; username: string } | null {
  const url = splitUrl(input);
  if (!url) return null;

  const path = url.path.split(/[?#]/)[0].replace(/^\/+|\/+$/g, "");
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  // YouTube: only @handle, channel/ID, c/custom-name (channel IDs are
  // case-sensitive and kept as-is). Everything else - watch, shorts, live,
  // playlist, embed, clip, ... - is a content link, not a profile.
  if (url.host.includes("youtube.com")) {
    const first = segments[0];
    if (first.startsWith("@")) {
      const username = normalizeUsername(first);
      return username ? { platform: "YOUTUBE", username } : null;
    }
    if (first === "channel" || first === "c") {
      const next = segments[1]?.replace(/^\/+|\/+$/g, "");
      if (!next) return null;
      const username = first === "channel" ? next : normalizeUsername(next);
      return username ? { platform: "YOUTUBE", username } : null;
    }
    return null;
  }

  // Instagram: a bare username (a single path segment). reel/p/reels/tv/...
  // are content links, reject them.
  if (url.host.includes("instagram.com")) {
    if (segments.length !== 1) return null;
    const username = normalizeUsername(segments[0]);
    return username ? { platform: "INSTAGRAM", username } : null;
  }

  // TikTok: @username only.
  if (url.host.includes("tiktok.com")) {
    if (segments.length !== 1 || !segments[0].startsWith("@")) return null;
    const username = normalizeUsername(segments[0]);
    return username ? { platform: "TIKTOK", username } : null;
  }

  return null;
}

// A URL-shaped token: has a scheme, starts with "www.", carries a query string
// ("?"), or looks like a host + optional path. Used to reject pasted links that
// failed profile detection (video URLs, unknown hosts, malformed input)
// instead of guessing a handle from them.
export function isUrlLike(input: string): boolean {
  const t = input.trim();
  if (!t) return false;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(t)) return true;
  if (/^www\./i.test(t)) return true;
  if (t.includes("?")) return true;
  return /^([a-z0-9-]+\.)+[a-z]{2,4}([/?#]|$)/i.test(t);
}
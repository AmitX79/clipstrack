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

// Detect the platform directly from a pasted profile URL. Recognizes:
//   youtube.com/@handle | youtube.com/channel/ID | youtu.be/ID   -> YouTube
//   instagram.com/username                                            -> Instagram
//   tiktok.com/@username                                              -> TikTok
// Returns the cleaned username and its platform, or null when the input is
// not (or can't be read as) a supported profile URL - callers then fall back
// to the platform tab currently selected in the UI.
export function detectProfileUrl(
  input: string,
): { platform: PlatformValue; username: string } | null {
  const url = splitUrl(input);
  if (!url) return null;

  let platform: PlatformValue | null = null;
  if (url.host.includes("youtube.com") || url.host === "youtu.be") {
    platform = "YOUTUBE";
  } else if (url.host.includes("instagram.com")) {
    platform = "INSTAGRAM";
  } else if (url.host.includes("tiktok.com")) {
    platform = "TIKTOK";
  }
  if (!platform) return null;

  // Strip query string / fragment, then drop leading path segments that are
  // URL furniture (youtube.com/channel/ID, /user/ID, /shorts/ID, TikTok
  // /video/ID, Instagram /reel/ID, etc.) so the remaining token is the handle.
  const path = url.path.split(/[?#]/)[0].replace(/^\/+|\/+$/g, "");
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const FURNITURE = new Set([
    "channel",
    "user",
    "c",
    "shorts",
    "live",
    "playlist",
    "watch",
    "reel",
    "reels",
    "p",
    "posts",
    "tv",
    "embed",
    "clip",
    "video",
  ]);
  const first = segments[0];
  const username = FURNITURE.has(first)
    ? segments[1] ?? null
    : first;
  if (!username) return null;

  const clean = normalizeUsername(username);
  return clean ? { platform, username: clean } : null;
}
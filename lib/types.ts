// Platform-agnostic types shared by the scraping modules and the sync job.

export type Platform = "youtube" | "instagram" | "tiktok";

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

// Per-item stats.
export interface MediaStats {
  views: number;
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

export type PlatformFetcher = (
  username: string,
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
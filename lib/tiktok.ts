// TikTok — ScrapeCreators API (https://docs.scrapecreators.com).
//
// Live public endpoint, no fragile HTML hydration parsing:
//   - GET /v3/tiktok/profile/videos   profile videos with full statistics
//                                      (play/digg/comment/collect counts)
//
// Pages are walked with `max_cursor` / `has_more`. Channel totals come from
// the `author` payload embedded in each item, so no separate profile call is
// needed. If a profile comes back empty, the API recommends retrying with
// `region=US` (the default is GB).

import { scrapeGet } from "./scrapecreators";
import { selectNearest } from "./select";
import type {
  AccountMeta,
  ChannelStats,
  MediaSnapshot,
  PlatformFetcher,
} from "./types";

export const PLATFORM = "tiktok" as const;

interface TtVideosResponse {
  success: boolean;
  message?: string;
  aweme_list?: TtAweme[];
  has_more?: number;
  max_cursor?: number | string;
}

interface TtAweme {
  aweme_id?: string | number;
  desc?: string;
  create_time?: number;
  // TikTok photo-mode posts carry image_post_info; pure videos don't. Channel
  // subscriptions only track videos, so image posts are always filtered out.
  image_post_info?: unknown;
  // Active livestreams/rooms carry this flag — the profile grid normally
  // serves only posted videos, but live items are never tracked.
  is_live?: boolean;
  author?: {
    unique_id?: string;
    nickname?: string;
    uid?: string | number;
    sec_uid?: string;
    avatar_larger?: { url_list?: string[] };
    avatar_thumb?: { url_list?: string[] };
    follower_count?: number;
    following_count?: number;
    aweme_count?: number;
  };
  statistics?: {
    play_count?: number;
    digg_count?: number;
    comment_count?: number;
    collect_count?: number;
    share_count?: number;
  };
  video?: {
    origin_cover?: { url_list?: string[] };
    cover?: { url_list?: string[] };
    dynamic_cover?: { url_list?: string[] };
    animated_cover?: { url_list?: string[] };
    play_addr?: { url_list?: string[] };
  };
}

// A TikTok item counts as a video only if it is not a photo-mode post
// (image_post_info is set for those), not an active livestream, and carries a
// playable video URL. Stories are ephemeral and are not served by the
// profile/videos endpoint at all — the play_addr requirement plus these flags
// keep every other non-video form out.
function isVideoPost(item: TtAweme): boolean {
  return Boolean(
    item.is_live !== true &&
      !item.image_post_info &&
      item.video &&
      item.video.play_addr?.url_list?.length,
  );
}

// Browsers can't decode TikTok's .heic images. The CDN hands back several
// URL variants per image (heic first, then a .jpeg with a valid signature),
// so prefer the first browser-friendly entry and return undefined (URL
// unusable) when only .heic variants exist.
function pickUrl(urls: string[] | undefined): string | undefined {
  return urls?.find((u) => /\.(jpe?g|png|webp|avif)(\?|$)/i.test(u));
}

// Profile_videos serves avatars as .heic only (app-format URLs). The
// dedicated profile endpoint returns the same image as a browser-friendly
// .jpeg, so fall back to it when needed.
async function fetchTikTokAvatar(handle: string): Promise<string | undefined> {
  try {
    const profile = await scrapeGet<{ user?: { avatarLarger?: string } }>(
      "/v1/tiktok/profile",
      { handle },
    );
    return profile?.user?.avatarLarger;
  } catch {
    return undefined;
  }
}

function extractUrls(video: TtAweme["video"]): string | undefined {
  return (
    pickUrl(video?.origin_cover?.url_list) ??
    pickUrl(video?.cover?.url_list) ??
    pickUrl(video?.dynamic_cover?.url_list) ??
    pickUrl(video?.animated_cover?.url_list)
  );
}

function toSnapshot(item: TtAweme): MediaSnapshot {
  const stats = item.statistics ?? {};
  return {
    meta: {
      externalId: String(item.aweme_id ?? ""),
      title: item.desc,
      url: item.aweme_id != null && item.author?.unique_id
        ? `https://www.tiktok.com/@${item.author.unique_id}/video/${item.aweme_id}`
        : "",
      thumbnailUrl: extractUrls(item.video),
      publishedAt:
        item.create_time != null
          ? new Date(item.create_time * 1000)
          : undefined,
    },
    stats: {
      views: stats.play_count ?? 0,
      likes: stats.digg_count ?? 0,
      comments: stats.comment_count ?? 0,
      favorites: stats.collect_count ?? 0,
    },
  };
}

export const fetchTikTokChannel: PlatformFetcher = async (username, limit) => {
  const cleaned = username.replace(/^@/, "");
  const requestLimit = Math.max(1, Math.min(limit ?? 8, 200));

  const params: Record<string, string | number | boolean> = { handle: cleaned };

  let first = await scrapeGet<TtVideosResponse>(
    "/v3/tiktok/profile/videos",
    params,
  );

  // The API serves some profiles empty from the default region (GB); retry
  // once from the US before giving up.
  if (!first.aweme_list?.length) {
    first = await scrapeGet<TtVideosResponse>("/v3/tiktok/profile/videos", {
      handle: cleaned,
      region: "US",
    });
  }

  // Videos only: drop photo-mode items (they carry image_post_info and no real
  // play count). Walk additional pages until enough videos are collected.
  const collected = [...(first.aweme_list ?? [])];
  let cursor = first.max_cursor;
  let more = first.has_more !== 0;
  let pages = 0;
  while (
    collected.filter(isVideoPost).length < requestLimit &&
    cursor != null &&
    more &&
    pages < 20
  ) {
    const next = await scrapeGet<TtVideosResponse>(
      "/v3/tiktok/profile/videos",
      { handle: cleaned, max_cursor: String(cursor) },
    );
    collected.push(...(next.aweme_list ?? []));
    cursor = next.max_cursor ?? cursor;
    more = next.has_more !== 0;
    pages += 1;
  }

  // The N most recent videos by nearest date first — never an even split per
  // day. Pages arrive newest-first; the explicit sort makes it exact.
  const sliced = selectNearest(
    collected,
    requestLimit,
    (item) => item.create_time,
    isVideoPost,
  );
  const firstItem = first.aweme_list?.[0] ?? sliced[0];
  const author = firstItem?.author ?? {};

  const account: AccountMeta = {
    platform: PLATFORM,
    username: cleaned,
    displayName: author.nickname ?? cleaned,
    externalId: String(author.uid ?? author.sec_uid ?? cleaned),
    // Prefer a browser-friendly avatar. profile_videos only hands back .heic
    // URLs, so when none exist fall back to the /v1/tiktok/profile avatar
    // (a .jpeg that browsers can decode).
    avatarUrl:
      pickUrl(author.avatar_larger?.url_list) ??
      (await fetchTikTokAvatar(cleaned)),
    profileUrl: `https://www.tiktok.com/@${cleaned}/`,
  };

  const stats: ChannelStats = {
    followers: author.follower_count ?? 0,
    following: author.following_count,
    totalPosts: author.aweme_count ?? sliced.length,
  };

  return {
    account,
    stats,
    media: sliced.map(toSnapshot).filter((m) => m.meta.externalId),
  };
};
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
  };
}

function extractUrls(video: TtAweme["video"]): string | undefined {
  return (
    video?.origin_cover?.url_list?.[0] ??
    video?.cover?.url_list?.[0]
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

  const items = [...(first.aweme_list ?? [])];
  let cursor = first.max_cursor;
  let pages = 0;
  while (
    items.length < requestLimit &&
    cursor != null &&
    first.has_more !== 0 &&
    pages < 20
  ) {
    const next = await scrapeGet<TtVideosResponse>(
      "/v3/tiktok/profile/videos",
      { handle: cleaned, max_cursor: String(cursor) },
    );
    items.push(...(next.aweme_list ?? []));
    cursor = next.max_cursor;
    pages += 1;
  }

  const sliced = items.slice(0, requestLimit);
  const firstItem = first.aweme_list?.[0] ?? sliced[0];
  const author = firstItem?.author ?? {};

  const account: AccountMeta = {
    platform: PLATFORM,
    username: cleaned,
    displayName: author.nickname ?? cleaned,
    externalId: String(author.uid ?? author.sec_uid ?? cleaned),
    avatarUrl:
      author.avatar_larger?.url_list?.[0] ??
      author.avatar_thumb?.url_list?.[0],
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
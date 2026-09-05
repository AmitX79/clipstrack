// TikTok — custom scraper for the public profile page.
//
// Method: fetch https://www.tiktok.com/@<username>/ and parse the
// `<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__">` JSON blob:
//   {
//     "__DEFAULT_SCOPE__": {
//       "webapp.user-detail": {
//         "userInfo": {
//           "user":  { "uniqueId", "nickname", "avatarLarger", "id", "signature" },
//           "stats": { "followerCount", "followingCount", "heartCount",
//                      "videoCount", ... }
//           "post":  { "items": [ { "id", "desc", "createTime",
//                      "stats": { "playCount", "diggCount", "commentCount",
//                                 "collectCount" } } ] }
//         }
//       }
//     }
//   }
//
// The exact paths change when TikTok tweaks the hydration payload, so every
// extraction is guarded with try/catch and degrades to undefined/[] rather
// than failing the whole sync.

import { extractScriptTag, fetchHtml, parseJsonScript } from "./html";
import type {
  AccountMeta,
  ChannelStats,
  MediaMeta,
  MediaSnapshot,
  MediaStats,
  PlatformFetcher,
} from "./types";

export const PLATFORM = "tiktok" as const;

export const fetchTikTokChannel: PlatformFetcher = async (username, limit) => {
  const cleaned = username.replace(/^@/, "");
  const profileUrl = `https://www.tiktok.com/@${cleaned}/`;
  const html = await fetchHtml(profileUrl);

  const script = extractScriptTag(html, { id: "__UNIVERSAL_DATA_FOR_REHYDRATION__" });
  const payload = script ? parsePayload(script) : null;

  const account: AccountMeta = {
    platform: PLATFORM,
    username: payload?.uniqueId ?? cleaned,
    displayName: payload?.nickname ?? cleaned,
    externalId: payload?.id ?? cleaned, // TODO(tt-scraper): real uid when payload shape confirmed
    avatarUrl: payload?.avatarLarger,
    profileUrl,
  };

  const stats: ChannelStats = {
    followers: payload?.followers ?? 0,
    following: payload?.following,
    totalPosts: payload?.videoCount ?? 0,
    totalViews: payload?.heartCount, // lifetime hearts ≈ total engagement
  };

  // The hydration payload lists posts newest-first; honor the requested cap.
  const media = parsePosts(payload?.posts);
  return {
    account,
    stats,
    media: limit != null ? media.slice(0, Math.max(0, limit)) : media,
  };
};

interface TtUserInfo {
  __DEFAULT_SCOPE__?: Record<string, unknown>;
  userInfo?: {
    user?: {
      uniqueId?: string;
      nickname?: string;
      avatarLarger?: string;
      id?: string;
    };
    stats?: {
      followerCount?: number;
      followingCount?: number;
      heartCount?: number;
      videoCount?: number;
    };
    post?: {
      items?: TtItem[];
    };
  };
}

interface TtItem {
  id?: string | number;
  desc?: string;
  createTime?: number;
  stats?: {
    playCount?: number;
    diggCount?: number;
    commentCount?: number;
    collectCount?: number;
  };
}

function parsePayload(script: string): {
  uniqueId?: string;
  nickname?: string;
  avatarLarger?: string;
  id?: string;
  followers?: number;
  following?: number;
  videoCount?: number;
  heartCount?: number;
  posts?: TtItem[];
} {
  try {
    const data = parseJsonScript<TtUserInfo>(script);
    const detail = data.__DEFAULT_SCOPE__?.["webapp.user-detail"] ?? {};
    const info = (detail as TtUserInfo | undefined)?.userInfo;
    const user = info?.user;
    const stats = info?.stats ?? {};
    return {
      uniqueId: user?.uniqueId,
      nickname: user?.nickname,
      avatarLarger: user?.avatarLarger,
      id: user?.id,
      followers: stats.followerCount,
      following: stats.followingCount,
      videoCount: stats.videoCount,
      heartCount: stats.heartCount,
      posts: info?.post?.items,
    };
  } catch {
    return {};
  }
}

function parsePosts(items: TtItem[] | undefined): MediaSnapshot[] {
  const media: MediaSnapshot[] = [];

  for (const item of items ?? []) {
    try {
      const meta: MediaMeta = {
        externalId: String(item.id ?? ""),
        title: item.desc,
        url: item.id != null
          ? `https://www.tiktok.com/@user/video/${item.id}`
          : "",
        publishedAt:
          item.createTime != null
            ? new Date(item.createTime * 1000)
            : undefined,
      };
      if (!meta.externalId || !meta.url) continue;

      const s = item.stats ?? {};
      const stats: MediaStats = {
        views: s.playCount ?? 0,
        likes: s.diggCount ?? 0,
        comments: s.commentCount ?? 0,
        favorites: s.collectCount ?? 0,
      };
      media.push({ meta, stats });
    } catch {
      // skip unparseable rows rather than failing the channel
    }
  }

  return media;
}
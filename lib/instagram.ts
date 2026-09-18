// Instagram — ScrapeCreators API (https://docs.scrapecreators.com).
//
// TikTok/YT style: two live public endpoints, no logins, no fragile HTML:
//   - GET /v2/instagram/user/posts      recent posts reels (like/comment/play
//                                        counts, taken_at, shortcode, thumbnails)
//   - GET /v1/instagram/profile         account identity + follower/following/
//                                        post counts (data.user)
//
// Pages of posts are walked with `next_max_id`. A profile call rounds out the
// follower counts; if it fails the posts payload already carries identity, so
// the sync still succeeds.

import { scrapeGet } from "./scrapecreators";
import type {
  AccountMeta,
  ChannelStats,
  MediaSnapshot,
  PlatformFetcher,
} from "./types";

export const PLATFORM = "instagram" as const;

interface PostsResponse {
  success: boolean;
  message?: string;
  items?: PostItem[];
  user?: PostUser;
  next_max_id?: string;
  more_available?: boolean;
}

interface PostUser {
  pk?: string | number;
  username?: string;
  full_name?: string;
  profile_pic_url?: string;
  follower_count?: number;
}

interface PostItem {
  pk: string | number;
  code?: string;
  taken_at?: number;
  media_type?: number;
  like_count?: number;
  comment_count?: number;
  play_count?: number;
  ig_play_count?: number;
  caption?: { text?: string };
  image_versions2?: { candidates?: { url?: string }[] };
  video_versions?: { url?: string }[];
  carousel_media?: { play_count?: number }[];
}

interface ProfileResponse {
  success: boolean;
  message?: string;
  data?: {
    user?: {
      id?: string | number;
      full_name?: string;
      username?: string;
      profile_pic_url?: string;
      edge_followed_by?: { count?: number };
      edge_follow?: { count?: number };
      edge_owner_to_timeline_media?: { count?: number };
    };
  };
}

// Instagram has no public view metric for image and image-only carousel
// posts — only reels report play counts — so return undefined (rendered as
// "—") instead of a misleading 0.
function snapshotViews(item: PostItem): number | undefined {
  if (typeof item.play_count === "number") return item.play_count;
  if (typeof item.ig_play_count === "number") return item.ig_play_count;
  const children = item.carousel_media ?? [];
  if (children.length > 0) {
    const sum = children.reduce((acc, c) => acc + (c.play_count ?? 0), 0);
    if (sum > 0) return sum;
  }
  return undefined;
}

function toSnapshot(item: PostItem): MediaSnapshot {
  const caption = (item.caption?.text ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  const candidate =
    item.image_versions2?.candidates?.find((c) => c.url)?.url ??
    item.video_versions?.[0]?.url;

  return {
    meta: {
      externalId: String(item.pk),
      title: caption || undefined,
      url: item.code
        ? `https://www.instagram.com/p/${item.code}/`
        : `https://www.instagram.com/p/${item.pk}/`,
      thumbnailUrl: candidate,
      publishedAt: item.taken_at ? new Date(item.taken_at * 1000) : undefined,
    },
    stats: {
      views: snapshotViews(item),
      likes: item.like_count ?? 0,
      comments: item.comment_count ?? 0,
    },
  };
}

export const fetchInstagramChannel: PlatformFetcher = async (username, limit) => {
  const cleaned = username.replace(/^@/, "");
  const requestLimit = Math.max(1, Math.min(limit ?? 8, 200));

  const first = await scrapeGet<PostsResponse>("/v2/instagram/user/posts", {
    handle: cleaned,
  });

  // Walk additional pages until the requested item count is met.
  const items = [...(first.items ?? [])];
  let cursor = first.next_max_id;
  let pages = 0;
  while (
    items.length < requestLimit &&
    cursor &&
    first.more_available !== false &&
    pages < 20
  ) {
    const next = await scrapeGet<PostsResponse>("/v2/instagram/user/posts", {
      handle: cleaned,
      next_max_id: cursor,
    });
    items.push(...(next.items ?? []));
    cursor = next.next_max_id;
    pages += 1;
  }
  // Pick the N most recent posts by nearest date first — never an even split
  // per day. Pages arrive newest-first, but an explicit sort makes the pick
  // exact regardless of platform ordering.
  const ordered = [...items].sort((a, b) => (b.taken_at ?? 0) - (a.taken_at ?? 0));
  const sliced = ordered.slice(0, requestLimit);

  // Profile call rounds out follower/following/post totals. Tolerated if it
  // fails — identity already comes from the posts payload.
  let profileUser: NonNullable<ProfileResponse["data"]>["user"];
  try {
    const profile = await scrapeGet<ProfileResponse>("/v1/instagram/profile", {
      handle: cleaned,
    });
    profileUser = profile.data?.user;
  } catch {
    // fall through with posts-only metadata
  }

  const pu = first.user ?? {};
  const account: AccountMeta = {
    platform: PLATFORM,
    username: cleaned,
    displayName:
      profileUser?.full_name ?? pu.full_name ?? cleaned,
    externalId: String(profileUser?.id ?? pu.pk ?? cleaned),
    avatarUrl: profileUser?.profile_pic_url ?? pu.profile_pic_url,
    profileUrl: `https://www.instagram.com/${cleaned}/`,
  };

  const stats: ChannelStats = {
    followers: profileUser?.edge_followed_by?.count ?? pu.follower_count ?? 0,
    following: profileUser?.edge_follow?.count,
    totalPosts: profileUser?.edge_owner_to_timeline_media?.count ?? sliced.length,
  };

  return { account, stats, media: sliced.map(toSnapshot) };
};
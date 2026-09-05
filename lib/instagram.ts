// Instagram — custom scraper for the public profile page.
//
// Method: fetch https://www.instagram.com/<username>/ and parse the embedded
// JSON scripts:
//   - `<script type="application/ld+json">` holds account metadata and
//     interaction counts (followers, likes) as `interactionStatistic`.
//   - Recent posts come from Instagram's internal windows (historically
//     `window._sharedData` / injected `__additionalDataLoaded`), which are
//     fragile. Extract the first N rows defensively and skip anything that
//     fails to parse.
//
// Because this is screen-scraping Instagram's HTML, the exact JSON shapes
// change without notice. Every extraction is isolated in a try/catch so one
// breaking field degrades to null/[] instead of failing the whole sync.

import { extractScriptTag, fetchHtml, parseJsonScript } from "./html";
import type {
  AccountMeta,
  ChannelStats,
  MediaSnapshot,
  PlatformFetcher,
} from "./types";

export const PLATFORM = "instagram" as const;

export const fetchInstagramChannel: PlatformFetcher = async (username) => {
  const cleaned = username.replace(/^@/, "");
  const profileUrl = `https://www.instagram.com/${cleaned}/`;
  const html = await fetchHtml(profileUrl);

  const ldJson = extractScriptTag(html, { type: "application/ld+json" });
  const ld = ldJson ? parseLdJson(ldJson) : null;

  const account: AccountMeta = {
    platform: PLATFORM,
    username: cleaned,
    displayName:
      ld?.author?.name ?? ld?.name ?? cleaned,
    externalId: ld?.author?.url?.replace(/^https?:\/\/www\.instagram\.com\//, "").replace(/\/$/, "") ?? cleaned,
    avatarUrl: ld?.image,
    profileUrl,
  };

  const stats: ChannelStats = {
    followers: ld?.followers ?? 0,
    following: undefined,
    totalPosts: ld?.posts ?? 0,
  };

  return { account, stats, media: parseRecentPosts(html) };
};

interface LdAccount {
  name?: string;
  image?: string;
  author?: {
    name?: string;
    url?: string;
  };
  interactionStatistic?: {
    interactionType?: string;
    userInteractionCount?: number | string;
  }[];
}

function parseLdJson(script: string) {
  try {
    const data = parseJsonScript<LdAccount>(script);
    const counts: Record<string, number> = {};
    for (const s of data.interactionStatistic ?? []) {
      const key = s.interactionType?.split("/").pop()?.toLowerCase() ?? "";
      if (s.userInteractionCount != null) {
        counts[key] = Number(s.userInteractionCount);
      }
    }
    return {
      ...data,
      followers: counts["follow"] ?? undefined,
      posts: counts["post"] ?? undefined,
    };
  } catch {
    return null;
  }
}

// Instagram embeds recent posts in various injected script payloads. Kept as
// an explicit TODO since the field paths must be verified against a live page.
function parseRecentPosts(html: string): MediaSnapshot[] {
  if (!html) return [];
  return [];
  // TODO(ig-scraper): locate the `__additionalDataLoaded('extra', ...)` /
  // next-data script, parse the `edges` array, and map each media item to:
  //   MediaMeta   { externalId, url, thumbnailUrl, publishedAt }
  //   MediaStats  { views, likes (*2 approximation or native field), comments }
  // Guard each item with try/catch; skip rows that don't parse.
}
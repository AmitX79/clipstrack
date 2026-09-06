import { prisma } from "@/lib/db";
import { PLATFORM_VALUES } from "@/lib/types";
import type { PlatformValue } from "@/lib/types";
import type { Prisma } from "@/app/generated/prisma/client";

export const GROUP_ORDER = PLATFORM_VALUES;

// Videos carry their two latest snapshots so cards can show both the current
// stats and the per-hour growth between them. BigInt/Date values are
// serialized here so the data is safe to pass into client components.
const CHANNEL_INCLUDE = {
  videos: {
    orderBy: { publishedAt: "desc" as const },
    take: 100,
    include: { snapshots: { orderBy: { recordedAt: "desc" as const }, take: 2 } },
  },
} as const;

export interface LoadedVideoSnapshot {
  views: number;
  likes: number;
  comments: number;
  recordedAt: string;
}

export interface LoadedVideo {
  id: string;
  title: string | null;
  url: string;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  isBackfill: boolean;
  updatedAt: string;
  latest: LoadedVideoSnapshot | null;
  previous: LoadedVideoSnapshot | null;
}

export interface LoadedChannel {
  id: string;
  platform: PlatformValue;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  profileUrl: string;
  lastSyncedAt: string | null;
  oldVideoCount: number;
  latestVideoCount: number;
  backfilled: boolean;
  videos: LoadedVideo[];
}

type ChannelWithInclude = Prisma.ChannelGetPayload<{
  include: typeof CHANNEL_INCLUDE;
}>;

function serializeChannel(channel: ChannelWithInclude): LoadedChannel {
  return {
    id: channel.id,
    platform: channel.platform,
    username: channel.username,
    displayName: channel.displayName,
    avatarUrl: channel.avatarUrl,
    profileUrl: channel.profileUrl,
    lastSyncedAt: channel.lastSyncedAt ? channel.lastSyncedAt.toISOString() : null,
    oldVideoCount: channel.oldVideoCount,
    latestVideoCount: channel.latestVideoCount,
    backfilled: channel.backfilled,
    videos: channel.videos.map((video) => {
      const latest = video.snapshots[0];
      const previous = video.snapshots[1];
      return {
        id: video.id,
        title: video.title,
        url: video.url,
        thumbnailUrl: video.thumbnailUrl,
        publishedAt: video.publishedAt ? video.publishedAt.toISOString() : null,
        isBackfill: video.isBackfill,
        updatedAt: video.updatedAt.toISOString(),
        latest: latest
          ? {
              views: Number(latest.views),
              likes: latest.likes,
              comments: latest.comments,
              recordedAt: latest.recordedAt.toISOString(),
            }
          : null,
        previous: previous
          ? {
              views: Number(previous.views),
              likes: previous.likes,
              comments: previous.comments,
              recordedAt: previous.recordedAt.toISOString(),
            }
          : null,
      };
    }),
  };
}

// A given visitor's tracked channels (for the /tracked page).
export async function loadChannels(userId: string): Promise<LoadedChannel[]> {
  const channels = await prisma.channel.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: CHANNEL_INCLUDE,
  });
  return channels.map(serializeChannel);
}
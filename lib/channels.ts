import { prisma } from "@/lib/db";
import { PLATFORM_VALUES } from "@/lib/types";
import type { PlatformValue } from "@/lib/types";
import type { Prisma } from "@/app/generated/prisma/client";

export const GROUP_ORDER = PLATFORM_VALUES;

// Per-visitor cap on tracked channels — a scaling guard so one visitor cannot
// queue an unbounded number of channels into the hourly sync (and burn the
// shared YouTube/ScrapeCreators quota). Editable via the `settings` table;
// self-seeds to the default on first read.
export const SETTING_MAX_CHANNELS = "maxChannelsPerUser";
export const DEFAULT_MAX_CHANNELS = 50;

export async function getMaxChannelsPerUser(): Promise<number> {
  const row = await prisma.setting.findUnique({
    where: { key: SETTING_MAX_CHANNELS },
  });
  if (row) {
    const n = Number(row.value);
    if (Number.isInteger(n) && n > 0) return n;
  }
  await prisma.setting
    .upsert({
      where: { key: SETTING_MAX_CHANNELS },
      create: { key: SETTING_MAX_CHANNELS, value: String(DEFAULT_MAX_CHANNELS) },
      update: {},
    })
    .catch(() => {});
  return DEFAULT_MAX_CHANNELS;
}

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
  views: number | null;
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
  lastSyncError: string | null;
  oldVideoCount: number;
  latestVideoCount: number;
  backfilled: boolean;
  minLikeRatio: number | null;
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
    lastSyncError: channel.lastSyncError,
    oldVideoCount: channel.oldVideoCount,
    latestVideoCount: channel.latestVideoCount,
    backfilled: channel.backfilled,
    minLikeRatio: channel.minLikeRatio,
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
              views: latest.views == null ? null : Number(latest.views),
              likes: latest.likes,
              comments: latest.comments,
              recordedAt: latest.recordedAt.toISOString(),
            }
          : null,
        previous: previous
          ? {
              views: previous.views == null ? null : Number(previous.views),
              likes: previous.likes,
              comments: previous.comments,
              recordedAt: previous.recordedAt.toISOString(),
            }
          : null,
      };
    }),
  };
}

// A given visitor's tracked channels (for the /accounts page).
export async function loadChannels(userId: string): Promise<LoadedChannel[]> {
  const channels = await prisma.channel.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: CHANNEL_INCLUDE,
  });
  return channels.map(serializeChannel);
}
import { query, queryOne, type ChannelRow } from "@/lib/db";
import { PLATFORM_VALUES } from "@/lib/types";
import type { PlatformValue } from "@/lib/types";

export const GROUP_ORDER = PLATFORM_VALUES;

// Per-visitor cap on tracked channels — a scaling guard so one visitor cannot
// queue an unbounded number of channels into the hourly sync (and burn the
// shared YouTube/ScrapeCreators quota). Editable via the `settings` table;
// self-seeds to the default on first read.
export const SETTING_MAX_CHANNELS = "maxChannelsPerUser";
export const DEFAULT_MAX_CHANNELS = 50;

export async function getMaxChannelsPerUser(): Promise<number> {
  const row = await queryOne<{ value: string }>(
    `SELECT value FROM settings WHERE key = $1`,
    [SETTING_MAX_CHANNELS],
  );
  if (row) {
    const n = Number(row.value);
    if (Number.isInteger(n) && n > 0) return n;
  }
  await query(
    `INSERT INTO settings (key, value, "updatedAt", "createdAt")
     VALUES ($1, $2, now(), now())
     ON CONFLICT (key) DO NOTHING`,
    [SETTING_MAX_CHANNELS, String(DEFAULT_MAX_CHANNELS)],
  ).catch(() => {});
  return DEFAULT_MAX_CHANNELS;
}

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

type VideoRow = {
  id: string;
  title: string | null;
  url: string;
  thumbnailUrl: string | null;
  publishedAt: Date | null;
  isBackfill: boolean;
  updatedAt: Date;
  channelId: string;
};

type SnapshotRow = {
  id: string;
  views: number | null;
  likes: number;
  comments: number;
  recordedAt: Date;
  videoId: string;
};

function serializeVideo(
  video: VideoRow,
  snapshotRows: SnapshotRow[],
): LoadedVideo {
  const ordered = [...snapshotRows].sort(
    (a, b) => b.recordedAt.getTime() - a.recordedAt.getTime(),
  );
  const latest = ordered[0];
  const previous = ordered[1];
  const toLoaded = (snap: SnapshotRow | undefined): LoadedVideoSnapshot | null =>
    snap
      ? {
          views: snap.views == null ? null : Number(snap.views),
          likes: snap.likes,
          comments: snap.comments,
          recordedAt: snap.recordedAt.toISOString(),
        }
      : null;
  return {
    id: video.id,
    title: video.title,
    url: video.url,
    thumbnailUrl: video.thumbnailUrl,
    publishedAt: video.publishedAt ? video.publishedAt.toISOString() : null,
    isBackfill: video.isBackfill,
    updatedAt: video.updatedAt.toISOString(),
    latest: toLoaded(latest),
    previous: toLoaded(previous),
  };
}

function serializeChannel(
  channel: ChannelRow,
  videos: VideoRow[],
  snapshotsByVideo: Map<string, SnapshotRow[]>,
): LoadedChannel {
  return {
    id: channel.id,
    platform: channel.platform as PlatformValue,
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
    videos: videos.map((video) =>
      serializeVideo(video, snapshotsByVideo.get(video.id) ?? []),
    ),
  };
}

// A given visitor's tracked channels (for the /accounts page).
export async function loadChannels(userId: string): Promise<LoadedChannel[]> {
  const channels = await query<ChannelRow>(
    `SELECT * FROM channels WHERE "userId" = $1 ORDER BY "createdAt" ASC`,
    [userId],
  );
  if (channels.length === 0) return [];

  const channelIds = channels.map((channel) => channel.id);

  // Up to the 100 most recent videos per channel, on the same publish-date
  // ordering the cards used before, with the 2 latest snapshots per video.
  const videos = await query<VideoRow>(
    `SELECT t."id", t.title, t.url, t."thumbnailUrl", t."publishedAt",
            t."isBackfill", t."updatedAt", t."channelId"
     FROM (
       SELECT v.*, row_number() OVER (
         PARTITION BY v."channelId" ORDER BY v."publishedAt" DESC
       ) AS __rn
       FROM videos v
       WHERE v."channelId" = ANY($1)
     ) t
     WHERE t.__rn <= 100`,
    [channelIds],
  );
  const videoIds = videos.map((video) => video.id);
  const snapshots =
    videoIds.length > 0
      ? await query<SnapshotRow>(
          `SELECT t."id", t.views, t.likes, t.comments, t."recordedAt", t."videoId"
           FROM (
             SELECT vs.*, row_number() OVER (
               PARTITION BY vs."videoId" ORDER BY vs."recordedAt" DESC
             ) AS __rn
             FROM video_snapshots vs
             WHERE vs."videoId" = ANY($1)
           ) t
           WHERE t.__rn <= 2`,
          [videoIds],
        )
      : [];

  const videosByChannel = new Map<string, VideoRow[]>();
  for (const video of videos) {
    const list = videosByChannel.get(video.channelId);
    if (list) list.push(video);
    else videosByChannel.set(video.channelId, [video]);
  }
  const snapshotsByVideo = new Map<string, SnapshotRow[]>();
  for (const snap of snapshots) {
    const list = snapshotsByVideo.get(snap.videoId);
    if (list) list.push(snap);
    else snapshotsByVideo.set(snap.videoId, [snap]);
  }

  return channels.map((channel) =>
    serializeChannel(channel, videosByChannel.get(channel.id) ?? [], snapshotsByVideo),
  );
}
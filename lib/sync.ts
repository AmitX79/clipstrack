// Shared sync orchestration, used by:
//   1. the hourly VPS cron (scripts/sync.ts)
//   2. the add-channel flow (app/actions.ts -> immediate first sync)
//
// A failing platform fetch or a single bad channel never aborts the rest.

import { prisma } from "./db";
import { fetchInstagramChannel } from "./instagram";
import { fetchTikTokChannel } from "./tiktok";
import { fetchYouTubeChannel } from "./youtube";
import type { Channel } from "../app/generated/prisma/client";
import type { ChannelFetchResult } from "./types";

const FETCHERS = {
  YOUTUBE: fetchYouTubeChannel,
  INSTAGRAM: fetchInstagramChannel,
  TIKTOK: fetchTikTokChannel,
} as const;

export async function fetchChannel(
  channel: Channel,
  limit?: number,
): Promise<ChannelFetchResult> {
  const fetcher = FETCHERS[channel.platform];
  return fetcher(channel.username, limit);
}

export async function syncChannel(channel: Channel): Promise<void> {
  let result: ChannelFetchResult;

  // First sync on a channel = the one-time "Old" backfill window; every sync
  // after that only looks at the newest uploads ("Latest").
  const doingBackfill = !channel.backfilled;
  const trackVideos = doingBackfill
    ? channel.oldVideoCount
    : channel.latestVideoCount;

  try {
    result = await fetchChannel(channel, trackVideos > 0 ? trackVideos : 0);
  } catch (err) {
    // Bot-wall, quota, or network error — report and keep the rest alive.
    console.error(`[sync] ${channel.platform} @${channel.username}:`, err);
    return;
  }

  await prisma.channel.update({
    where: { id: channel.id },
    data: {
      externalId: result.account.externalId,
      displayName: result.account.displayName,
      avatarUrl: result.account.avatarUrl,
      profileUrl: result.account.profileUrl,
      lastSyncedAt: new Date(),
    },
  });

  await prisma.channelSnapshot.create({
    data: {
      channelId: channel.id,
      followers: result.stats.followers,
      following: result.stats.following,
      totalPosts: result.stats.totalPosts,
      totalViews:
        result.stats.totalViews == null ? null : BigInt(result.stats.totalViews),
      recordedAt: new Date(),
    },
  });

  // Bucket membership is decided by publish date vs the channel's addedAt
  // (createdAt): videos published at/before addedAt belong to "Old" (backfilled
  // once); later uploads belong to "Latest". Membership is assigned only at
  // creation and never changed on update — a video never moves buckets.
  const addedAt = channel.createdAt;
  const existing = await prisma.video.findMany({
    where: { channelId: channel.id },
    select: { externalId: true },
  });
  const existingExternal = new Set(existing.map((video) => video.externalId));

  for (const item of result.media) {
    const publishedAt = item.meta.publishedAt;
    const belongsLatest = publishedAt != null && publishedAt > addedAt;
    const alreadyTracked = existingExternal.has(item.meta.externalId);

    // The "Old" window is frozen after its one-time backfill. A routine sync
    // must never (re)create pre-existing videos — they were backfilled once,
    // or intentionally trimmed away by a count edit. Skipping them is what
    // keeps a trim (4 -> 2) from being undone on the next sync.
    if (!alreadyTracked && !doingBackfill && !belongsLatest) continue;

    const video = await prisma.video.upsert({
      where: {
        channelId_externalId: {
          channelId: channel.id,
          externalId: item.meta.externalId,
        },
      },
      create: {
        channelId: channel.id,
        externalId: item.meta.externalId,
        title: item.meta.title,
        url: item.meta.url,
        thumbnailUrl: item.meta.thumbnailUrl,
        publishedAt: item.meta.publishedAt,
        isBackfill: !belongsLatest,
      },
      update: {
        title: item.meta.title,
        url: item.meta.url,
        thumbnailUrl: item.meta.thumbnailUrl,
        publishedAt: item.meta.publishedAt,
      },
    });

    await prisma.videoSnapshot.create({
      data: {
        videoId: video.id,
        views: item.stats.views == null ? null : BigInt(item.stats.views),
        likes: item.stats.likes,
        comments: item.stats.comments,
        favorites: item.stats.favorites,
        recordedAt: new Date(),
      },
    });

    existingExternal.add(item.meta.externalId);
  }

  // Close the one-time backfill window once it has run (even if the platform
  // returned no media), so the next syncs track only the newest uploads.
  if (doingBackfill) {
    await prisma.channel.update({
      where: { id: channel.id },
      data: { backfilled: true },
    });
  }

  console.log(
    `[sync] ok ${channel.platform} @${channel.username}: ` +
      `${result.media.length} items, followers=${result.stats.followers}`,
  );
}

export async function runSync(): Promise<void> {
  const channels = await prisma.channel.findMany({ orderBy: { id: "asc" } });
  console.log(`[sync] ${channels.length} channel(s) to sync`);

  for (const channel of channels) {
    await syncChannel(channel);
  }
  console.log("[sync] done");
}
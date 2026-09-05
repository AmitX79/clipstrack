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

export async function fetchChannel(channel: Channel): Promise<ChannelFetchResult> {
  const fetcher = FETCHERS[channel.platform];
  return fetcher(channel.username);
}

export async function syncChannel(channel: Channel): Promise<void> {
  let result: ChannelFetchResult;

  try {
    result = await fetchChannel(channel);
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

  for (const item of result.media) {
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
        views: BigInt(item.stats.views),
        likes: item.stats.likes,
        comments: item.stats.comments,
        favorites: item.stats.favorites,
        recordedAt: new Date(),
      },
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
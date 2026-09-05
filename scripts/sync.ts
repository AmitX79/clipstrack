// Hourly sync job — runs on the VPS under full Node.js (never the Edge
// runtime), because the IG/TikTok scrapers need real HTTP + HTML parsing.
//
// The DB lives on Neon, so if this VPS goes down only the *new* updates
// pause; the Cloudflare Pages site and existing data stay live.
//
//  1. Reads every tracked channel.
//  2. Calls the right platform module (YouTube API / IG scrape / TT scrape).
//  3. Upserts channel meta + one ChannelSnapshot per account.
//  4. Upserts each video/post + one VideoSnapshot each.
//  5. Marks lastSyncedAt. Failures on one channel never stop the rest.

import "dotenv/config";

import { prisma } from "../lib/db";
import { fetchInstagramChannel } from "../lib/instagram";
import { fetchTikTokChannel } from "../lib/tiktok";
import { fetchYouTubeChannel } from "../lib/youtube";
import type { ChannelFetchResult } from "../lib/types";
import type { Channel } from "../app/generated/prisma/client";

const FETCHERS = {
  YOUTUBE: fetchYouTubeChannel,
  INSTAGRAM: fetchInstagramChannel,
  TIKTOK: fetchTikTokChannel,
} as const;

async function syncChannel(channel: Channel): Promise<void> {
  const fetcher = FETCHERS[channel.platform];
  let result: ChannelFetchResult;

  try {
    result = await fetcher(channel.username);
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
      totalViews: result.stats.totalViews == null ? null : BigInt(result.stats.totalViews),
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

if (process.argv[1]?.endsWith("sync.ts")) {
  runSync()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[sync] fatal:", err);
      process.exit(1);
    });
}
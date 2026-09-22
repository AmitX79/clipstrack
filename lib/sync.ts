// Shared sync orchestration, used by:
//   1. the hourly VPS cron (scripts/sync.ts)
//   2. the add-channel flow (app/actions.ts -> immediate first sync)
//
// A failing platform fetch or a single bad channel never aborts the rest.
//
// Credit accounting: when a `comboHash` is supplied, an Instagram/TikTok sync
// is charged against that visitor's daily ScrapeCreators budget — 1 credit per
// video actually fetched — and runs with a credit-capped fetch limit. During a
// backfill, a credit-capped partial run keeps the channel `backfilled: false`
// so progress is preserved and the window re-opens on a later (better-funded)
// sync. YouTube is exempt: it uses the official YouTube Data API's own
// 10,000 units/day quota (tracked in /admin) and never touches the per-IP
// ScrapeCreators budget.

import { id, query, queryOne, type ChannelRow } from "./db";
import { fetchInstagramChannel } from "./instagram";
import { fetchTikTokChannel } from "./tiktok";
import { fetchYouTubeChannel } from "./youtube";
import type { ChannelFetchResult } from "./types";
import { comboHash, consumeCredits, getCreditsStatus } from "./credits";

const FETCHERS = {
  YOUTUBE: fetchYouTubeChannel,
  INSTAGRAM: fetchInstagramChannel,
  TIKTOK: fetchTikTokChannel,
} as const;

export async function fetchChannel(
  channel: ChannelRow,
  limit?: number,
): Promise<ChannelFetchResult> {
  const fetcher = FETCHERS[channel.platform as keyof typeof FETCHERS];
  return fetcher(channel.username, limit);
}

export interface SyncOptions {
  // Who to charge (per-IP+ct_uid combo). When omitted the sync runs without
  // credit accounting (legacy behavior).
  comboHash?: string;
  // Credits still available for this combo in this batch (avoid re-reading).
  remaining?: number;
}

// Syncs one channel and returns the number of credits it consumed (the number
// of videos fetched). Instagram/TikTok are charged against the visitor's daily
// ScrapeCreators budget; YouTube never is. Returns 0 when skipped for reaching
// the daily budget.
export async function syncChannel(
  channel: ChannelRow,
  opts: SyncOptions = {},
): Promise<number> {
  // YouTube uses the official YouTube Data API (its own 10,000 units/day
  // quota), so the per-IP ScrapeCreators budget only governs IG/TikTok.
  const budgeted = opts.comboHash != null && channel.platform !== "YOUTUBE";

  // First sync on a channel = the one-time "Old" backfill window; every sync
  // after that only looks at the newest uploads ("Latest").
  const doingBackfill = !channel.backfilled;
  const trackVideos = doingBackfill
    ? channel.oldVideoCount
    : channel.latestVideoCount;

  let wanted = trackVideos > 0 ? trackVideos : 0;
  if (budgeted) {
    const status =
      opts.remaining != null
        ? { remaining: opts.remaining }
        : await getCreditsStatus(opts.comboHash!);
    if (status.remaining <= 0) {
      console.log(
        `[sync] skip ${channel.platform} @${channel.username}: daily limit reached`,
      );
      return 0;
    }
    wanted = Math.min(wanted, status.remaining);
  }

  let result: ChannelFetchResult;
  try {
    result = await fetchChannel(channel, wanted > 0 ? wanted : 0);
  } catch (err) {
    // Bot-wall, quota, network or not-found error. Record it on the channel so
    // the UI can show why a sync failed instead of silently showing no videos;
    // the next successful sync clears it. The rest of the batch keeps going.
    const detail = err instanceof Error ? err.message : String(err);
    console.error(`[sync] ${channel.platform} @${channel.username}:`, err);
    await query(
      `UPDATE channels SET "lastSyncError" = $1, "updatedAt" = now() WHERE id = $2`,
      [detail.slice(0, 500), channel.id],
    ).catch((e) => console.error("[sync] failed to store error:", e));
    return 0;
  }

  // Charge after a successful fetch: exactly as many credits as videos that
  // came back (never more than the credit-capped limit we asked for). Only
  // Instagram/TikTok are charged; YouTube stays on its own API quota.
  const consumed = result.media.length;
  if (budgeted && consumed > 0) {
    await consumeCredits(opts.comboHash!, consumed);
  }

  await query(
    `UPDATE channels SET
       "externalId" = $1, "displayName" = $2, "avatarUrl" = $3, "profileUrl" = $4,
       "lastSyncedAt" = now(), "lastSyncError" = NULL, "updatedAt" = now()
     WHERE id = $5`,
    [
      result.account.externalId,
      result.account.displayName,
      result.account.avatarUrl,
      result.account.profileUrl,
      channel.id,
    ],
  );

  await query(
    `INSERT INTO channel_snapshots (id, "channelId", followers, following, "totalPosts", "totalViews", "recordedAt")
     VALUES ($1, $2, $3, $4, $5, $6, now())`,
    [
      id(),
      channel.id,
      result.stats.followers,
      result.stats.following,
      result.stats.totalPosts,
      result.stats.totalViews == null
        ? null
        : BigInt(result.stats.totalViews),
    ],
  );

  // Bucket membership is decided by publish date vs the channel's addedAt
  // (createdAt): videos published at/before addedAt belong to "Old" (backfilled
  // once); later uploads belong to "Latest". Membership is assigned only at
  // creation and never changed on update — a video never moves buckets.
  const addedAt = channel.createdAt;
  const existing = await query<{ externalId: string }>(
    `SELECT "externalId" FROM videos WHERE "channelId" = $1`,
    [channel.id],
  );
  const existingExternal = new Set(
    existing.map((video) => video.externalId),
  );

  for (const item of result.media) {
    const publishedAt = item.meta.publishedAt;
    const belongsLatest = publishedAt != null && publishedAt > addedAt;
    const alreadyTracked = existingExternal.has(item.meta.externalId);

    // The "Old" window is frozen after its one-time backfill. A routine sync
    // must never (re)create pre-existing videos — they were backfilled once,
    // or intentionally trimmed away by a count edit. Skipping them is what
    // keeps a trim (4 -> 2) from being undone on the next sync.
    if (!alreadyTracked && !doingBackfill && !belongsLatest) continue;

    const video = await queryOne<{ id: string }>(
      `INSERT INTO videos (id, "channelId", "externalId", title, url, "thumbnailUrl", "publishedAt", "isBackfill", "updatedAt", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())
       ON CONFLICT ("channelId", "externalId") DO UPDATE SET
         title = EXCLUDED.title,
         url = EXCLUDED.url,
         "thumbnailUrl" = EXCLUDED."thumbnailUrl",
         "publishedAt" = EXCLUDED."publishedAt",
         "updatedAt" = now()
       RETURNING id`,
      [
        id(),
        channel.id,
        item.meta.externalId,
        item.meta.title,
        item.meta.url,
        item.meta.thumbnailUrl,
        item.meta.publishedAt,
        !belongsLatest,
      ],
    );

    await query(
      `INSERT INTO video_snapshots (id, "videoId", views, likes, comments, favorites, "recordedAt")
       VALUES ($1, $2, $3, $4, $5, $6, now())`,
      [
        id(),
        video!.id,
        item.stats.views == null ? null : BigInt(item.stats.views),
        item.stats.likes,
        item.stats.comments,
        item.stats.favorites,
      ],
    );

    existingExternal.add(item.meta.externalId);
  }

  // Close the one-time backfill window once it has run (even if the platform
  // returned no media), so the next syncs track only the newest uploads. A
  // credit-capped partial run leaves it open so the remaining old videos are
  // backfilled on the next funded sync.
  const creditCapped = budgeted && trackVideos > 0 && wanted < trackVideos;
  if (doingBackfill && !creditCapped) {
    await query(
      `UPDATE channels SET "backfilled" = true, "updatedAt" = now() WHERE id = $1`,
      [channel.id],
    );
  }

  console.log(
    `[sync] ok ${channel.platform} @${channel.username}: ` +
      `${result.media.length} items, followers=${result.stats.followers}`,
  );
  return consumed;
}

type ChannelWithUser = ChannelRow & {
  user: { comboHash: string | null };
};

// Hourly full sweep. Channels are grouped by their attribution combo (the
// ip+ct_uid hash recorded when the channel was added); within each combo,
// pending backfills run before routine refreshes so scarce credits go to new
// channels first. A combo at 0 credits is skipped entirely ("pause").
export async function runSync(): Promise<void> {
  const raw = await query<
    ChannelRow & { comboHash: string | null }
  >(
    `SELECT c.*, u."comboHash" AS "comboHash"
     FROM channels c
     LEFT JOIN users u ON u.id = c."userId"
     ORDER BY c.id ASC`,
    [],
  );
  const channels: ChannelWithUser[] = raw.map((row) => ({
    ...row,
    user: { comboHash: row.comboHash },
  }));

  console.log(`[sync] ${channels.length} channel(s) to sync`);

  const groups = new Map<string, ChannelWithUser[]>();
  for (const channel of channels) {
    const combo = channel.user?.comboHash ?? comboHash(undefined, channel.userId);
    const list = groups.get(combo);
    if (list) list.push(channel);
    else groups.set(combo, [channel]);
  }

  for (const [combo, list] of Array.from(groups.entries())) {
    const { remaining } = await getCreditsStatus(combo);

    // A group with no YouTube channels that is out of ScrapeCreators credits
    // is skipped wholesale. Groups that include YouTube still run so their
    // YouTube channels keep syncing on the official API quota.
    const hasYouTube = list.some((c) => c.platform === "YOUTUBE");
    if (remaining <= 0 && !hasYouTube) {
      console.log(`[sync] skip ${list.length} channel(s): daily limit reached`);
      continue;
    }

    // Backfills first, then oldest-added refreshes.
    const ordered = [...list].sort(
      (a, b) =>
        Number(a.backfilled) - Number(b.backfilled) ||
        a.createdAt.getTime() - b.createdAt.getTime(),
    );

    let left = remaining;
    for (const channel of ordered) {
      // YouTube never spends the per-IP credit budget, so it always syncs.
      if (channel.platform === "YOUTUBE") {
        await syncChannel(channel);
        continue;
      }
      if (left <= 0) {
        console.log(`[sync] stop ${combo.slice(0, 8)}: daily limit reached`);
        continue;
      }
      const consumed = await syncChannel(channel, {
        comboHash: combo,
        remaining: left,
      });
      left -= consumed;
    }
  }
  console.log("[sync] done");
}
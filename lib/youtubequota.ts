// YouTube Data API v3 quota accounting.
//
// The official YouTube Data API has its own per-day budget (10,000 units/day
// on the free tier) which is entirely separate from the per-IP ScrapeCreators
// credits that limit Instagram and TikTok syncs. We count the units our calls
// consume (channels.list, playlistItems.list and videos.list all cost 1 unit)
// per IST day and surface the running total in the /admin panel. Counting is
// best-effort: a failed write must never break a YouTube fetch.

import { prisma } from "./db";
import { istDateKey } from "./credits";

export const YOUTUBE_DAILY_QUOTA = 10_000;
export const YOUTUBE_QUOTA_KEY = "youtubeQuota";

export interface YoutubeQuotaStatus {
  date: string;
  used: number;
  limit: number;
}

// Add `units` to today's IST usage. Upsert-with-fallback handles the rare
// concurrent first-write per day so counter drops are never lost.
export async function recordYoutubeQuota(units: number): Promise<void> {
  if (units <= 0) return;
  const date = istDateKey();
  try {
    await prisma.youtubeQuotaUsage.upsert({
      where: { date },
      create: { date, unitsUsed: units },
      update: { unitsUsed: { increment: units } },
    });
  } catch {
    await prisma.youtubeQuotaUsage
      .update({
        where: { date },
        data: { unitsUsed: { increment: units } },
      })
      .catch(() => {});
  }
}

export async function getYoutubeQuotaStatus(): Promise<YoutubeQuotaStatus> {
  const date = istDateKey();
  const row = await prisma.youtubeQuotaUsage.findUnique({ where: { date } });
  return { date, used: row?.unitsUsed ?? 0, limit: YOUTUBE_DAILY_QUOTA };
}
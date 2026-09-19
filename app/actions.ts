"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { LOCALES } from "@/lib/i18n";
import { syncChannel } from "@/lib/sync";
import { normalizeUsername, PLATFORM_VALUES } from "@/lib/types";
import type { PlatformValue } from "@/lib/types";
import { ensureVisitorId } from "@/lib/visitor";

export type AddChannelsResult =
  | { ok: true; added: string[]; message: string }
  | { ok: false; error: string };

// revalidatePath matches the actual rendered route path, and every page renders
// at one URL per locale (the default locale also at its bare path via the
// middleware rewrite). "/[locale]/accounts" never matches a real URL, so hit
// each concrete variant.
function revalidateAccountPages(): void {
  for (const locale of ["", ...LOCALES]) {
    revalidatePath(`${locale ? `/${locale}` : ""}/accounts`, "page");
  }
}

function revalidateHomePages(): void {
  for (const locale of ["", ...LOCALES]) {
    revalidatePath(`${locale ? `/${locale}` : ""}`, "page");
  }
}

function profileUrlFor(platform: PlatformValue, username: string): string {
  const handle = username.replace(/^@/, "");
  switch (platform) {
    case "YOUTUBE":
      return `https://www.youtube.com/@${handle}`;
    case "INSTAGRAM":
      return `https://www.instagram.com/${handle}/`;
    case "TIKTOK":
      return `https://www.tiktok.com/@${handle}`;
  }
}

// Parse a video-count input. NaN/blank -> fallback; clamped to [0, 200].
function parseVideoCount(raw: FormDataEntryValue | null, fallback: number): number {
  const n = Number(String(raw ?? "").trim());
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.round(n), 0), 200);
}

// Parse the optional "min like ratio %" alert threshold. Blank/non-numeric ->
// null (no check); otherwise clamped to [0, 100] with fractional values kept.
function parseMinLikeRatio(raw: FormDataEntryValue | null): number | null {
  const text = String(raw ?? "").trim();
  if (!text) return null;
  const n = Number(text);
  if (!Number.isFinite(n)) return null;
  return clampRatio(n);
}

// Clamp to [0, 100] and trim float noise to two decimals (e.g. 3.499 -> 3.5).
function clampRatio(n: number): number {
  return Math.round(Math.min(Math.max(n, 0), 100) * 100) / 100;
}

const MAX_HANDLES = 25;

// "mrbeast, @veritasium / mrbeast@tt" -> ["mrbeast", "veritasium"], deduped.
function parseHandles(raw: string): string[] {
  const seen = new Set<string>();
  const handles: string[] = [];
  for (const token of raw.split(/[\s,;]+/)) {
    const username = normalizeUsername(token);
    if (!username || seen.has(username)) continue;
    seen.add(username);
    handles.push(username);
    if (handles.length >= MAX_HANDLES) break;
  }
  return handles;
}

// Add one or more comma-separated handles in a single action, all on the
// platform picked in the form. A handle that the platform can't resolve is
// still saved so it shows up immediately and stays queued for the hourly cron.
export async function addChannels(
  formData: FormData,
): Promise<AddChannelsResult> {
  const handles = parseHandles(String(formData.get("usernames") ?? ""));
  if (handles.length === 0) {
    return { ok: false, error: "Enter at least one handle, e.g. @mrbeast, @veritasium." };
  }

  const rawPlatform = String(formData.get("platform") ?? "").toUpperCase();
  if (!PLATFORM_VALUES.includes(rawPlatform as PlatformValue)) {
    return { ok: false, error: "Pick a platform first." };
  }
  const platform = rawPlatform as PlatformValue;

  const userId = ensureVisitorId();
  const oldVideoCount = parseVideoCount(formData.get("oldVideoCount"), 8);
  // Latest window defaults back to the ongoing track whenever the counts are
  // absent — re-adding a handle must not turn tracking off unless it was set
  // to 0 explicitly.
  const latestVideoCount = parseVideoCount(formData.get("latestVideoCount"), 8);
  const minLikeRatio = parseMinLikeRatio(formData.get("minLikeRatio"));

  try {
    await prisma.user.createMany({ data: [{ id: userId }], skipDuplicates: true });

    const added: string[] = [];
    let syncedCount = 0;

    for (const username of handles) {
      // Re-adding the same handle on the SAME platform updates that row. A
      // different platform gets its own channel so both can be tracked (e.g.
      // @mrbeast on Instagram and TikTok separately).
      const existing = await prisma.channel.findFirst({
        where: { userId, username, platform },
      });

      let channel;
      if (existing) {
        channel = await prisma.channel.update({
          where: { id: existing.id },
          data: {
            platform,
            profileUrl: profileUrlFor(platform, username),
            oldVideoCount,
            latestVideoCount,
            minLikeRatio,
          },
        });
      } else {
        channel = await prisma.channel.upsert({
          where: {
            userId_platform_username: { userId, platform, username },
          },
          create: {
            userId,
            platform,
            username,
            displayName: username,
            externalId: username,
            profileUrl: profileUrlFor(platform, username),
            oldVideoCount,
            latestVideoCount,
            minLikeRatio,
          },
          update: {
            profileUrl: profileUrlFor(platform, username),
            oldVideoCount,
            latestVideoCount,
            minLikeRatio,
          },
        });
      }

      added.push(username);

      // Attempt an immediate first sync. Failures (e.g. missing YouTube key)
      // leave the channel queued for the hourly cron — adding must not error.
      try {
        await syncChannel(channel);
        const fresh = await prisma.channel.findUnique({
          where: { id: channel.id },
          select: { lastSyncedAt: true },
        });
        if (fresh?.lastSyncedAt) syncedCount += 1;
      } catch (err) {
        console.error(`[addChannels] sync @${username}:`, err);
      }
    }

    revalidateHomePages();
    revalidateAccountPages();

    const label = added.map((handle) => `@${handle}`).join(", ");
    const suffix =
      syncedCount === added.length ? " added and synced." : " added - syncing shortly.";
    return { ok: true, added, message: label + suffix };
  } catch (err) {
    console.error("[addChannels]", err);
    const detail = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Could not save the channels (${detail.slice(0, 160)})` };
  }
}

export type EditChannelResult =
  | { ok: true; channel: string }
  | { ok: false; error: string };

// Re-run a single channel's sync on demand (Refresh button on each card).
export async function refreshChannel(id: string): Promise<EditChannelResult> {
  try {
    const channel = await prisma.channel.findUnique({ where: { id } });
    if (!channel) return { ok: false, error: "Channel not found." };
    await syncChannel(channel);
    revalidateAccountPages();
    return { ok: true, channel: `@${channel.username}` };
  } catch (err) {
    console.error("[refreshChannel]", err);
    return { ok: false, error: "Refresh failed - is the database reachable?" };
  }
}

// Trim one tracked bucket (isBackfill=true = Old, false = Latest) to its own
// membership rule: Old holds videos published at/before the channel's addedAt
// (backfilled once); Latest only videos published after it. Rule-violating
// members are dropped (never moved between buckets), then the remaining videos
// are cut to the most recent `keep` by publish date — the same nearest-date
// logic as the backfill.
async function trimBucketToCount(
  channelId: string,
  isBackfill: boolean,
  keep: number,
  addedAt: Date,
): Promise<void> {
  const videos = await prisma.video.findMany({
    where: { channelId, isBackfill },
    orderBy: { publishedAt: "desc" },
    select: { id: true, publishedAt: true },
  });

  const violatesRule = (video: { publishedAt: Date | null }) =>
    isBackfill
      ? video.publishedAt != null && video.publishedAt > addedAt
      : video.publishedAt == null || video.publishedAt <= addedAt;

  const ruleBreakers = videos
    .filter(violatesRule)
    .map((video) => video.id);
  const overCap = videos
    .filter((video) => !violatesRule(video))
    .slice(keep)
    .map((video) => video.id);

  const drop = [...ruleBreakers, ...overCap];
  if (drop.length > 0) {
    await prisma.video.deleteMany({ where: { id: { in: drop } } });
  }
}

// Update a channel's video-config (Edit button on each card): old/latest
// count windows plus the optional min-like-ratio alert threshold. Lowered
// windows are trimmed to match right away; a raised Old window re-opens the
// backfill so the caller's follow-up refresh collects the older videos.
export async function editChannel(
  id: string,
  counts: {
    oldVideoCount: number;
    latestVideoCount: number;
    minLikeRatio: number | null;
  },
): Promise<EditChannelResult> {
  const oldVideoCount = Math.min(Math.max(Math.round(counts.oldVideoCount || 0), 0), 200);
  const latestVideoCount = Math.min(
    Math.max(Math.round(counts.latestVideoCount || 0), 0),
    200,
  );
  const minLikeRatio =
    counts.minLikeRatio == null ? null : clampRatio(counts.minLikeRatio);

  try {
    const channel = await prisma.channel.update({
      where: { id },
      data: { oldVideoCount, latestVideoCount, minLikeRatio },
    });

    // Lowered window on either bucket? Trim to that bucket's own rule
    // (publish date vs addedAt) immediately — never a cross-bucket move.
    await trimBucketToCount(channel.id, true, channel.oldVideoCount, channel.createdAt);
    await trimBucketToCount(channel.id, false, channel.latestVideoCount, channel.createdAt);

    // Raised Old window on an already-backfilled channel? Re-open the one-time
    // backfill so the immediate refresh picks up the additional older videos.
    if (channel.backfilled && channel.oldVideoCount > 0) {
      const oldTracked = await prisma.video.count({
        where: { channelId: channel.id, isBackfill: true },
      });
      if (channel.oldVideoCount > oldTracked) {
        await prisma.channel.update({
          where: { id: channel.id },
          data: { backfilled: false },
        });
      }
    }

    revalidateAccountPages();
    return { ok: true, channel: `@${channel.username}` };
  } catch (err) {
    console.error("[editChannel]", err);
    return { ok: false, error: "Could not update the channel." };
  }
}

// Remove a tracked channel and its entire history (Remove button on each card).
export async function removeChannel(id: string): Promise<EditChannelResult> {
  try {
    const channel = await prisma.channel.delete({ where: { id } });
    revalidateAccountPages();
    return { ok: true, channel: `@${channel.username}` };
  } catch (err) {
    console.error("[removeChannel]", err);
    return { ok: false, error: "Could not remove the channel - is it still there?" };
  }
}
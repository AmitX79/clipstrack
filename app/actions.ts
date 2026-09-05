"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { syncChannel } from "@/lib/sync";
import { normalizeUsername } from "@/lib/types";
import type { PlatformValue } from "@/lib/types";
import { ensureVisitorId } from "@/lib/visitor";

export type AddChannelResult =
  | { ok: true; synced: boolean; channel: string }
  | { ok: false; error: string };

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

export async function addChannel(
  formData: FormData,
): Promise<AddChannelResult> {
  const rawPlatform = String(formData.get("platform") ?? "").toUpperCase();
  const rawUsername = String(formData.get("username") ?? "");

  if (!["YOUTUBE", "INSTAGRAM", "TIKTOK"].includes(rawPlatform)) {
    return { ok: false, error: "Pick a platform first." };
  }
  const platform = rawPlatform as PlatformValue;

  const username = normalizeUsername(rawUsername);
  if (!username) {
    return { ok: false, error: "Enter a username, e.g. mrbeast." };
  }

  const userId = ensureVisitorId();
  const oldVideoCount = parseVideoCount(formData.get("oldVideoCount"), 8);
  // Latest window defaults to 0 only via an explicit 0 — anytime the channel
  // is re-added with the counts fields absent, keep the ongoing track on.
  const latestVideoCount = parseVideoCount(formData.get("latestVideoCount"), 8);

  try {
    await prisma.user.createMany({ data: [{ id: userId }], skipDuplicates: true });

    const channel = await prisma.channel.upsert({
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
      },
      update: {
        profileUrl: profileUrlFor(platform, username),
        oldVideoCount,
        latestVideoCount,
      },
    });

    // Attempt an immediate first sync. Failures (e.g. missing YouTube key)
    // leave the channel queued for the hourly cron — adding must not error.
    let synced = false;
    try {
      await syncChannel(channel);
      const fresh = await prisma.channel.findUnique({
        where: { id: channel.id },
        select: { lastSyncedAt: true },
      });
      synced = Boolean(fresh?.lastSyncedAt);
    } catch (err) {
      console.error(`[addChannel] sync @${username}:`, err);
    }

    revalidatePath("/");
    return { ok: true, synced, channel: `@${username}` };
  } catch (err) {
    console.error("[addChannel]", err);
    return {
      ok: false,
      error: "Could not save the channel — is the database reachable?",
    };
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
    revalidatePath("/tracked");
    revalidatePath("/accounts");
    return { ok: true, channel: `@${channel.username}` };
  } catch (err) {
    console.error("[refreshChannel]", err);
    return { ok: false, error: "Refresh failed — is the database reachable?" };
  }
}

// Update a channel's old/latest video-count config (Edit button on each card).
export async function editChannel(
  id: string,
  counts: { oldVideoCount: number; latestVideoCount: number },
): Promise<EditChannelResult> {
  const oldVideoCount = Math.min(Math.max(Math.round(counts.oldVideoCount || 0), 0), 200);
  const latestVideoCount = Math.min(
    Math.max(Math.round(counts.latestVideoCount || 0), 0),
    200,
  );

  try {
    const channel = await prisma.channel.update({
      where: { id },
      data: { oldVideoCount, latestVideoCount },
    });
    revalidatePath("/tracked");
    revalidatePath("/accounts");
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
    revalidatePath("/tracked");
    revalidatePath("/accounts");
    return { ok: true, channel: `@${channel.username}` };
  } catch (err) {
    console.error("[removeChannel]", err);
    return { ok: false, error: "Could not remove the channel — is it still there?" };
  }
}
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

  try {
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
      },
      update: {
        profileUrl: profileUrlFor(platform, username),
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
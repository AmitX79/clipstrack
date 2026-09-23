"use server";

import { revalidatePath } from "next/cache";
import { id, query, queryOne, tx, type ChannelRow } from "@/lib/db";
import { LOCALES } from "@/lib/i18n";
import { syncChannel, type SyncResult } from "@/lib/sync";
import {
  attributeAndBudget,
  DAILY_LIMIT_MESSAGE,
  requestComboHash,
} from "@/lib/credits";
import { claimRefreshCooldown, pruneRefreshCooldowns, REFRESH_COOLDOWN_MESSAGE } from "@/lib/refreshcooldown";
import {
  detectProfileUrl,
  isUrlLike,
  normalizeUsername,
  PLATFORM_LABELS,
  PLATFORM_VALUES,
} from "@/lib/types";
import type { PlatformValue } from "@/lib/types";
import { getVisitorId, setConsent, setVisitorId } from "@/lib/visitor";
import { touchActivity } from "@/lib/usercode";
import { DEFAULT_MAX_CHANNELS, SETTING_MAX_CHANNELS } from "@/lib/channels";

// Called when a visitor keeps cookies on (or refreshes the consent banner
// mid-flow). Writes the ct_consent choice AND the ct_uid identity cookie so
// the /accounts page resolves a stable User ID. Never called for declined
// visitors — those get no cookies at all from this action.
export async function allowConsent(): Promise<void> {
  const existing = await getVisitorId();
  const id = existing ?? crypto.randomUUID();
  await setVisitorId(id);
  await setConsent("1");
}

export type AddChannelsResult =
  | {
      ok: true;
      added: string[];
      // The upserted rows so the client can kick off each card's first sync
      // (refreshChannel) immediately, in parallel, without another round trip.
      channels: { id: string; platform: PlatformValue }[];
      message: string;
    }
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

// One entry = one handle on the platform it will actually be added to. A full
// profile URL is detected per-token (detected=true) and overrides the selected
// tab; a plain handle keeps the selected platform. Dedup is per platform, so
// the same handle can coexist on different platforms (e.g. @mrbeast on
// Instagram and TikTok).
interface ParsedHandle {
  username: string;
  platform: PlatformValue;
  detected: boolean;
}

// "mrbeast, @veritasium / mrbeast@tt, instagram.com/joe" -> entries. Handles
// and URLs can be mixed freely; each token is classified on its own. A URL
// that fails profile detection (video link, unknown host, malformed input) is
// rejected as a whole batch, not guessed at as a handle.
function parseHandles(
  raw: string,
  selected: PlatformValue,
): ParsedHandle[] | null {
  const seen = new Set<string>();
  const handles: ParsedHandle[] = [];
  for (const token of raw.split(/[\s,;]+/)) {
    const url = detectProfileUrl(token);
    if (!url && isUrlLike(token)) return null;
    const username = url ? url.username : normalizeUsername(token);
    if (!username) continue;
    const platform = url ? url.platform : selected;
    const key = `${platform}:${username}`;
    if (seen.has(key)) continue;
    seen.add(key);
    handles.push({ username, platform, detected: url != null });
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
  const rawPlatform = String(formData.get("platform") ?? "").toUpperCase();
  if (!PLATFORM_VALUES.includes(rawPlatform as PlatformValue)) {
    return { ok: false, error: "Pick a platform first." };
  }
  const selected = rawPlatform as PlatformValue;

  const handles = parseHandles(
    String(formData.get("usernames") ?? ""),
    selected,
  );
  if (handles === null) {
    return {
      ok: false,
      error:
        "Please paste a channel/profile link or handle, not a video link.",
    };
  }
  if (handles.length === 0) {
    return { ok: false, error: "Enter at least one handle, e.g. @mrbeast, @veritasium." };
  }

  // Consent gate (server-side): no ct_uid cookie means the visitor never
  // agreed to the consent notice, so refuse before creating any data.
  const userId = await getVisitorId();
  if (!userId) {
    return {
      ok: false,
      error: "Please agree to the notice before adding channels.",
    };
  }
  const oldVideoCount = parseVideoCount(formData.get("oldVideoCount"), 8);
  // Latest window defaults back to the ongoing track whenever the counts are
  // absent — re-adding a handle must not turn tracking off unless it was set
  // to 0 explicitly.
  const latestVideoCount = parseVideoCount(formData.get("latestVideoCount"), 8);
  const minLikeRatio = parseMinLikeRatio(formData.get("minLikeRatio"));

  // Per-visitor channel cap (scaling guard): only genuinely new channels count,
  // since re-adding an existing handle/URL updates that row in place. The cap
  // read, its settings seed, and the existing-handles list are all independent
  // — one batched transaction instead of two sequential queries.
  const [limitRow, , tracked] = await tx<
    [
      { value: string }[],
      unknown[],
      { platform: string; username: string }[],
    ]
  >([
    {
      text: `SELECT value FROM settings WHERE key = $1`,
      params: [SETTING_MAX_CHANNELS],
    },
    {
      text: `INSERT INTO settings (key, value, "updatedAt", "createdAt")
             VALUES ($1, $2, now(), now())
             ON CONFLICT (key) DO NOTHING`,
      params: [SETTING_MAX_CHANNELS, String(DEFAULT_MAX_CHANNELS)],
    },
    {
      text: `SELECT platform, username FROM channels WHERE "userId" = $1`,
      params: [userId],
    },
  ]);
  const maxChannelsRow = limitRow[0];
  const maxChannels =
    maxChannelsRow !== undefined &&
    Number.isInteger(Number(maxChannelsRow.value)) &&
    Number(maxChannelsRow.value) > 0
      ? Number(maxChannelsRow.value)
      : DEFAULT_MAX_CHANNELS;
  const trackedKeys = new Set(tracked.map((c) => `${c.platform}:${c.username}`));
  const newChannels = handles.filter(
    (h) => !trackedKeys.has(`${h.platform}:${h.username}`),
  ).length;
  if (trackedKeys.size + newChannels > maxChannels) {
    return {
      ok: false,
      error: `You can track up to ${maxChannels} channels. Remove some before adding more.`,
    };
  }

  try {
    // Fast path: insert/upsert every row in ONE transaction (a single round
    // trip no matter how many handles) and return immediately. The first sync
    // runs from the client per card (refreshChannel, in parallel), so adding
    // never blocks the page on the slowest platform scrape (~11s Instagram).
    // Channels whose scrape fails stay queued for the scheduled cron.
    const added: string[] = [];
    const statements: { text: string; params: unknown[] }[] = handles.map(
      (h) => ({
        text: `INSERT INTO channels (
           id, "userId", platform, username, "displayName", "externalId",
           "profileUrl", "oldVideoCount", "latestVideoCount", "minLikeRatio",
           "createdAt", "updatedAt"
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now())
         ON CONFLICT ("userId", platform, username) DO UPDATE SET
           platform = EXCLUDED.platform,
           "profileUrl" = EXCLUDED."profileUrl",
           "oldVideoCount" = EXCLUDED."oldVideoCount",
           "latestVideoCount" = EXCLUDED."latestVideoCount",
           "minLikeRatio" = EXCLUDED."minLikeRatio",
           "updatedAt" = now()
         RETURNING *`,
        params: [
          id(),
          userId,
          h.platform,
          h.username,
          h.username,
          h.username,
          profileUrlFor(h.platform, h.username),
          oldVideoCount,
          latestVideoCount,
          minLikeRatio,
        ],
      }),
    );
    const rowsByHandle = await tx<ChannelRow[][]>(statements);
    for (const h of handles) added.push(h.username);

    revalidateHomePages();
    revalidateAccountPages();

    const channels = handles.map((h, i) => ({
      id: rowsByHandle[i][0].id,
      platform: h.platform,
    }));

    // Snapshot the user-visible result, including when a pasted URL resolved
    // to a platform other than the selected tab ("Detected as Instagram - ...").
    const plain = handles.filter((h) => !h.detected);
    const detected = handles.filter((h) => h.detected);

    const parts: string[] = [];
    if (plain.length > 0) {
      parts.push(`${plain.map((h) => `@${h.username}`).join(", ")} added - syncing.`);
    }
    parts.push(
      ...detected.map(
        (h) => `Detected as ${PLATFORM_LABELS[h.platform]} - added @${h.username}`,
      ),
    );
    const message = parts.join(" ");
    return { ok: true, added, channels, message };
  } catch (err) {
    console.error("[addChannels]", err);
    const detail = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Could not save the channels (${detail.slice(0, 160)})` };
  }
}

export type EditChannelResult =
  | {
      ok: true;
      channel: string;
      // When the run could not cover the full tracked window, these counts let
      // the card say "12/18 videos updated" instead of silently looking done.
      // `capped` distinguishes an exhausted IG/TikTok credit budget from a
      // platform shortfall beyond its own pagination ceiling.
      partial?: { fetched: number; total: number; capped: boolean };
    }
  | { ok: false; error: string };

// Re-run a single channel's sync on demand (Refresh button on each card).
// `refreshAll` covers every video the card already displays (not just the
// rolling Latest window), so no row is left on a stale timestamp while its
// neighbours move. When a credit cap or pagination ceiling still cuts it
// short, the shortfall is reported back so the UI can say so plainly.
//
// `bypassCooldown` lets the add/edit flows (which already paid for an initial
// sync and should never be slowed by the just-refreshed throttle) force
// through the per-combo cooldown. Manual card refreshes keep the throttle.
export async function refreshChannel(
  id: string,
  opts?: { bypassCooldown?: boolean },
): Promise<EditChannelResult> {
  try {
    const channel = await queryOne<ChannelRow>(
      `SELECT * FROM channels WHERE id = $1`,
      [id],
    );
    if (!channel) return { ok: false, error: "Channel not found." };

    // Any refresh counts as visitor activity for the inactivity cleanup.
    await touchActivity(channel.userId);

    // Instagram/TikTok refreshes cost credits against the visitor's daily
    // ScrapeCreators budget. YouTube is never credit-gated.
    let result: SyncResult;
    if (channel.platform === "YOUTUBE") {
      result = await syncChannel(channel, { refreshAll: true });
    } else {
      const combo = await requestComboHash(channel.userId);
      const cooldown = opts?.bypassCooldown
        ? true
        : await claimRefreshCooldown(combo);
      if (!cooldown) {
        return { ok: false, error: REFRESH_COOLDOWN_MESSAGE };
      }
      const { remaining } = await attributeAndBudget(channel.userId, combo);
      if (remaining <= 0) {
        return { ok: false, error: DAILY_LIMIT_MESSAGE };
      }
      result = await syncChannel(channel, {
        comboHash: combo,
        remaining,
        refreshAll: true,
      });
    }
    const total = result.existing > 0 ? result.existing : result.wanted;
    void pruneRefreshCooldowns();
    const partial =
      result.fetched < total
        ? {
            fetched: result.fetched,
            total,
            capped: result.creditCapped,
          }
        : undefined;
    revalidateAccountPages();
    return {
      ok: true,
      channel: `@${channel.username}`,
      ...(partial ? { partial } : {}),
    };
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
  const videos = await query<{ id: string; publishedAt: Date | null }>(
    `SELECT id, "publishedAt" FROM videos
     WHERE "channelId" = $1 AND "isBackfill" = $2
     ORDER BY "publishedAt" DESC`,
    [channelId, isBackfill],
  );

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
    await query(`DELETE FROM videos WHERE id = ANY($1)`, [drop]);
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
    let channel = await queryOne<ChannelRow>(
      `UPDATE channels SET
         "oldVideoCount" = $1, "latestVideoCount" = $2, "minLikeRatio" = $3, "updatedAt" = now()
       WHERE id = $4
       RETURNING *`,
      [oldVideoCount, latestVideoCount, minLikeRatio, id],
    );
    if (!channel) return { ok: false, error: "Could not update the channel." };

    // Editing a channel counts as visitor activity for the inactivity cleanup.
    await touchActivity(channel.userId);

    // Lowered window on either bucket? Trim to that bucket's own rule
    // (publish date vs addedAt) immediately — never a cross-bucket move.
    await trimBucketToCount(channel.id, true, channel.oldVideoCount, channel.createdAt);
    await trimBucketToCount(channel.id, false, channel.latestVideoCount, channel.createdAt);

    // Raised Old window on an already-backfilled channel? Re-open the one-time
    // backfill so the immediate refresh picks up the additional older videos.
    if (channel.backfilled && channel.oldVideoCount > 0) {
      const [{ count }] = await query<{ count: number }>(
        `SELECT count(*) AS count FROM videos WHERE "channelId" = $1 AND "isBackfill" = true`,
        [channel.id],
      );
      if (channel.oldVideoCount > count) {
        channel = (await queryOne<ChannelRow>(
          `UPDATE channels SET "backfilled" = false, "updatedAt" = now() WHERE id = $1 RETURNING *`,
          [channel.id],
        ))!;
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
    const channel = await queryOne<ChannelRow>(
      `DELETE FROM channels WHERE id = $1 RETURNING id, username, "userId"`,
      [id],
    );
    if (!channel) {
      return { ok: false, error: "Could not remove the channel - is it still there?" };
    }
    // Removing counts as visitor activity for the inactivity cleanup.
    await touchActivity(channel.userId).catch(() => {});
    revalidateAccountPages();
    return { ok: true, channel: `@${channel.username}` };
  } catch (err) {
    console.error("[removeChannel]", err);
    return { ok: false, error: "Could not remove the channel - is it still there?" };
  }
}
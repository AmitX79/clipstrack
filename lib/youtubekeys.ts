// Official YouTube Data API v3 key management, shared by the hourly sync, the
// add/refresh request path and the /admin panel.
//
// A single API key has a fixed 10,000 units/day free quota, which caps how many
// YouTube channels the whole app can sync per day. This module rotates across
// several keys so the effective daily capacity becomes N x 10,000 units:
//
//   - keys live in the `youtube_keys` table so the admin can add/remove/rotate
//     them without redeploying; the first run seeds from YOUTUBE_API_KEY (and
//     the comma-separated YOUTUBE_API_KEYS) so env-based setup keeps working
//   - each request uses the least-used enabled key that still has quota left
//   - `unitsUsed` is tracked per key per IST day and reset lazily on rollover
//   - a key that hits its limit (or the API rejects it) is flagged
//     `quotaExhausted` and skipped until the next day (or an admin re-enables).

import { id, query, queryOne } from "./db";
import { istDateKey } from "./credits";
import { YOUTUBE_DAILY_QUOTA } from "./youtubequota";
import { maskKey } from "./scrapekeys";

export { YOUTUBE_DAILY_QUOTA };

// Env-provided keys, de-duplicated. YOUTUBE_API_KEY is the primary; the
// optional YOUTUBE_API_KEYS adds more, comma- or whitespace-separated.
function envKeys(): { label: string; key: string }[] {
  const raw = [
    process.env.YOUTUBE_API_KEY,
    ...(process.env.YOUTUBE_API_KEYS ?? "").split(/[\s,]+/),
  ];
  const seen = new Set<string>();
  const keys: { label: string; key: string }[] = [];
  for (const value of raw) {
    const key = value?.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    keys.push({ label: keys.length === 0 ? "env" : `env-${keys.length + 1}`, key });
  }
  return keys;
}

type YoutubeKeyRow = {
  id: string;
  label: string;
  key: string;
  active: boolean;
  quotaExhausted: boolean;
  unitsUsed: number;
  quotaDate: string | null;
  lastUsedAt: Date | null;
  createdAt: Date;
};

// Seed the primary key(s) from the environment on first run. Idempotent across
// serverless instances thanks to the unique constraint on `key`; skipped when
// managed keys already exist.
let seedPromise: Promise<void> | null = null;
export function seedYoutubeKeys(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const keys = envKeys();
      if (keys.length === 0) return;
      const [{ count }] = await query<{ count: number }>(
        `SELECT count(*) AS count FROM youtube_keys`,
        [],
      );
      if (count > 0) return;
      for (const { label, key } of keys) {
        await query(
          `INSERT INTO youtube_keys (id, label, key, "active", "quotaExhausted", "unitsUsed", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, true, false, 0, now(), now())`,
          [id(), label, key],
        ).catch(() => {});
      }
    })();
  }
  return seedPromise;
}

// Zero the per-day counter (and clear the exhausted flag) for any key that
// still belongs to a previous IST day, so the new day starts fresh.
async function rollDay(): Promise<void> {
  const today = istDateKey();
  await query(
    `UPDATE youtube_keys SET "unitsUsed" = 0, "quotaExhausted" = false, "quotaDate" = $1, "updatedAt" = now()
     WHERE "quotaDate" IS DISTINCT FROM $1`,
    [today],
  ).catch(() => {});
}

// The next key to use: the enabled, non-exhausted key with the most quota left
// (ties broken by least-recently-used). Null when every key is used up.
export async function nextYoutubeKey(): Promise<{
  id: string;
  label: string;
  key: string;
} | null> {
  await seedYoutubeKeys();
  await rollDay();
  const row = await queryOne<YoutubeKeyRow>(
    `SELECT * FROM youtube_keys
     WHERE "active" = true AND "quotaExhausted" = false AND "unitsUsed" < $1
     ORDER BY "unitsUsed" ASC, "lastUsedAt" ASC
     LIMIT 1`,
    [YOUTUBE_DAILY_QUOTA],
  );
  return row ? { id: row.id, label: row.label, key: row.key } : null;
}

// Bill `units` to a key and mark it exhausted when it reaches the daily quota.
export async function recordYoutubeUnits(
  id: string,
  units: number,
): Promise<void> {
  if (units <= 0) return;
  try {
    const row = await queryOne<YoutubeKeyRow>(
      `UPDATE youtube_keys SET "unitsUsed" = "unitsUsed" + $1, "lastUsedAt" = now(), "updatedAt" = now()
       WHERE id = $2 RETURNING *`,
      [units, id],
    );
    if (row && row.unitsUsed >= YOUTUBE_DAILY_QUOTA && !row.quotaExhausted) {
      await query(
        `UPDATE youtube_keys SET "quotaExhausted" = true, "updatedAt" = now() WHERE id = $1`,
        [id],
      );
    }
  } catch {
    // Best-effort accounting must never break a YouTube fetch.
  }
}

export async function markYoutubeKeyExhausted(id: string): Promise<void> {
  await query(
    `UPDATE youtube_keys SET "quotaExhausted" = true, "lastUsedAt" = now(), "updatedAt" = now() WHERE id = $1`,
    [id],
  ).catch(() => {});
}

export type AdminYoutubeKey = {
  id: string;
  label: string;
  keyMasked: string;
  active: boolean;
  quotaExhausted: boolean;
  unitsUsed: number;
  limit: number;
  quotaDate: string | null;
  lastUsedAt: Date | null;
  createdAt: Date;
};

export async function adminYoutubeKeys(): Promise<AdminYoutubeKey[]> {
  await seedYoutubeKeys();
  await rollDay();
  const keys = await query<YoutubeKeyRow>(
    `SELECT * FROM youtube_keys ORDER BY "active" DESC, "createdAt" ASC`,
    [],
  );
  return keys.map((key) => ({
    id: key.id,
    label: key.label,
    keyMasked: maskKey(key.key),
    active: key.active,
    quotaExhausted: key.quotaExhausted,
    unitsUsed: key.unitsUsed,
    limit: YOUTUBE_DAILY_QUOTA,
    quotaDate: key.quotaDate,
    lastUsedAt: key.lastUsedAt,
    createdAt: key.createdAt,
  }));
}

export interface YoutubeQuotaSummary {
  used: number;
  limit: number;
  activeKeys: number;
  totalKeys: number;
}

// Total capacity across active keys (activeKeys x 10,000) plus today's usage.
export async function getYoutubeQuotaSummary(): Promise<YoutubeQuotaSummary> {
  const keys = await adminYoutubeKeys();
  const active = keys.filter((key) => key.active);
  const used = keys.reduce((sum, key) => sum + key.unitsUsed, 0);
  return {
    used,
    limit: active.length * YOUTUBE_DAILY_QUOTA,
    activeKeys: active.length,
    totalKeys: keys.length,
  };
}
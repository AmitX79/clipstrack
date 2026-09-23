// ScrapeCreators API-key management, shared by the cron, the hourly sync and
// the /admin panel.
//
// Keys live in the `scrape_keys` table so the admin can add/remove/rotate them
// without redeploying. The first run seeds a key from SCRAPECREATORS_API_KEY
// so deployment-based configuration keeps working out of the box. Rotation:
// each request uses the least-recently-used enabled key; a key that returns a
// quota failure is flagged `quotaExhausted` and skipped until the balance is
// refreshed.

import { id, query, queryOne } from "./db";

export const SCRAPECREATORS_API = "https://api.scrapecreators.com";
export const SCRAPECREATORS_BALANCE_PATH = "/v1/account/credit-balance";

// How stale a fetched balance may be before refreshKeyBalances refetches it.
const BALANCE_TTL_MS = 15 * 60 * 1000;

// In-flight cap per key. With `keys × cap` total slots, the provider never
// sees a pile-up of dozens of concurrent feed walks (the 30s+ pathology), but
// several keys still parallelize cleanly.
export const PER_KEY_IN_FLIGHT_CAP = 2;

// A request slot must never live longer than this; anything older is reset by
// runScrapeSlotJanitor (a crashed/timed-out worker isolate can strand counts).
const SLOT_STALE_MS = 90 * 1000;

let slotsEnsured: Promise<void> | null = null;
function ensureScrapeSlots(): Promise<void> {
  if (!slotsEnsured) {
    slotsEnsured = (async () => {
      await query(
        `ALTER TABLE scrape_keys
           ADD COLUMN IF NOT EXISTS "inFlight" integer NOT NULL DEFAULT 0,
           ADD COLUMN IF NOT EXISTS "inFlightAt" timestamptz`,
        [],
      ).catch((e) => console.error("[scrape] slot columns failed:", e));
    })();
  }
  return slotsEnsured;
}

// Try to claim one in-flight slot on a key (atomic against every isolate).
// Returns true when the key had capacity; false when at capacity (caller
// should move on to the next key).
export async function acquireScrapeSlot(keyId: string): Promise<boolean> {
  await ensureScrapeSlots();
  const rows = await query<{ id: string }>(
    `UPDATE scrape_keys
       SET "inFlight" = "inFlight" + 1,
           "inFlightAt" = now(),
           "lastUsedAt" = now(),
           "updatedAt" = now()
     WHERE id = $1
       AND "active" = true
       AND "quotaExhausted" = false
       AND "inFlight" < $2
     RETURNING id`,
    [keyId, PER_KEY_IN_FLIGHT_CAP],
  );
  return rows.length > 0;
}

export async function releaseScrapeSlot(keyId: string): Promise<void> {
  await query(
    `UPDATE scrape_keys
       SET "inFlight" = GREATEST("inFlight" - 1, 0), "updatedAt" = now()
     WHERE id = $1`,
    [keyId],
  ).catch(() => {});
}

// Reset slot counts stranded by an isolate that died mid-request. Cheap and
// idempotent; guarded to run at most ~once a minute per isolate.
let janitorAt = 0;
export async function runScrapeSlotJanitor(): Promise<void> {
  const now = Date.now();
  if (now - janitorAt < 60_000) return;
  janitorAt = now;
  await query(
    `UPDATE scrape_keys
       SET "inFlight" = 0, "updatedAt" = now()
     WHERE "inFlight" > 0 AND "inFlightAt" < now() - interval '${Math.floor(
       SLOT_STALE_MS / 1000,
     )} seconds'`,
    [],
  ).catch(() => {});
}

type ScrapeKeyRow = {
  id: string;
  label: string;
  key: string;
  active: boolean;
  quotaExhausted: boolean;
  remainingCredits: number | null;
  lastCheckedAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
};

// Seed the primary key from the environment on first run. Idempotent across
// serverless instances thanks to the unique constraint on `key`; skipped when
// managed keys already exist.
let seedPromise: Promise<void> | null = null;
export function seedScrapeKeys(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const envKey = process.env.SCRAPECREATORS_API_KEY;
      if (!envKey) return;
      const exists = await queryOne<{ id: string }>(
        `SELECT id FROM scrape_keys WHERE key = $1 LIMIT 1`,
        [envKey],
      );
      if (exists) return;
      const [{ count }] = await query<{ count: number }>(
        `SELECT count(*) AS count FROM scrape_keys`,
        [],
      );
      if (count > 0) return;
      await query(
        `INSERT INTO scrape_keys (id, label, key, "active", "quotaExhausted", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, true, false, now(), now())`,
        [id(), "env", envKey],
      ).catch(() => {});
    })();
  }
  return seedPromise;
}

// Enabled keys for request rotation, least-recently-used first. Skips keys
// that are inactive or flagged quota-exhausted.
export async function enabledScrapeKeys(): Promise<ScrapeKeyRow[]> {
  await seedScrapeKeys();
  return query<ScrapeKeyRow>(
    `SELECT * FROM scrape_keys
     WHERE "active" = true AND "quotaExhausted" = false
     ORDER BY "lastUsedAt" ASC`,
    [],
  );
}

export async function markScrapeKeyExhausted(id: string): Promise<void> {
  await query(
    `UPDATE scrape_keys SET "quotaExhausted" = true, "lastUsedAt" = now(), "remainingCredits" = 0, "updatedAt" = now()
     WHERE id = $1`,
    [id],
  ).catch(() => {});
}

export async function markScrapeKeyOk(id: string): Promise<void> {
  await query(
    `UPDATE scrape_keys SET "quotaExhausted" = false, "lastUsedAt" = now(), "updatedAt" = now()
     WHERE id = $1`,
    [id],
  ).catch(() => {});
}

// Fetch a key's remaining ScrapeCreators credits from the balance endpoint.
// Returns the parsed count, or null when the key has no stored balance yet.
export async function fetchKeyBalance(
  apiKey: string,
): Promise<number | null> {
  const res = await fetch(
    `${SCRAPECREATORS_API}${SCRAPECREATORS_BALANCE_PATH}`,
    { headers: { "x-api-key": apiKey }, cache: "no-store" },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    creditCount?: number;
    credits?: number;
    remainingCredits?: number;
  };
  const count =
    data.creditCount ?? data.credits ?? data.remainingCredits;
  return typeof count === "number" && Number.isFinite(count)
    ? Math.max(0, Math.round(count))
    : null;
}

// Refresh stored balances for every managed key. `force` bypasses the TTL
// (used by the admin panel's refresh control). Keys that come back exhausted
// or empty are re-flagged so rotation skips them.
export async function refreshKeyBalances(force = false): Promise<void> {
  await seedScrapeKeys();
  const keys = await query<ScrapeKeyRow>(
    `SELECT * FROM scrape_keys ORDER BY "createdAt" ASC`,
    [],
  );
  const now = Date.now();
  for (const key of keys) {
    if (
      !force &&
      key.lastCheckedAt &&
      now - key.lastCheckedAt.getTime() < BALANCE_TTL_MS
    ) {
      continue;
    }
    try {
      const count = await fetchKeyBalance(key.key);
      if (count == null) continue;
      await query(
        `UPDATE scrape_keys
         SET "remainingCredits" = $1, "quotaExhausted" = $2, "lastCheckedAt" = now(), "updatedAt" = now()
         WHERE id = $3`,
        [count, count <= 0, key.id],
      );
    } catch {
      // Network/parse hiccup - keep whatever balance we had.
    }
  }
}

export type AdminScrapeKey = {
  id: string;
  label: string;
  keyMasked: string;
  active: boolean;
  quotaExhausted: boolean;
  remainingCredits: number | null;
  lastCheckedAt: Date | null;
  createdAt: Date;
};

export async function adminScrapeKeys(): Promise<AdminScrapeKey[]> {
  await seedScrapeKeys();
  const keys = await query<ScrapeKeyRow>(
    `SELECT * FROM scrape_keys ORDER BY "active" DESC, "createdAt" ASC`,
    [],
  );
  return keys.map((key) => ({
    id: key.id,
    label: key.label,
    keyMasked: maskKey(key.key),
    active: key.active,
    quotaExhausted: key.quotaExhausted,
    remainingCredits: key.remainingCredits,
    lastCheckedAt: key.lastCheckedAt,
    createdAt: key.createdAt,
  }));
}

export function maskKey(key: string): string {
  if (key.length <= 8) return "•".repeat(key.length);
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}
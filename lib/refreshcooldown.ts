// Per-combo refresh cooldown. A "combo" is an (IP + user) identity — the same
// bucket the daily credit limit is charged against (see credits.ts). Charged
// refreshes are throttled to one per ~REFRESH_COOLDOWN_MS per combo so a
// double-click or an auto-retry can't fire two full multi-page walks at once,
// which is exactly the input mix that used to pile requests onto the
// ScrapeCreators key (the 30s+ refresh pathology).
//
// Keyed on combo rather than channel so two channels refreshed in parallel by
// the same user don't stall each other, and never blocks the cron (it runs
// unflagged). Cooldown is claimable via the atomic upsert below, so concurrent
// calls from different Worker isolates still agree on who won.
//
// New-channel sync bypasses the cooldown (bypassCooldown) so the add flow's
// immediate first fetch is never blocked.

import { query } from "./db";

const REFRESH_COOLDOWN_MS = 5_000;

export const REFRESH_COOLDOWN_MESSAGE =
  "Just refreshed - the fetch is still running. Please wait a few seconds.";

let ensurePromise: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      await query(
        `CREATE TABLE IF NOT EXISTS refresh_cooldowns (
           "comboHash" text PRIMARY KEY,
           "triggeredAt" timestamptz NOT NULL
         )`,
        [],
      ).catch((e) => console.error("[cooldown] table create failed:", e));
    })();
  }
  return ensurePromise;
}

// Returns true when the combo may proceed now (claim succeeds), false when it
// is still inside the cooldown window (a refresh for this combo already ran
// within the last ~5s and its request is very likely still in flight).
export async function claimRefreshCooldown(
  comboHash: string,
): Promise<boolean> {
  await ensureTable();
  const rows = await query<{ comboHash: string }>(
    `INSERT INTO refresh_cooldowns ("comboHash", "triggeredAt")
     VALUES ($1, now())
     ON CONFLICT ("comboHash")
       DO UPDATE SET "triggeredAt" = EXCLUDED."triggeredAt"
       WHERE refresh_cooldowns."triggeredAt" <= now() - interval '${Math.floor(
         REFRESH_COOLDOWN_MS / 1000,
       )} seconds'
     RETURNING "comboHash"`,
    [comboHash],
  );
  return rows.length > 0;
}

// Opportunistic cleanup: keep the table tiny (one row per combo, but combos
// drift with time-of-day rotations). Runs at most ~once per 5 min per isolate,
// piggybacked on cooldown claims that pass.
let pruneAt = 0;
export async function pruneRefreshCooldowns(): Promise<void> {
  const now = Date.now();
  if (now - pruneAt < 5 * 60_000) return;
  pruneAt = now;
  await query(
    `DELETE FROM refresh_cooldowns
     WHERE "triggeredAt" < now() - interval '1 hour'`,
    [],
  ).catch(() => {});
}

export { REFRESH_COOLDOWN_MS };
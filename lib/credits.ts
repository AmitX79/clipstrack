// Per-IP+ct_uid daily credit system (anti-abuse rate limiting) for
// Instagram and TikTok syncs only. YouTube syncs use the official YouTube
// Data API v3 quota (10,000 units/day) and are never charged here.
//
// Each Instagram/TikTok video fetched by a sync costs 1 credit against a
// per-visitor daily budget (default 100). The budget resets at midnight IST.
// Two identities can be resolved:
//   - request time: the current request's IP + ct_uid cookie
//   - cron time:     the combo recorded on the User row at request time
//                    (the hourly cron has no request IP)
//
// All "day" boundaries use the Asia/Kolkata date string (YYYY-MM-DD), so the
// reset is exactly midnight IST and never drifts with the deployment region.

import { createHash } from "crypto";
import { headers } from "next/headers";
import { id, query, queryOne, tx } from "./db";
import { deriveUserCode } from "./usercode";

export const DAILY_LIMIT_MESSAGE =
  "Instagram/TikTok daily limit reached - YouTube keeps working. Resumes at midnight IST.";

const DEFAULT_DAILY_LIMIT = 100;
export const SETTING_DAILY_LIMIT = "dailyCreditLimit";

// The IST (Asia/Kolkata, UTC+5:30) day key for a given instant.
export function istDateKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// Client IP from the request headers. Vercel passes the peer address as the
// first entry of x-forwarded-for; x-real-ip is a fallback for other hosts.
export async function getClientIp(): Promise<string | undefined> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || undefined;
}

// Stable per-(IP, uid) identifier. Guards the daily limiter against cookie
// rotation on the same IP; no raw IP ever lands in the DB.
export function comboHash(ip: string | undefined, uid: string): string {
  return createHash("sha256").update(`${ip ?? "anon"}|${uid}`).digest("hex");
}

// The current request's combo (IP + ct_uid). Only call where the visitor
// cookie is appropriate (server actions / pages that already identify the
// visitor).
export async function requestComboHash(uid: string): Promise<string> {
  return comboHash(await getClientIp(), uid);
}

// Resolve the combo to charge for a channel: the request-time combo, else the
// stored one, else a uid-only fallback so the cron still imposes a budget.
export function resolveAttribution(
  requestCombo: string | null,
  storedCombo: string | null,
  uid: string,
): string {
  return requestCombo ?? storedCombo ?? comboHash(undefined, uid);
}

// The editable daily credit limit from /admin (Setting), defaulting to 100.
// The row self-seeds on first read so the value is never hard-coded at runtime.
export async function getDailyLimit(): Promise<number> {
  const row = await queryOne<{ value: string }>(
    `SELECT value FROM settings WHERE key = $1`,
    [SETTING_DAILY_LIMIT],
  );
  if (row) {
    const n = Number(row.value);
    if (Number.isInteger(n) && n > 0) return n;
  }
  await query(
    `INSERT INTO settings (key, value, "updatedAt", "createdAt")
     VALUES ($1, $2, now(), now())
     ON CONFLICT (key) DO NOTHING`,
    [SETTING_DAILY_LIMIT, String(DEFAULT_DAILY_LIMIT)],
  ).catch(() => {});
  return DEFAULT_DAILY_LIMIT;
}

export interface CreditsStatus {
  date: string;
  used: number;
  limit: number;
  remaining: number;
}

// Effective daily budget for a combo: the visitor's permanent per-user daily
// limit (dailyOverride) if one was set on /admin, else the global limit, plus
// any one-time bonus top-up.
function budgetFromUserCode(
  globalLimit: number,
  userCode:
    | { dailyOverride: number | null; bonusCredits: number }
    | null
    | undefined,
): number {
  const base = userCode?.dailyOverride ?? globalLimit;
  return base + (userCode?.bonusCredits ?? 0);
}

// The global daily limit row (editable on /admin), self-seeding on first read.
// The seed is an idempotent INSERT, so it can live inside the same batched
// transaction as the SELECT — no extra round trip.
function dailyLimitReadAndSeedStatement(): {
  text: string;
  params: unknown[];
}[] {
  return [
    {
      text: `SELECT value FROM settings WHERE key = $1`,
      params: [SETTING_DAILY_LIMIT],
    },
    {
      text: `INSERT INTO settings (key, value, "updatedAt", "createdAt")
             VALUES ($1, $2, now(), now())
             ON CONFLICT (key) DO NOTHING`,
      params: [SETTING_DAILY_LIMIT, String(DEFAULT_DAILY_LIMIT)],
    },
  ];
}

function dailyLimitFromRow(row: { value: string } | undefined): number {
  if (!row) return DEFAULT_DAILY_LIMIT;
  const n = Number(row.value);
  return Number.isInteger(n) && n > 0 ? n : DEFAULT_DAILY_LIMIT;
}

export async function getCreditsStatus(
  combo: string | null,
): Promise<CreditsStatus> {
  const date = istDateKey();
  if (!combo) {
    const globalLimit = await getDailyLimit();
    return { date, used: 0, limit: globalLimit, remaining: globalLimit };
  }
  // All reads in one HTTP transaction (single round trip): the global daily
  // limit (+ its seed) alongside the visitor's override/bonus and today's use.
  const [limitRows, , userCodeRows, usageRows] = await tx<
    [
      { value: string }[],
      unknown[],
      { dailyOverride: number | null; bonusCredits: number }[],
      { creditsUsed: number }[],
    ]
  >([
    ...dailyLimitReadAndSeedStatement(),
    {
      text: `SELECT "dailyOverride", "bonusCredits" FROM user_codes WHERE "comboHash" = $1 LIMIT 1`,
      params: [combo],
    },
    {
      text: `SELECT "creditsUsed" FROM credit_usage WHERE "comboHash" = $1 AND date = $2`,
      params: [combo, date],
    },
  ]);
  const globalLimit = dailyLimitFromRow(limitRows[0]);
  const limit = budgetFromUserCode(globalLimit, userCodeRows[0]);
  const used = usageRows[0]?.creditsUsed ?? 0;
  return { date, used, limit, remaining: Math.max(0, limit - used) };
}

export interface BudgetSnapshot {
  used: number;
  limit: number;
  remaining: number;
}

// Attach a visitor's request-time combo AND read their effective daily budget
// in ONE HTTP transaction. The static batch orders the writes before the
// reads, so the reads observe the freshly upserted comboHash/bonus row in the
// same round trip — no separate attribution step to pay for.
export async function attributeAndBudget(
  userId: string,
  combo: string,
): Promise<BudgetSnapshot> {
  const date = istDateKey();
  const [, , , limitRows, , userCodeRows, usageRows] = await tx<
    [
      unknown[], // users ensure
      unknown[], // users combo upsert
      unknown[], // user_codes upsert
      { value: string }[], // settings daily limit
      unknown[], // settings seed
      { dailyOverride: number | null; bonusCredits: number }[],
      { creditsUsed: number }[],
    ]
  >([
    {
      text: `INSERT INTO users (id, "lastActive", "createdAt", "updatedAt")
             VALUES ($1, now(), now(), now())
             ON CONFLICT (id) DO NOTHING`,
      params: [userId],
    },
    {
      text: `INSERT INTO users (id, "comboHash", "lastActive", "createdAt", "updatedAt")
             VALUES ($1, $2, now(), now(), now())
             ON CONFLICT (id) DO UPDATE SET
               "comboHash" = $2, "lastActive" = now(), "updatedAt" = now()`,
      params: [userId, combo],
    },
    {
      text: `INSERT INTO user_codes (id, "userId", code, "comboHash", "updatedAt")
             VALUES ($1, $2, $3, $4, now())
             ON CONFLICT ("userId") DO UPDATE SET
               "comboHash" = COALESCE(EXCLUDED."comboHash", user_codes."comboHash"),
               "updatedAt" = now()`,
      params: [id(), userId, deriveUserCode(userId), combo],
    },
    ...dailyLimitReadAndSeedStatement(),
    {
      text: `SELECT "dailyOverride", "bonusCredits" FROM user_codes WHERE "comboHash" = $1 LIMIT 1`,
      params: [combo],
    },
    {
      text: `SELECT "creditsUsed" FROM credit_usage WHERE "comboHash" = $1 AND date = $2`,
      params: [combo, date],
    },
  ]);
  const globalLimit = dailyLimitFromRow(limitRows[0]);
  const userCode = userCodeRows[0];
  const used = usageRows[0]?.creditsUsed ?? 0;
  const limit = budgetFromUserCode(globalLimit, userCode);
  return { used, limit, remaining: Math.max(0, limit - used) };
}

// Atomically-ish deduct up to `count` credits from a combo's remaining budget.
// Returns the number actually granted (<= count). The unique (comboHash, date)
// pin keeps the write on the day it was started on; the row is ensured first
// and the granted amount computed from a fresh read. Grant credits on /admin
// live as a one-time bonus pool on the visitor's UserCode: usage beyond the
// daily allowance drains the pool (so a top-up does not renew every day), while
// a permanent dailyOverride simply replaces the global daily limit.
export async function consumeCredits(
  combo: string,
  count: number,
): Promise<number> {
  if (count <= 0) return 0;
  const date = istDateKey();

  // Ensure the daily row exists and read the current budget in ONE HTTP
  // transaction: the credit_usage seed, the global limit (+ seed), the
  // visitor's override/bonus, and today's usage are all independent, so they
  // batch into a single round trip.
  const [, limitRows, , userCodeRows, usageRows] = await tx<
    [
      unknown[], // credit_usage ensure
      { value: string }[], // settings SELECT
      unknown[], // settings seed
      { id: string; dailyOverride: number | null; bonusCredits: number }[],
      { creditsUsed: number }[],
    ]
  >([
    {
      text: `INSERT INTO credit_usage (id, "comboHash", date, "updatedAt")
             VALUES ($1, $2, $3, now())
             ON CONFLICT ("comboHash", date) DO NOTHING`,
      params: [id(), combo, date],
    },
    ...dailyLimitReadAndSeedStatement(),
    {
      text: `SELECT id, "dailyOverride", "bonusCredits" FROM user_codes WHERE "comboHash" = $1 LIMIT 1`,
      params: [combo],
    },
    {
      text: `SELECT "creditsUsed" FROM credit_usage WHERE "comboHash" = $1 AND date = $2`,
      params: [combo, date],
    },
  ]);
  const globalLimit = dailyLimitFromRow(limitRows[0]);
  const userCode = userCodeRows[0];
  const used = usageRows[0]?.creditsUsed ?? 0;
  const limit = budgetFromUserCode(globalLimit, userCode);
  const granted = Math.min(count, Math.max(0, limit - used));
  if (granted <= 0) return 0;

  const base = userCode?.dailyOverride ?? globalLimit;
  const excess = Math.max(0, used + granted - base);
  const bonusAfter = Math.max(
    0,
    (userCode?.bonusCredits ?? 0) - excess,
  );

  const statements: { text: string; params: unknown[] }[] = [
    {
      text: `UPDATE credit_usage SET "creditsUsed" = $1, "updatedAt" = now()
             WHERE "comboHash" = $2 AND date = $3`,
      params: [used + granted, combo, date],
    },
  ];
  if (userCode && bonusAfter !== userCode.bonusCredits) {
    statements.push({
      text: `UPDATE user_codes SET "bonusCredits" = $1, "updatedAt" = now() WHERE id = $2`,
      params: [bonusAfter, userCode.id],
    });
  }

  if (statements.length === 1) {
    await query(statements[0].text, statements[0].params);
  } else {
    await tx(statements);
  }
  return granted;
}
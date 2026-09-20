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
import { prisma } from "./db";
import { ensureUserCode } from "./usercode";

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
export function getClientIp(): string | undefined {
  const h = headers();
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
export function requestComboHash(uid: string): string {
  return comboHash(getClientIp(), uid);
}

// Record the request-time combo on the User row so the hourly cron (which has
// no request IP) can attribute background syncs to the same budget. No-op-ish
// when the value is unchanged; the upsert also guarantees the row exists. The
// visitor's UserCode row is created/kept in sync so admin grants (bonus top-up,
// per-user limit override) always resolve against the current identity.
export async function recordAttribution(
  userId: string,
  combo: string,
): Promise<void> {
  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, comboHash: combo },
    update: { comboHash: combo },
  });
  await ensureUserCode(userId, combo);
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
  const row = await prisma.setting.findUnique({
    where: { key: SETTING_DAILY_LIMIT },
  });
  if (row) {
    const n = Number(row.value);
    if (Number.isInteger(n) && n > 0) return n;
  }
  await prisma.setting
    .upsert({
      where: { key: SETTING_DAILY_LIMIT },
      create: { key: SETTING_DAILY_LIMIT, value: String(DEFAULT_DAILY_LIMIT) },
      update: {},
    })
    .catch(() => {});
  return DEFAULT_DAILY_LIMIT;
}

export interface CreditsStatus {
  date: string;
  used: number;
  limit: number;
  remaining: number;
}

// Effective daily budget for a combo: the visitor's per-user override if one
// was granted on /admin, else the global limit, plus any one-time bonus top-up.
// resolveUserBudget expects an already-fetched UserCode row (null when none).
function budgetFromUserCode(
  globalLimit: number,
  userCode: { limitOverride: number | null; bonusCredits: number } | null,
): number {
  const base = userCode?.limitOverride ?? globalLimit;
  return base + (userCode?.bonusCredits ?? 0);
}

export async function getCreditsStatus(
  combo: string | null,
): Promise<CreditsStatus> {
  const date = istDateKey();
  const globalLimit = await getDailyLimit();
  if (!combo) {
    return { date, used: 0, limit: globalLimit, remaining: globalLimit };
  }
  const [userCode, row] = await Promise.all([
    prisma.userCode.findFirst({ where: { comboHash: combo } }),
    prisma.creditUsage.findUnique({
      where: { comboHash_date: { comboHash: combo, date } },
    }),
  ]);
  const limit = budgetFromUserCode(globalLimit, userCode);
  const used = row?.creditsUsed ?? 0;
  return { date, used, limit, remaining: Math.max(0, limit - used) };
}

// Atomically deduct up to `count` credits from a combo's remaining budget.
// Returns the number actually granted (<= count). Safe against the day
// rolling over between reads and writes: the unique key pins the write to the
// day it was started on. Grant credits on /admin live as a one-time bonus pool
// on the visitor's UserCode: usage beyond the daily allowance drains the pool
// (so a top-up does not renew every day), while a per-user override simply
// replaces the global daily limit for that visitor.
export async function consumeCredits(
  combo: string,
  count: number,
): Promise<number> {
  if (count <= 0) return 0;
  let granted = 0;
  await prisma.$transaction(async (tx) => {
    const date = istDateKey();
    const globalLimit = await getDailyLimit();
    const [userCode, row] = await Promise.all([
      tx.userCode.findFirst({ where: { comboHash: combo } }),
      tx.creditUsage.upsert({
        where: { comboHash_date: { comboHash: combo, date } },
        create: { comboHash: combo, date, creditsUsed: 0 },
        update: {},
      }),
    ]);
    const limit = budgetFromUserCode(globalLimit, userCode);
    const remaining = Math.max(0, limit - row.creditsUsed);
    granted = Math.min(count, remaining);
    if (granted > 0) {
      const usedAfter = row.creditsUsed + granted;
      await tx.creditUsage.update({
        where: { id: row.id },
        data: { creditsUsed: usedAfter },
      });
      const base = userCode?.limitOverride ?? globalLimit;
      const excess = Math.max(0, usedAfter - base);
      const bonusAfter = Math.max(0, (userCode?.bonusCredits ?? 0) - excess);
      if (userCode && bonusAfter !== userCode.bonusCredits) {
        await tx.userCode.update({
          where: { id: userCode.id },
          data: { bonusCredits: bonusAfter },
        });
      }
    }
  });
  return granted;
}
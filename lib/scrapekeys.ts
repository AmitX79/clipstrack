// ScrapeCreators API-key management, shared by the cron, the hourly sync and
// the /admin panel.
//
// Keys live in the `scrape_keys` table so the admin can add/remove/rotate them
// without redeploying. The first run seeds a key from SCRAPECREATORS_API_KEY
// so deployment-based configuration keeps working out of the box. Rotation:
// each request uses the least-recently-used enabled key; a key that returns a
// quota failure is flagged `quotaExhausted` and skipped until the balance is
// refreshed.

import { prisma } from "./db";

export const SCRAPECREATORS_API = "https://api.scrapecreators.com";
export const SCRAPECREATORS_BALANCE_PATH = "/v1/account/credit-balance";

// How stale a fetched balance may be before refreshKeyBalances refetches it.
const BALANCE_TTL_MS = 15 * 60 * 1000;

type ScrapeKeyRow = {
  id: string;
  label: string;
  key: string;
  active: boolean;
  quotaExhausted: boolean;
  remainingCredits: number | null;
  lastCheckedAt: Date | null;
  lastUsedAt: Date | null;
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
      const exists = await prisma.scrapeKey.findFirst({
        where: { key: envKey },
        select: { id: true },
      });
      if (exists) return;
      const managed = await prisma.scrapeKey.count();
      if (managed > 0) return;
      await prisma.scrapeKey
        .create({ data: { label: "env", key: envKey } })
        .catch(() => {});
    })();
  }
  return seedPromise;
}

// Enabled keys for request rotation, least-recently-used first. Skips keys
// that are inactive or flagged quota-exhausted.
export async function enabledScrapeKeys(): Promise<ScrapeKeyRow[]> {
  await seedScrapeKeys();
  return prisma.scrapeKey.findMany({
    where: { active: true, quotaExhausted: false },
    orderBy: { lastUsedAt: "asc" },
  });
}

export async function markScrapeKeyExhausted(id: string): Promise<void> {
  await prisma.scrapeKey
    .update({
      where: { id },
      data: { quotaExhausted: true, lastUsedAt: new Date(), remainingCredits: 0 },
    })
    .catch(() => {});
}

export async function markScrapeKeyOk(id: string): Promise<void> {
  await prisma.scrapeKey
    .update({ where: { id }, data: { quotaExhausted: false, lastUsedAt: new Date() } })
    .catch(() => {});
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
  const keys = await prisma.scrapeKey.findMany({ orderBy: { createdAt: "asc" } });
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
      await prisma.scrapeKey.update({
        where: { id: key.id },
        data: {
          remainingCredits: count,
          quotaExhausted: count <= 0,
          lastCheckedAt: new Date(),
        },
      });
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
  const keys = await prisma.scrapeKey.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "asc" }],
  });
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
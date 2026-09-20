"use server";

import { revalidatePath } from "next/cache";
import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { ADMIN_COOKIE, adminSecretHash, isAdmin } from "@/lib/admin";
import { SETTING_DAILY_LIMIT, getDailyLimit, istDateKey } from "@/lib/credits";
import { fetchKeyBalance, refreshKeyBalances } from "@/lib/scrapekeys";

export type AdminLoginResult = { ok: true } | { ok: false };
export type AdminResult =
  | { ok: true }
  | { ok: false; error: string };
export type BalanceResult =
  | { ok: true; remaining: number | null }
  | { ok: false; error: string };

// Sign the login secret into an HttpOnly cookie. Not gated on isAdmin() - it
// IS the gate. Invoked from the (client) login form so a wrong secret can
// surface immediately.
export async function adminLogin(
  formData: FormData,
): Promise<AdminLoginResult> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return { ok: false };
  const given = String(formData.get("secret") ?? "");
  const expected = Buffer.from(adminSecretHash(secret), "utf8");
  const actual = Buffer.from(adminSecretHash(given), "utf8");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return { ok: false };
  }
  cookies().set(ADMIN_COOKIE, adminSecretHash(secret), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return { ok: true };
}

export async function adminLogout(): Promise<void> {
  cookies().delete(ADMIN_COOKIE);
  revalidatePath("/admin");
}

const NOT_SIGNED_IN: AdminResult = {
  ok: false,
  error: "Not signed in - sign in again and retry.",
};

// Short User IDs are "CT-" + 6 unambiguous chars (no 0/O/1/I).
const USER_CODE_REGEX = /^CT-[A-Z0-9]{6}$/;

export type GrantLookupUser = {
  code: string;
  used: number;
  baseLimit: number;
  bonus: number;
  limitOverride: number | null;
  totalLimit: number;
  remaining: number;
};

export type GrantLookupResult =
  | { ok: true; user: GrantLookupUser }
  | { ok: false; error: string };

// Admin "Grant credits" panel: resolve a short User ID to the visitor's daily
// usage so the grant form can preview their current budget before editing it.
export async function lookupUserByCode(
  raw: string,
): Promise<GrantLookupResult> {
  const code = raw.trim().toUpperCase();
  if (!USER_CODE_REGEX.test(code)) {
    return { ok: false, error: "Enter a valid User ID, e.g. CT-X7K9P2." };
  }
  const row = await prisma.userCode.findUnique({ where: { code } });
  if (!row) {
    return { ok: false, error: `No visitor with the ID ${code} yet.` };
  }
  const [usedRow, globalLimit] = await Promise.all([
    row.comboHash
      ? prisma.creditUsage.findUnique({
          where: {
            comboHash_date: { comboHash: row.comboHash, date: istDateKey() },
          },
        })
      : Promise.resolve(null),
    getDailyLimit(),
  ]);
  const baseLimit = row.limitOverride ?? globalLimit;
  const bonus = row.bonusCredits;
  const used = usedRow?.creditsUsed ?? 0;
  const totalLimit = baseLimit + bonus;
  return {
    ok: true,
    user: {
      code,
      used,
      baseLimit,
      bonus,
      limitOverride: row.limitOverride,
      totalLimit,
      remaining: Math.max(0, totalLimit - used),
    },
  };
}

// Grant credits to a visitor: add a one-time bonus top-up and/or set (or clear,
// via null) a per-visitor daily limit override. Reads are admin-gated and the
// write uses one transaction so the two never drift apart.
export async function grantCredits(args: {
  code: string;
  addBonus: number;
  limitOverride: number | null;
}): Promise<AdminResult> {
  if (!isAdmin()) return NOT_SIGNED_IN;
  const code = args.code.trim().toUpperCase();
  if (!USER_CODE_REGEX.test(code)) {
    return { ok: false, error: "Enter a valid User ID, e.g. CT-X7K9P2." };
  }
  const row = await prisma.userCode.findUnique({ where: { code } });
  if (!row) return { ok: false, error: `No visitor with the ID ${code} yet.` };
  if (
    !Number.isInteger(args.addBonus) ||
    args.addBonus < 0 ||
    args.addBonus > 1_000_000
  ) {
    return {
      ok: false,
      error: "Bonus must be a whole number between 0 and 1,000,000.",
    };
  }
  if (
    args.limitOverride != null &&
    (!Number.isInteger(args.limitOverride) ||
      args.limitOverride < 1 ||
      args.limitOverride > 1_000_000)
  ) {
    return {
      ok: false,
      error: "Override must be a whole number between 1 and 1,000,000 (or cleared).",
    };
  }
  await prisma.$transaction([
    prisma.userCode.update({
      where: { id: row.id },
      data: { bonusCredits: { increment: args.addBonus } },
    }),
    prisma.userCode.update({
      where: { id: row.id },
      data: { limitOverride: args.limitOverride },
    }),
  ]);
  revalidatePath("/admin");
  return { ok: true };
}

// Editable daily per-IP credit limit — read at runtime by lib/credits.
export async function updateDailyLimit(limit: number): Promise<AdminResult> {
  if (!isAdmin()) return NOT_SIGNED_IN;
  if (!Number.isInteger(limit) || limit < 1 || limit > 1_000_000) {
    return {
      ok: false,
      error: "Limit must be a whole number between 1 and 1,000,000.",
    };
  }
  await prisma.setting.upsert({
    where: { key: SETTING_DAILY_LIMIT },
    create: { key: SETTING_DAILY_LIMIT, value: String(limit) },
    update: { value: String(limit) },
  });
  revalidatePath("/admin");
  return { ok: true };
}

export async function addScrapeKey(
  label: string,
  key: string,
): Promise<AdminResult> {
  if (!isAdmin()) return NOT_SIGNED_IN;
  const cleanLabel = label.trim();
  const cleanKey = key.trim();
  if (!cleanLabel) return { ok: false, error: "Give the key a label." };
  if (cleanLabel.length > 60) {
    return { ok: false, error: "Label must be 60 characters or fewer." };
  }
  if (!cleanKey || cleanKey.length < 8) {
    return { ok: false, error: "That does not look like a real API key." };
  }
  try {
    await prisma.scrapeKey.create({
      data: { label: cleanLabel, key: cleanKey },
    });
  } catch {
    return { ok: false, error: "That key is already stored." };
  }
  try {
    await refreshKeyBalances(true);
  } catch {
    // Balance lookup is best-effort; the key itself is saved.
  }
  revalidatePath("/admin");
  return { ok: true };
}

export async function removeScrapeKey(id: string): Promise<AdminResult> {
  if (!isAdmin()) return NOT_SIGNED_IN;
  await prisma.scrapeKey.deleteMany({ where: { id } });
  revalidatePath("/admin");
  return { ok: true };
}

export async function toggleScrapeKey(id: string): Promise<AdminResult> {
  if (!isAdmin()) return NOT_SIGNED_IN;
  const row = await prisma.scrapeKey.findUnique({ where: { id } });
  if (!row) return { ok: false, error: "That key no longer exists." };
  await prisma.scrapeKey.update({
    where: { id },
    data: { active: !row.active },
  });
  revalidatePath("/admin");
  return { ok: true };
}

export async function refreshBalancesNow(): Promise<AdminResult> {
  if (!isAdmin()) return NOT_SIGNED_IN;
  try {
    await refreshKeyBalances(true);
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Could not refresh balances from ScrapeCreators.",
    };
  }
  revalidatePath("/admin");
  return { ok: true };
}

// Per-key balance refresh used by the Refresh balance control in each row.
export async function refreshKeyBalance(id: string): Promise<BalanceResult> {
  if (!isAdmin())
    return { ok: false, error: "Not signed in - sign in again and retry." };
  const row = await prisma.scrapeKey.findUnique({ where: { id } });
  if (!row) return { ok: false, error: "That key no longer exists." };
  try {
    const count = await fetchKeyBalance(row.key);
    if (count == null) {
      return {
        ok: false,
        error: "ScrapeCreators did not return a balance for this key.",
      };
    }
    await prisma.scrapeKey.update({
      where: { id },
      data: {
        remainingCredits: count,
        quotaExhausted: count <= 0,
        lastCheckedAt: new Date(),
      },
    });
    revalidatePath("/admin");
    return { ok: true, remaining: count };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Could not read the balance for this key.",
    };
  }
}
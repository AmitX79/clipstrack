"use server";

import { revalidatePath } from "next/cache";
import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { id, query, queryOne, tx } from "@/lib/db";
import { ADMIN_COOKIE, adminSecretHash, isAdmin } from "@/lib/admin";
import { SETTING_DAILY_LIMIT, getDailyLimit, istDateKey } from "@/lib/credits";
import { fetchKeyBalance, refreshKeyBalances } from "@/lib/scrapekeys";

type GrantTypeValue = "BONUS" | "OVERRIDE";

type UserCodeRow = {
  id: string;
  code: string;
  userId: string;
  comboHash: string | null;
  dailyOverride: number | null;
  bonusCredits: number;
};

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
  (await cookies()).set(ADMIN_COOKIE, adminSecretHash(secret), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return { ok: true };
}

export async function adminLogout(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  revalidatePath("/admin");
}

const NOT_SIGNED_IN = {
  ok: false,
  error: "Not signed in - sign in again and retry.",
} as const;

// Short User IDs are "CT-" + 6 unambiguous chars (no 0/O/1/I).
const USER_CODE_REGEX = /^CT-[A-Z0-9]{6}$/;

export type GrantLookupUser = {
  code: string;
  used: number;
  baseLimit: number;
  bonus: number;
  dailyOverride: number | null;
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
  if (!(await isAdmin())) return NOT_SIGNED_IN;
  const code = raw.trim().toUpperCase();
  if (!USER_CODE_REGEX.test(code)) {
    return { ok: false, error: "Enter a valid User ID, e.g. CT-X7K9P2." };
  }
  const row = await queryOne<UserCodeRow>(
    `SELECT * FROM user_codes WHERE code = $1`,
    [code],
  );
  if (!row) {
    return { ok: false, error: `No visitor with the ID ${code} yet.` };
  }
  const [usedRow, globalLimit] = await Promise.all([
    row.comboHash
      ? queryOne<{ creditsUsed: number }>(
          `SELECT "creditsUsed" FROM credit_usage WHERE "comboHash" = $1 AND date = $2`,
          [row.comboHash, istDateKey()],
        )
      : Promise.resolve(undefined),
    getDailyLimit(),
  ]);
  const baseLimit = row.dailyOverride ?? globalLimit;
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
      dailyOverride: row.dailyOverride,
      totalLimit,
      remaining: Math.max(0, totalLimit - used),
    },
  };
}

// Grant credits to a visitor: add a one-time bonus top-up and/or set (or clear,
// via null) the visitor's PERMANENT daily limit override. Reads are admin-gated
// and the write uses one transaction so the UserCode values and the GrantHistory
// audit trail never drift apart. Every credit change is logged: a bonus grant
// logs type=BONUS; setting a daily limit logs OVERRIDE with the new value;
// clearing a previously-set limit logs OVERRIDE with amount 0 (= cleared).
export async function grantCredits(args: {
  code: string;
  addBonus: number;
  dailyOverride: number | null;
}): Promise<AdminResult> {
  if (!(await isAdmin())) return NOT_SIGNED_IN;
  const code = args.code.trim().toUpperCase();
  if (!USER_CODE_REGEX.test(code)) {
    return { ok: false, error: "Enter a valid User ID, e.g. CT-X7K9P2." };
  }
  const row = await queryOne<UserCodeRow>(
    `SELECT * FROM user_codes WHERE code = $1`,
    [code],
  );
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
    args.dailyOverride != null &&
    (!Number.isInteger(args.dailyOverride) ||
      args.dailyOverride < 1 ||
      args.dailyOverride > 1_000_000)
  ) {
    return {
      ok: false,
      error:
        "Daily limit must be a whole number between 1 and 1,000,000 (or cleared).",
    };
  }
  const history: {
    userId: string;
    type: GrantTypeValue;
    amount: number;
  }[] = [];
  if (args.addBonus > 0) {
    history.push({ userId: row.userId, type: "BONUS", amount: args.addBonus });
  }
  if (args.dailyOverride != null) {
    history.push({
      userId: row.userId,
      type: "OVERRIDE",
      amount: args.dailyOverride,
    });
  } else if (row.dailyOverride != null) {
    // Explicitly cleared a previously-set permanent limit.
    history.push({ userId: row.userId, type: "OVERRIDE", amount: 0 });
  }

  const statements: { text: string; params: unknown[] }[] = [];
  if (args.addBonus > 0) {
    statements.push({
      text: `UPDATE user_codes SET "bonusCredits" = "bonusCredits" + $1, "updatedAt" = now() WHERE id = $2`,
      params: [args.addBonus, row.id],
    });
  }
  statements.push({
    text: `UPDATE user_codes SET "dailyOverride" = $1, "updatedAt" = now() WHERE id = $2`,
    params: [args.dailyOverride, row.id],
  });
  for (const entry of history) {
    statements.push({
      text: `INSERT INTO grant_history (id, "userId", type, amount) VALUES ($1, $2, $3, $4)`,
      params: [id(), entry.userId, entry.type, entry.amount],
    });
  }
  await tx(statements);

  revalidatePath("/admin");
  return { ok: true };
}

// Editable daily per-IP credit limit — read at runtime by lib/credits.
export async function updateDailyLimit(limit: number): Promise<AdminResult> {
  if (!(await isAdmin())) return NOT_SIGNED_IN;
  if (!Number.isInteger(limit) || limit < 1 || limit > 1_000_000) {
    return {
      ok: false,
      error: "Limit must be a whole number between 1 and 1,000,000.",
    };
  }
  await query(
    `INSERT INTO settings (key, value, "updatedAt", "createdAt")
     VALUES ($1, $2, now(), now())
     ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = now()`,
    [SETTING_DAILY_LIMIT, String(limit)],
  );
  revalidatePath("/admin");
  return { ok: true };
}

export async function addScrapeKey(
  label: string,
  key: string,
): Promise<AdminResult> {
  if (!(await isAdmin())) return NOT_SIGNED_IN;
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
    await query(
      `INSERT INTO scrape_keys (id, label, key, "active", "quotaExhausted", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, true, false, now(), now())`,
      [id(), cleanLabel, cleanKey],
    );
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
  if (!(await isAdmin())) return NOT_SIGNED_IN;
  await query(`DELETE FROM scrape_keys WHERE id = $1`, [id]);
  revalidatePath("/admin");
  return { ok: true };
}

export async function toggleScrapeKey(id: string): Promise<AdminResult> {
  if (!(await isAdmin())) return NOT_SIGNED_IN;
  const row = await queryOne<{ active: boolean }>(
    `SELECT "active" FROM scrape_keys WHERE id = $1`,
    [id],
  );
  if (!row) return { ok: false, error: "That key no longer exists." };
  await query(
    `UPDATE scrape_keys SET "active" = $1, "updatedAt" = now() WHERE id = $2`,
    [!row.active, id],
  );
  revalidatePath("/admin");
  return { ok: true };
}

// ---- YouTube Data API keys -------------------------------------------------
// Each key adds its own 10,000 units/day capacity; rotation lives in
// lib/youtubekeys. Adding/toggling/removing here is the same shape as the
// ScrapeCreators keys above.

export async function addYoutubeKey(
  label: string,
  key: string,
): Promise<AdminResult> {
  if (!(await isAdmin())) return NOT_SIGNED_IN;
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
    await query(
      `INSERT INTO youtube_keys (id, label, key, "active", "quotaExhausted", "unitsUsed", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, true, false, 0, now(), now())`,
      [id(), cleanLabel, cleanKey],
    );
  } catch {
    return { ok: false, error: "That key is already stored." };
  }
  revalidatePath("/admin");
  return { ok: true };
}

export async function removeYoutubeKey(id: string): Promise<AdminResult> {
  if (!(await isAdmin())) return NOT_SIGNED_IN;
  await query(`DELETE FROM youtube_keys WHERE id = $1`, [id]);
  revalidatePath("/admin");
  return { ok: true };
}

export async function toggleYoutubeKey(id: string): Promise<AdminResult> {
  if (!(await isAdmin())) return NOT_SIGNED_IN;
  const row = await queryOne<{ active: boolean }>(
    `SELECT "active" FROM youtube_keys WHERE id = $1`,
    [id],
  );
  if (!row) return { ok: false, error: "That key no longer exists." };
  await query(
    `UPDATE youtube_keys SET "active" = $1, "quotaExhausted" = false, "updatedAt" = now() WHERE id = $2`,
    [!row.active, id],
  );
  revalidatePath("/admin");
  return { ok: true };
}

export async function refreshBalancesNow(): Promise<AdminResult> {
  if (!(await isAdmin())) return NOT_SIGNED_IN;
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
  if (!(await isAdmin()))
    return { ok: false, error: "Not signed in - sign in again and retry." };
  const row = await queryOne<{ key: string }>(
    `SELECT key FROM scrape_keys WHERE id = $1`,
    [id],
  );
  if (!row) return { ok: false, error: "That key no longer exists." };
  try {
    const count = await fetchKeyBalance(row.key);
    if (count == null) {
      return {
        ok: false,
        error: "ScrapeCreators did not return a balance for this key.",
      };
    }
    await query(
      `UPDATE scrape_keys
       SET "remainingCredits" = $1, "quotaExhausted" = $2, "lastCheckedAt" = now(), "updatedAt" = now()
       WHERE id = $3`,
      [count, count <= 0, id],
    );
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
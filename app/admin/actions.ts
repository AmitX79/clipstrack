"use server";

import { revalidatePath } from "next/cache";
import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { ADMIN_COOKIE, adminSecretHash, isAdmin } from "@/lib/admin";
import { SETTING_DAILY_LIMIT } from "@/lib/credits";
import { refreshKeyBalances } from "@/lib/scrapekeys";

export type AdminLoginResult = { ok: true } | { ok: false };

// Sign the login secret into an HttpOnly cookie. Not gated on isAdmin() - it
// IS the gate. Invoked from the (client) login form so a wrong secret can
// surface immediately; form-action style (void) is reserved for the other
// admin controls below.
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

// Editable daily per-IP credit limit — read at runtime by lib/credits.
export async function updateDailyLimit(formData: FormData): Promise<void> {
  if (!isAdmin()) return;
  const n = Math.round(Number(String(formData.get("limit") ?? "")));
  if (!Number.isInteger(n) || n < 1 || n > 1_000_000) return;
  await prisma.setting.upsert({
    where: { key: SETTING_DAILY_LIMIT },
    create: { key: SETTING_DAILY_LIMIT, value: String(n) },
    update: { value: String(n) },
  });
  revalidatePath("/admin");
}

export async function addScrapeKey(formData: FormData): Promise<void> {
  if (!isAdmin()) return;
  const label = String(formData.get("label") ?? "").trim();
  const key = String(formData.get("key") ?? "").trim();
  if (!label || label.length > 60 || !key || key.length < 8) return;
  try {
    await prisma.scrapeKey.create({ data: { label, key } });
  } catch {
    return;
  }
  try {
    await refreshKeyBalances(true);
  } catch {
    // Balance lookup is best-effort; the key itself is saved.
  }
  revalidatePath("/admin");
}

export async function removeScrapeKey(formData: FormData): Promise<void> {
  if (!isAdmin()) return;
  const id = String(formData.get("id") ?? "");
  await prisma.scrapeKey.deleteMany({ where: { id } });
  revalidatePath("/admin");
}

export async function toggleScrapeKey(formData: FormData): Promise<void> {
  if (!isAdmin()) return;
  const id = String(formData.get("id") ?? "");
  const row = await prisma.scrapeKey.findUnique({ where: { id } });
  if (row) {
    await prisma.scrapeKey.update({
      where: { id },
      data: { active: !row.active },
    });
  }
  revalidatePath("/admin");
}

export async function refreshBalancesNow(): Promise<void> {
  if (!isAdmin()) return;
  await refreshKeyBalances(true);
  revalidatePath("/admin");
}
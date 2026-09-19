// Admin auth for /admin. A single operator secret (ADMIN_SECRET env var) is
// verified via an HttpOnly cookie holding its SHA-256; constant-time compares
// keep the check from leaking timing. The login flow also accepts ?secret= on
// the /admin/login route for scripts/curl.

import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ct_admin";

export function adminSecretHash(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export function isAdmin(): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(adminSecretHash(secret), "utf8");
  const got = cookies().get(ADMIN_COOKIE)?.value;
  if (!got) return false;
  const actual = Buffer.from(got, "utf8");
  return (
    actual.length === expected.length && timingSafeEqual(actual, expected)
  );
}
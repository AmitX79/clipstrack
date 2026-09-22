// Per-IP daily cap on the public /api/contact form. The contact route is the
// only fully public API; it has no server-side side effects (it returns a
// mailto URL), so a limit is defense-in-depth rather than cost protection.
//
// Backing table (created once against Neon; no migration tooling here):
//
//   CREATE TABLE IF NOT EXISTS contact_rate_limit (
//     ip    text NOT NULL,
//     date  date NOT NULL,
//     count integer NOT NULL DEFAULT 0,
//     PRIMARY KEY (ip, date)
//   );
//
// Deliberately fail-open: if the counter row cannot be read/written the
// request is still allowed, so a storage hiccup can never take down the
// contact form.

import { query } from "./db";
import { getClientIp, istDateKey } from "./credits";

export const CONTACT_DAILY_LIMIT = 20;

export type ContactLimitResult =
  | { allowed: true }
  | { allowed: false; remaining: number };

export async function getContactIp(): Promise<string | undefined> {
  return getClientIp();
}

export async function checkContactLimit(
  ip: string | undefined,
): Promise<ContactLimitResult> {
  if (!ip) return { allowed: true };
  try {
    const row = (
      await query<{ count: number }>(
        `INSERT INTO contact_rate_limit (ip, date, count)
         VALUES ($1, $2, 1)
         ON CONFLICT (ip, date) DO UPDATE SET
           count = contact_rate_limit.count + 1
         RETURNING count`,
        [ip, istDateKey()],
      )
    )[0];
    const count = row?.count ?? 1;
    return count > CONTACT_DAILY_LIMIT
      ? { allowed: false, remaining: 0 }
      : { allowed: true };
  } catch {
    return { allowed: true };
  }
}
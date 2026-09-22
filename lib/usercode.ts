// Shareable per-visitor short User ID (e.g. "CT-X7K9P2"). Derived from the
// visitor's ct_uid and persisted on a UserCode row, so /accounts can display
// it as "Your ID: …" and /admin ("Grant credits") can look visitors up by it.
// The code uses an unambiguous alphabet (no 0/O/1/I) so it is easy to read
// aloud and type from a screenshot.

import { createHash, randomBytes } from "crypto";
import { query, exec, id } from "./db";

export const USER_CODE_PREFIX = "CT-";

// No 0/O/1/I — those read like each other in most typefaces.
const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function codeFromBytes(bytes: Buffer): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return `${USER_CODE_PREFIX}${code}`;
}

// Deterministic per-ct_uid, so the code is stable across visits and devices
// with the same cookie (re-running this on an existing identity is a no-op).
export function deriveUserCode(userId: string): string {
  return codeFromBytes(createHash("sha256").update(userId).digest());
}

// Return the visitor's code, creating the UserCode row on first use. The code
// never changes for a given ct_uid; the current combo hash is stored so the
// admin panel can resolve the visitor's daily credit usage. On the (extremely
// unlikely) code collision, retries with a random code.
export async function ensureUserCode(
  userId: string,
  combo: string | null,
): Promise<string> {
  const derived = deriveUserCode(userId);
  try {
    await query(
      `INSERT INTO user_codes (id, "userId", code, "comboHash", "updatedAt")
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT ("userId") DO UPDATE SET
         "comboHash" = COALESCE(EXCLUDED."comboHash", user_codes."comboHash"),
         "updatedAt" = now()`,
      [id(), userId, derived, combo],
    );
    return derived;
  } catch {
    // Derivation collision against another visitor: fall back to random codes.
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    const randomCode = codeFromBytes(randomBytes(6));
    try {
      await query(
        `INSERT INTO user_codes (id, "userId", code, "comboHash", "updatedAt")
         VALUES ($1, $2, $3, $4, now())
         ON CONFLICT ("userId") DO UPDATE SET
           "comboHash" = COALESCE(EXCLUDED."comboHash", user_codes."comboHash"),
           "updatedAt" = now()`,
        [id(), userId, randomCode, combo],
      );
      return randomCode;
    } catch {
      // Collision again - keep trying.
    }
  }
  return derived;
}

// Stamp the visitor's User row as active (any page load, add, refresh, edit or
// remove). The daily inactivity cleanup deletes visitors whose lastActive is
// older than INACTIVE_DAYS, so every real interaction keeps their data alive.
// Creates the row if the visitor has not added anything yet (loading /accounts
// alone counts as activity).
export async function touchActivity(userId: string): Promise<void> {
  await exec(
    `INSERT INTO users (id, "lastActive", "createdAt", "updatedAt")
     VALUES ($1, now(), now(), now())
     ON CONFLICT (id) DO UPDATE SET "lastActive" = now(), "updatedAt" = now()`,
    [userId],
  );
}
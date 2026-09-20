// Shareable per-visitor short User ID (e.g. "CT-X7K9P2"). Derived from the
// visitor's ct_uid and persisted on a UserCode row, so /accounts can display
// it as "Your ID: …" and /admin ("Grant credits") can look visitors up by it.
// The code uses an unambiguous alphabet (no 0/O/1/I) so it is easy to read
// aloud and type from a screenshot.

import { createHash, randomBytes } from "crypto";
import { prisma } from "./db";

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
    await prisma.userCode.upsert({
      where: { userId },
      create: { userId, code: derived, comboHash: combo },
      update: { comboHash: combo ?? undefined },
    });
    return derived;
  } catch {
    // Derivation collision against another visitor: fall back to random codes.
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    const randomCode = codeFromBytes(randomBytes(6));
    try {
      await prisma.userCode.upsert({
        where: { userId },
        create: { userId, code: randomCode, comboHash: combo },
        update: {},
      });
      return randomCode;
    } catch {
      // Collision again - keep trying.
    }
  }
  return derived;
}
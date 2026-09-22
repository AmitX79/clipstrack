// Per-visitor identity. No auth system yet — a cookie maps each visitor to a
// User row, so every visitor only ever sees their own channels. The cookie
// value IS the User id (a uuid), written only after the visitor grants consent.

import { cookies } from "next/headers";

export const VISITOR_COOKIE = "ct_uid";

// Consent state is a separate, non-HttpOnly cookie so client code can gate
// consent-requiring actions (like adding a channel) without a round-trip.
// "1" = allowed, "0" = declined, absent = never asked. The ct_uid identity
// cookie is only ever written once consent is granted.
export const CONSENT_COOKIE = "ct_consent";

export async function setConsent(value: "0" | "1"): Promise<void> {
  (await cookies()).set(CONSENT_COOKIE, value, {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // remember the choice for a year
    path: "/",
  });
}

// Returns an existing visitor id from the cookie, or undefined. Only call
// from a Server Component / Server Action (needs the request scope).
export async function getVisitorId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(VISITOR_COOKIE)?.value;
}

// Write the identity cookie for a specific id (used by allowConsent so an
// existing visitor keeps the same id after consenting). HttpOnly keeps the id
// away from page script.
export async function setVisitorId(id: string): Promise<void> {
  (await cookies()).set(VISITOR_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year, so tracked accounts persist
    path: "/",
  });
}

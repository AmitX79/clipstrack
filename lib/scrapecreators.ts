// ScrapeCreators API client — shared by the Instagram and TikTok fetchers.
//
// Authenticates with the admin-managed keys from `scrape_keys` (seeded from the
// environment on first use, rotated across enabled keys automatically). A
// per-key in-flight slot cap (see scrapekeys) keeps the provider from seeing a
// pile-up of concurrent feed walks while still letting several keys parallelize
// — the cap is enforced atomically in the DB, so it holds across every Worker
// isolate, not just within one script.

import {
  acquireScrapeSlot,
  enabledScrapeKeys,
  markScrapeKeyExhausted,
  markScrapeKeyOk,
  maskKey,
  releaseScrapeSlot,
  runScrapeSlotJanitor,
  SCRAPECREATORS_API,
} from "./scrapekeys";

export { SCRAPECREATORS_API };

// Deep enough to reach a tracked "Old" bucket while keeping the worst-case
// walk bounded (photo-dense feeds like cristiano need dozens of pages to find
// a handful of reels; anything missed reports honestly via the partial note).
export const MAX_WALK_PAGES = 8;

// API-key failures fall into two buckets with very different handling:
//   - "quota": the key itself is unusable (402 out-of-credits, 401/403 auth,
//     413 payload) — flag it exhausted and rotate away.
//   - "rateLimit": 429 too-many-requests — transient, back off and retry;
//     the key must NOT be marked exhausted (it self-heals in seconds, and a
//     single-key setup would otherwise brick all Instagram/TikTok work).
function classifyScrapeError(status: number, message: string): "quota" | "rateLimit" | null {
  if (status === 401 || status === 403 || status === 402 || status === 413) {
    return "quota";
  }
  if (status === 429) return "rateLimit";
  if (/credit|quota|insufficient|unauthor|invalid key|authentication/i.test(message)) {
    return "quota";
  }
  if (/rate.?limit|too many/i.test(message)) return "rateLimit";
  return null;
}

class ApiKeyError extends Error {
  kind: "quota" | "rateLimit";
  constructor(kind: "quota" | "rateLimit", message: string) {
    super(message);
    this.kind = kind;
  }
}

// Transient failures worth one or two immediate retries: mid-stream origin
// disconnects and truncated/corrupt JSON bodies are connection-level, not
// account-level — large feeds intermittently arrive cut short and succeed on
// the very next request. API-key failures are never retried here (they are
// handled in scrapeGetRaw instead).
const TRANSIENT_RETRIES = 2;
const TRANSIENT_DELAY_MS = 200;

// Rate-limit backoff grows from here up to a ceiling; capacity waits poll the
// slot pool. A request gives up after MAX_REQUEST_WAIT_MS of trying.
const RATE_LIMIT_BACKOFF_MS = 1200;
const SLOT_POLL_MS = 120;
const MAX_REQUEST_WAIT_MS = 15_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request<T>(
  url: URL,
  apiKey: string,
  path: string,
): Promise<T> {
  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= TRANSIENT_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(TRANSIENT_DELAY_MS * attempt);
    }
    try {
      const res = await fetch(url, {
        headers: { "x-api-key": apiKey },
        cache: "no-store",
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || data.success === false) {
        const message = data.message ?? `HTTP ${res.status}`;
        const kind = classifyScrapeError(res.status, message);
        if (kind) {
          throw new ApiKeyError(kind, `ScrapeCreators ${path}: ${message}`);
        }
        throw new Error(`ScrapeCreators ${path}: ${message}`);
      }
      return data as T;
    } catch (err) {
      if (err instanceof ApiKeyError) throw err;
      if (err instanceof SyntaxError) {
        // res.json() failed — origin body was truncated or corrupt mid-stream.
        if (attempt < TRANSIENT_RETRIES) {
          console.log(
            `[scrape] ${path} truncated response (attempt ${attempt + 1}) - retrying…`,
          );
          lastErr = new Error(
            `ScrapeCreators ${path}: invalid JSON response (truncated mid-stream)`,
          );
          continue;
        }
        throw new Error(`ScrapeCreators ${path}: invalid JSON response`);
      }
      if (attempt < TRANSIENT_RETRIES) {
        lastErr = err instanceof Error ? err : new Error(String(err));
        continue;
      }
      throw err;
    }
  }
  throw lastErr ?? new Error(`ScrapeCreators ${path}: request failed`);
}

// Feed walks call this through `scrapeGet`; the IG profile overlap uses
// `scrapeGetRaw`. Both now share the same slot-based path (the profile call is
// just the usual single request), so the two names stay for call-site clarity.
export function scrapeGet<T>(
  path: string,
  params: Record<string, string | number | boolean>,
): Promise<T> {
  return scrapeGetRaw<T>(path, params);
}

export async function scrapeGetRaw<T>(
  path: string,
  params: Record<string, string | number | boolean>,
): Promise<T> {
  const url = new URL(`${SCRAPECREATORS_API}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value != null) url.searchParams.set(key, String(value));
  }

  await runScrapeSlotJanitor();

  const deadline = Date.now() + MAX_REQUEST_WAIT_MS;
  let lastError: Error | null = null;
  let backoff = RATE_LIMIT_BACKOFF_MS;

  while (Date.now() < deadline) {
    const keys = await enabledScrapeKeys();
    if (keys.length === 0) break;

    let triedAny = false;
    let skippedCapacity = false;
    for (const key of keys) {
      const slot = await acquireScrapeSlot(key.id);
      if (!slot) {
        skippedCapacity = true; // key is busy — leave it for a later pass
        continue;
      }
      triedAny = true;
      console.log(
        `[scrape] ${path} -> key "${key.label}" (${maskKey(key.key)})`,
      );
      try {
        const data = await request<T>(url, key.key, path);
        await markScrapeKeyOk(key.id);
        return data;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (err instanceof ApiKeyError && err.kind === "quota") {
          await markScrapeKeyExhausted(key.id);
          console.log(
            `[scrape] key "${key.label}" quota exhausted - rotating (${err.message})`,
          );
        } else if (err instanceof ApiKeyError && err.kind === "rateLimit") {
          console.log(
            `[scrape] ${path} rate-limited on "${key.label}" (${err.message})`,
          );
        }
      } finally {
        await releaseScrapeSlot(key.id);
      }
    }

    if (!triedAny) {
      // Every enabled key is momentarily at capacity — wait for a slot.
      await sleep(SLOT_POLL_MS);
      continue;
    }
    if (lastError instanceof ApiKeyError && lastError.kind === "quota") {
      // Every key that had a free slot reported a hard quota failure. If a
      // key was only skipped for capacity, keep polling (it may free up).
      if (skippedCapacity) {
        await sleep(SLOT_POLL_MS);
        continue;
      }
      throw lastError;
    }
    if (lastError instanceof ApiKeyError && lastError.kind === "rateLimit") {
      await sleep(backoff);
      backoff = Math.min(backoff * 2, 5_000);
      continue;
    }
    if (lastError) throw lastError; // non-API failure on every tried key
  }

  throw (
    lastError ??
    new Error(
      "All ScrapeCreators API keys are exhausted, or none are enabled",
    )
  );
}
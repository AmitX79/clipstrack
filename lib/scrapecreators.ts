// ScrapeCreators API client — shared by the Instagram and TikTok fetchers.
//
// Authenticates with the managed keys from `scrape_keys` (seeded from the
// environment on first use). On a quota failure the current key is flagged
// and the request is retried with the next enabled key, rotating across the
// admin-managed set automatically.

import {
  enabledScrapeKeys,
  markScrapeKeyExhausted,
  markScrapeKeyOk,
  maskKey,
  SCRAPECREATORS_API,
} from "./scrapekeys";

export { SCRAPECREATORS_API };

// Errors worth rotating away from the current key: quota failures (HTTP 402
// machine-payments, 413 payload, 429 rate/credits) plus auth failures (401,
// 403) meaning the key itself was rejected — both signal that the key is no
// longer usable, so the next enabled key should take over.
export function isScrapeRetryableError(status: number, message: string): boolean {
  if (
    status === 401 ||
    status === 403 ||
    status === 402 ||
    status === 413 ||
    status === 429
  ) {
    return true;
  }
  return /credit|quota|insufficient|limit|unauthor|invalid key|authentication/i.test(
    message,
  );
}

// Transient failures worth one or two immediate retries: mid-stream origin
// disconnects and truncated/corrupt JSON bodies are connection-level, not
// account-level — large feeds intermittently arrive cut short and succeed on
// the very next request. API-key/quota failures are never retried here (they
// rotate keys in scrapeGet instead).
const TRANSIENT_RETRIES = 2;
const TRANSIENT_DELAY_MS = 200;

async function request<T>(
  url: URL,
  apiKey: string,
  path: string,
): Promise<T> {
  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= TRANSIENT_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, TRANSIENT_DELAY_MS * attempt));
    }
    try {
      const res = await fetch(url, {
        headers: { "x-api-key": apiKey },
        cache: "no-store",
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || data.success === false) {
        const message = data.message ?? `HTTP ${res.status}`;
        if (isScrapeRetryableError(res.status, message)) {
          throw new ApiKeyError(`ScrapeCreators ${path}: ${message}`);
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

class ApiKeyError extends Error {}

export async function scrapeGet<T>(
  path: string,
  params: Record<string, string | number | boolean>,
): Promise<T> {
  const url = new URL(`${SCRAPECREATORS_API}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value != null) url.searchParams.set(key, String(value));
  }

  const keys = await enabledScrapeKeys();
  if (keys.length === 0) {
    throw new Error("No ScrapeCreators API key is available");
  }

  let lastError: Error | null = null;
  for (const key of keys) {
    console.log(
      `[scrape] ${path} -> key "${key.label}" (${maskKey(key.key)})`,
    );
    try {
      const data = await request<T>(url, key.key, path);
      await markScrapeKeyOk(key.id);
      return data;
    } catch (err) {
      if (err instanceof ApiKeyError) {
        await markScrapeKeyExhausted(key.id);
        lastError = err;
        console.log(
          `[scrape] key "${key.label}" unavailable - rotating (${err.message})`,
        );
        continue; // rotate to the next enabled key
      }
      throw err;
    }
  }

  throw lastError ?? new Error("All ScrapeCreators API keys are exhausted");
}
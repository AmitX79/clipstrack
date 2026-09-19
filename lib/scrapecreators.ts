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
  SCRAPECREATORS_API,
} from "./scrapekeys";

export { SCRAPECREATORS_API };

// Quota failures are surfaced honouring the scraped-platform semantics: HTTP
// 402 (machine-payments pattern), 429 (rate/quota), plus body messages that
// mention credits/quota/limit running out.
export function isScrapeQuotaError(status: number, message: string): boolean {
  if (status === 402 || status === 413 || status === 429) return true;
  return /credit|quota|insufficient|limit/i.test(message);
}

async function request<T>(
  url: URL,
  apiKey: string,
  path: string,
): Promise<T> {
  const res = await fetch(url, {
    headers: { "x-api-key": apiKey },
    cache: "no-store",
  });
  const data = (await res.json()) as { success?: boolean; message?: string };
  if (!res.ok || data.success === false) {
    const message = data.message ?? `HTTP ${res.status}`;
    if (isScrapeQuotaError(res.status, message)) {
      throw new QuotaError(`ScrapeCreators ${path}: ${message}`);
    }
    throw new Error(`ScrapeCreators ${path}: ${message}`);
  }
  return data as T;
}

class QuotaError extends Error {}

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
    try {
      const data = await request<T>(url, key.key, path);
      await markScrapeKeyOk(key.id);
      return data;
    } catch (err) {
      if (err instanceof QuotaError) {
        await markScrapeKeyExhausted(key.id);
        lastError = err;
        continue; // rotate to the next enabled key
      }
      throw err;
    }
  }

  throw lastError ?? new Error("All ScrapeCreators API keys are exhausted");
}
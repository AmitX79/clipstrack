// ScrapeCreators API client — shared by the Instagram and TikTok fetchers.

export const SCRAPECREATORS_API = "https://api.scrapecreators.com";

export async function scrapeGet<T>(
  path: string,
  params: Record<string, string | number | boolean>,
): Promise<T> {
  const apiKey = process.env.SCRAPECREATORS_API_KEY;
  if (!apiKey) {
    throw new Error("SCRAPECREATORS_API_KEY is not set");
  }
  const url = new URL(`${SCRAPECREATORS_API}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value != null) url.searchParams.set(key, String(value));
  }
  const res = await fetch(url, {
    headers: { "x-api-key": apiKey },
    cache: "no-store",
  });
  const data = (await res.json()) as { success?: boolean; message?: string };
  if (!res.ok || data.success === false) {
    throw new Error(`ScrapeCreators ${path}: ${data.message ?? res.status}`);
  }
  return data as T;
}
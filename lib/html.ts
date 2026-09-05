// Shared HTML fetching/extraction helpers for the Instagram and TikTok
// scrapers. Runs on the VPS cron (full Node.js), never in the Edge runtime.

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// Fetch a page as text with a browser-like UA and a hard timeout so a
// throttled/blocked target can't hang the cron run.
export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      "accept": "text/html,application/xhtml+xml",
      "accept-language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`GET ${url} returned ${res.status}`);
  }
  return res.text();
}

// Extract the raw contents of the first <script> matching a given attribute
// (either `type="..."` or `id="..."`). Returns null when the page has no
// such script — the usual sign of a bot-wall/redirect.
export function extractScriptTag(
  html: string,
  attr: { type?: string; id?: string },
): string | null {
  const pair =
    (attr.type ? `type="${attr.type}"` : "") +
    (attr.id ? `id="${attr.id}"` : "");
  if (!pair) return null;

  const re = new RegExp(
    `<script[^>]*${escapeRegExp(pair)}[^>]*>([\\s\\S]*?)</script>`,
    "i",
  );
  const match = html.match(re);
  return match?.[1] ?? null;
}

export function parseJsonScript<T>(script: string): T {
  // Some embedded JSON contains surrogate-escaped &lt; garbage; the leading
  // content is valid JSON in practice.
  return JSON.parse(script.replace(/^\/\/@?[a-z_-]*\s*/i, "")) as T;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
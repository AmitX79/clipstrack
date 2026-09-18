// Number formatting helpers. ClipsTrack always shows FULL numbers — no k/M
// abbreviations — so view counts stay truthful regardless of magnitude.

const fullFormatters = new Map<string, Intl.NumberFormat>();
function fullFormatter(locale: string) {
  let formatter = fullFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale);
    fullFormatters.set(locale, formatter);
  }
  return formatter;
}

// Render a count with locale-aware thousands separators: 1_234_567 -> "1,234,567".
// Accepts number or bigint (BigInt stats come back as `bigint` from Prisma).
export function formatFullNumber(value: number | bigint, locale = "en"): string {
  if (typeof value === "bigint") {
    return fullFormatter(locale).format(value);
  }
  if (Number.isSafeInteger(value)) {
    return fullFormatter(locale).format(value);
  }
  return value.toLocaleString(locale, { maximumFractionDigits: 0 });
}

// Convert a Prisma BigInt stat to a JS number for arithmetic/charts.
// Falls back to 0 when unavailable. Precision is fine up to 2^53.
export function bigintToNumber(value: bigint | null | undefined): number {
  return value == null ? 0 : Number(value);
}

const relativeFormatters = new Map<string, Intl.RelativeTimeFormat>();
const shortDateFormatters = new Map<string, Intl.DateTimeFormat>();
function relativeFormatter(locale: string) {
  let formatter = relativeFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    relativeFormatters.set(locale, formatter);
  }
  return formatter;
}
function shortDateFormatter(locale: string) {
  let formatter = shortDateFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { dateStyle: "short" });
    shortDateFormatters.set(locale, formatter);
  }
  return formatter;
}

// "never" | "just now" | "2 hours ago" | "5 days ago" | "9/1/24"
export function formatLastSynced(
  date: Date | null | undefined,
  locale = "en",
): string {
  if (!date) return "never";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return relativeFormatter(locale).format(-seconds, "second");

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return relativeFormatter(locale).format(-minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (hours < 24) return relativeFormatter(locale).format(-hours, "hour");

  const days = Math.round(hours / 24);
  if (days < 30) return relativeFormatter(locale).format(-days, "day");

  return shortDateFormatter(locale).format(date);
}

// Compact duration for video rows: "12s" | "3m" | "2h" | "4d". No trailing
// "ago" — callers wrap the value in a localized template ("Synced {t} ago",
// "há {t}", "{t}前" …).
export function formatRelativeCompact(date: Date, now: number = Date.now()): string {
  const ms = Math.max(0, now - date.getTime());
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h`;
  return `${Math.floor(ms / 86_400_000)}d`;
}

// Views/hour between two adjacent snapshots: "▲ 123/hr", or null when there
// is no earlier snapshot, either snapshot is missing view data, or the rate
// is not positive.
export function formatGrowthPerHour(
  previous: { views: number | null; recordedAt: Date } | null,
  current: { views: number | null; recordedAt: Date },
  unit = "/hr",
  locale = "en",
): string | null {
  if (!previous) return null;
  if (previous.views == null || current.views == null) return null;
  const hours =
    (current.recordedAt.getTime() - previous.recordedAt.getTime()) / 3_600_000;
  if (!(hours > 0)) return null;
  const rate = Math.round((current.views - previous.views) / hours);
  return rate > 0 ? `▲ ${formatFullNumber(rate, locale)}${unit}` : null;
}

const ratioFormatters = new Map<string, Intl.NumberFormat>();
function ratioFormatter(locale: string) {
  let formatter = ratioFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    ratioFormatters.set(locale, formatter);
  }
  return formatter;
}

// Like-ratio for a video row: likes / views as a percent ("46.2%"), or null
// when views are unknown.
export function formatLikeRatio(
  likes: number,
  views: number | null,
  locale = "en",
): string | null {
  if (views == null || views <= 0) return null;
  return `${ratioFormatter(locale).format((likes / views) * 100)}%`;
}
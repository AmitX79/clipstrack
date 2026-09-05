// Number formatting helpers. ClipsTrack always shows FULL numbers — no k/M
// abbreviations — so view counts stay truthful regardless of magnitude.

const fullFormatter = new Intl.NumberFormat("en-US");

// Render a count with thousands separators: 1_234_567 -> "1,234,567".
// Accepts number or bigint (BigInt stats come back as `bigint` from Prisma).
export function formatFullNumber(value: number | bigint): string {
  if (typeof value === "bigint") {
    return fullFormatter.format(value);
  }
  if (Number.isSafeInteger(value)) {
    return fullFormatter.format(value);
  }
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

// Convert a Prisma BigInt stat to a JS number for arithmetic/charts.
// Falls back to 0 when unavailable. Precision is fine up to 2^53.
export function bigintToNumber(value: bigint | null | undefined): number {
  return value == null ? 0 : Number(value);
}

const relativeFormatter = new Intl.RelativeTimeFormat("en-US", {
  numeric: "auto",
});
const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "short",
});

// "never" | "just now" | "2 hours ago" | "5 days ago" | "9/1/24"
export function formatLastSynced(date: Date | null | undefined): string {
  if (!date) return "never";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return relativeFormatter.format(-seconds, "second");

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return relativeFormatter.format(-minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (hours < 24) return relativeFormatter.format(-hours, "hour");

  const days = Math.round(hours / 24);
  if (days < 30) return relativeFormatter.format(-days, "day");

  return shortDateFormatter.format(date);
}
// Shared "most recent N by nearest date" selection used for both the one-time
// old-post backfill and the ongoing latest window.
//
// It never splits evenly per day: candidates are restricted to the requested
// content type first, then sorted newest-first by publish date, then cut at
// `limit`. E.g. posts on Sep 1 (x2), Sep 3 (x4), Sep 6 (x2) with limit 4 pick
// all 2 from Sep 6 + 2 from Sep 3 — the nearest dates first.

export function selectNearest<T>(
  items: T[],
  limit: number,
  getDate: (item: T) => number | undefined,
  isWanted?: (item: T) => boolean,
): T[] {
  const wanted = isWanted ? items.filter(isWanted) : items;
  const sorted = [...wanted].sort(
    (a, b) => (getDate(b) ?? 0) - (getDate(a) ?? 0),
  );
  return sorted.slice(0, limit);
}
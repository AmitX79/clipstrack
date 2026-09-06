import type { LoadedVideo } from "@/lib/channels";

export type SortKey = "published" | "views" | "likes" | "comments";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "published", label: "Newest first" },
  { value: "views", label: "Most views" },
  { value: "likes", label: "Most likes" },
  { value: "comments", label: "Most comments" },
];

// Sort one bucket of videos (a channel's latest or old list) by the active key.
export function sortVideos(videos: LoadedVideo[], key: SortKey): LoadedVideo[] {
  switch (key) {
    case "views":
      return [...videos].sort(
        (a, b) => (b.latest?.views ?? 0) - (a.latest?.views ?? 0),
      );
    case "likes":
      return [...videos].sort(
        (a, b) => (b.latest?.likes ?? 0) - (a.latest?.likes ?? 0),
      );
    case "comments":
      return [...videos].sort(
        (a, b) => (b.latest?.comments ?? 0) - (a.latest?.comments ?? 0),
      );
    default:
      return [...videos].sort(
        (a, b) =>
          new Date(b.publishedAt ?? 0).getTime() -
          new Date(a.publishedAt ?? 0).getTime(),
      );
  }
}
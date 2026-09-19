"use client";

import { useEffect, useState } from "react";
import { ChannelGroupSection } from "@/components/ChannelCard";
import type { VideoLayout } from "@/components/ChannelCard";
import { SORT_OPTIONS } from "@/lib/sort";
import type { SortKey } from "@/lib/sort";
import { PLATFORM_VALUES } from "@/lib/types";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { LoadedChannel } from "@/lib/channels";

const VIDEO_LAYOUT_KEY = "clipstrack.videoLayout";

function useVideoLayout(): [VideoLayout, (layout: VideoLayout) => void] {
  const [layout, setLayout] = useState<VideoLayout>("horizontal");
  useEffect(() => {
    const saved = window.localStorage.getItem(VIDEO_LAYOUT_KEY);
    if (saved === "horizontal" || saved === "vertical") setLayout(saved);
  }, []);
  const change = (next: VideoLayout) => {
    setLayout(next);
    window.localStorage.setItem(VIDEO_LAYOUT_KEY, next);
  };
  return [layout, change];
}

export function TrackedAccounts({
  channels,
  locale,
}: {
  channels: LoadedChannel[];
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const [sortBy, setSortBy] = useState<SortKey>("published");
  const [layout, setLayout] = useVideoLayout();

  const groups = PLATFORM_VALUES.map((platform) => ({
    platform,
    channels: channels.filter((c) => c.platform === platform),
  })).filter((group) => group.channels.length > 0);

  if (groups.length === 0) {
    return (
      <div className="mt-6 rounded-md border border-hairline bg-elevated px-6 py-14 text-center">
        <p className="mono-eyebrow text-mute">{dict.empty.eyebrow}</p>
        <h2 className="display-md mt-3 text-ink">{dict.empty.title}</h2>
        <p className="mx-auto mt-2 max-w-md text-base text-body">
          {dict.empty.before}
          <a href="#add" className="text-link hover:text-link-deep">
            {dict.empty.link}
          </a>
          {dict.empty.after}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <label className="mono-eyebrow text-mute">
          {dict.sort.label}
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortKey)}
            className="ml-2 h-9 rounded-[6px] border border-hairline bg-elevated px-2.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-elevated"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {dict.sort[option.value]}
              </option>
            ))}
          </select>
        </label>
        <div
          role="group"
          aria-label="Video layout"
          className="flex items-center rounded-[6px] border border-hairline bg-elevated p-0.5"
        >
          {(["horizontal", "vertical"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLayout(option)}
              aria-pressed={layout === option}
              className={`h-9 rounded-[4px] px-3 text-sm transition-colors ${
                layout === option
                  ? "bg-ink text-elevated"
                  : "text-mute hover:text-ink"
              }`}
            >
              {dict.layout[option]}
            </button>
          ))}
        </div>
      </div>
      {groups.map((group) => (
        <ChannelGroupSection
          key={group.platform}
          platform={group.platform}
          channels={group.channels}
          sortBy={sortBy}
          layout={layout}
          locale={locale}
        />
      ))}
    </>
  );
}
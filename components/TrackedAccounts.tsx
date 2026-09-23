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
  // Start at the server-rendered default so hydration never mismatches, then
  // pick up the saved preference after mount. Reading localStorage during the
  // initial useState would compute a *different* first client render than the
  // SSR HTML, and React keeps the server value — so the saved layout appeared
  // lost on every reload.
  const [layout, setLayout] = useState<VideoLayout>("horizontal");
  useEffect(() => {
    const saved = window.localStorage.getItem(VIDEO_LAYOUT_KEY);
    if (saved === "vertical" || saved === "horizontal") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the saved layout after mount is the intended fix for the hydration mismatch; doing it during render is what broke the toggle.
      setLayout(saved);
    }
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
  refreshDisabled = false,
}: {
  channels: LoadedChannel[];
  locale: Locale;
  refreshDisabled?: boolean;
}) {
  const dict = getDictionary(locale);
  const [sortBy, setSortBy] = useState<SortKey>("published");
  const [layout, setLayout] = useVideoLayout();

  // Below `sm` (640px) video lists always render vertically: horizontal
  // carousels are cramped on phones and the layout toggle is hidden there.
  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsSmall(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const effectiveLayout: VideoLayout = isSmall ? "vertical" : layout;

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
            className="ml-2 h-11 rounded-[6px] border border-hairline bg-elevated px-2.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-elevated sm:h-9"
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
          className="hidden items-center rounded-[6px] border border-hairline bg-elevated p-0.5 sm:flex"
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
          layout={effectiveLayout}
          locale={locale}
          refreshDisabled={
            refreshDisabled && group.platform !== "YOUTUBE"
          }
        />
      ))}
    </>
  );
}
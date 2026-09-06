"use client";

import Link from "next/link";
import { useState } from "react";
import { ChannelGroupSection } from "@/components/ChannelCard";
import { SORT_OPTIONS } from "@/lib/sort";
import type { SortKey } from "@/lib/sort";
import { PLATFORM_VALUES } from "@/lib/types";
import type { LoadedChannel } from "@/lib/channels";

export function TrackedAccounts({ channels }: { channels: LoadedChannel[] }) {
  const [sortBy, setSortBy] = useState<SortKey>("published");

  const groups = PLATFORM_VALUES.map((platform) => ({
    platform,
    channels: channels.filter((c) => c.platform === platform),
  })).filter((group) => group.channels.length > 0);

  if (groups.length === 0) {
    return (
      <div className="mt-6 rounded-md border border-hairline bg-elevated px-6 py-14 text-center">
        <p className="mono-eyebrow text-mute">No accounts yet</p>
        <h2 className="display-md mt-3 text-ink">
          Your tracked accounts will appear here.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-body">
          Add the first handle{" "}
          <Link href="#add" className="text-link hover:text-link-deep">
            here
          </Link>{" "}
          — stats start appearing after the first sync.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <label className="mono-eyebrow text-mute">
          Sort by
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortKey)}
            className="ml-2 h-8 rounded-[6px] border border-hairline bg-elevated px-2.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-elevated"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {groups.map((group) => (
        <ChannelGroupSection
          key={group.platform}
          platform={group.platform}
          channels={group.channels}
          sortBy={sortBy}
        />
      ))}
    </>
  );
}
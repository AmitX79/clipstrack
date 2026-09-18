"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addChannels } from "@/app/actions";
import { PLATFORM_LABELS, PLATFORM_VALUES } from "@/lib/types";
import type { PlatformValue } from "@/lib/types";

// The My Accounts add bar: a comma-separated handles input, a platform picker,
// old/latest count inputs and an Add button. Every handle in a batch is added
// on the picked platform, matching the original ClipsTrack visual tokens.
export function AddChannelBar() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [platform, setPlatform] = useState<PlatformValue>("YOUTUBE");
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    // Capture the form before awaiting — React nulls `event.currentTarget`
    // once the synchronous handler returns.
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await addChannels(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      form.reset();
      setMessage(result.message);
      router.refresh();
    });
  }

  const fieldClass =
    "h-11 rounded-[6px] border border-hairline px-3 text-sm text-ink " +
    "bg-elevated placeholder:text-faint focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-canvas focus-visible:border-link";

  const pillClass = (active: boolean) =>
    "h-9 rounded-[64px] border px-4 text-sm font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-elevated " +
    (active
      ? "border-ink bg-ink text-white"
      : "border-hairline bg-elevated text-body hover:border-ink hover:text-ink");

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <fieldset>
        <legend className="mono-eyebrow mb-2 w-full text-mute">
          Platform
        </legend>
        <div className="flex flex-wrap items-center gap-2">
          {PLATFORM_VALUES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={platform === value}
              onClick={() => setPlatform(value)}
              className={pillClass(platform === value)}
            >
              {PLATFORM_LABELS[value]}
            </button>
          ))}
        </div>
      </fieldset>

      <input type="hidden" name="platform" value={platform} />

      <div className="flex flex-wrap items-stretch gap-2">
        <input
          name="usernames"
          type="text"
          placeholder="Add channels… e.g. @mrbeast, @veritasium"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Handles to track"
          className={`${fieldClass} min-w-[220px] flex-1`}
        />
        <label className="flex h-11 items-center gap-2 rounded-[6px] border border-hairline bg-elevated px-2.5">
          <span className="mono-eyebrow text-mute">Old</span>
          <input
            name="oldVideoCount"
            type="number"
            min={0}
            max={200}
            step={1}
            inputMode="numeric"
            defaultValue={4}
            aria-label="Old videos count"
            className="w-14 bg-transparent text-sm tabular-nums text-ink focus-visible:outline-none"
          />
        </label>
        <label className="flex h-11 items-center gap-2 rounded-[6px] border border-hairline bg-elevated px-2.5">
          <span className="mono-eyebrow text-mute">Latest</span>
          <input
            name="latestVideoCount"
            type="number"
            min={0}
            max={200}
            step={1}
            inputMode="numeric"
            defaultValue={4}
            aria-label="Latest videos count"
            className="w-14 bg-transparent text-sm tabular-nums text-ink focus-visible:outline-none"
          />
        </label>
        <label className="flex h-11 items-center gap-2 rounded-[6px] border border-hairline bg-elevated px-2.5">
          <span className="mono-eyebrow text-mute">Ratio%</span>
          <input
            name="minLikeRatio"
            type="number"
            min={0}
            max={100}
            step={1}
            inputMode="numeric"
            placeholder="—"
            aria-label="Min like ratio percent, optional"
            title="Optional: flag videos whose like-ratio (likes/views %) falls below this"
            className="w-14 bg-transparent text-sm tabular-nums text-ink placeholder:text-faint focus-visible:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-[6px] bg-ink px-5 text-sm font-medium text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-60"
        >
          {isPending ? "Adding…" : "+ Add"}
        </button>
      </div>
      <div aria-live="polite">
        {error && (
          <p className="text-sm text-error" role="status">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-link" role="status">
            {message}
          </p>
        )}
      </div>
      <p className="text-xs leading-relaxed text-mute">
        Separate handles with commas — each is added on the platform you pick,
        in one go. The first snapshot starts immediately, then one sits every
        hour. Re-adding a handle updates it instead of duplicating. A Ratio% set
        per handle flags videos with a lower like-ratio as a warning.
      </p>
    </form>
  );
}
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addChannel } from "@/app/actions";
import { PLATFORM_LABELS, PLATFORM_VALUES } from "@/lib/types";
import type { PlatformValue } from "@/lib/types";

const PLATFORMS = PLATFORM_VALUES.map((value) => ({
  value,
  label: PLATFORM_LABELS[value],
}));

export function AddChannelForm() {
  const router = useRouter();
  const [platform, setPlatform] = useState<PlatformValue>("YOUTUBE");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    // Capture the element before the first await — React nulls
    // `event.currentTarget` once the synchronous handler finishes, and the
    // transition callback only runs after it (and after the action) resolves.
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await addChannel(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      form.reset();
      setMessage(
        result.synced
          ? `${result.channel} added and synced.`
          : `${result.channel} added — will sync shortly.`,
      );
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="platform" value={platform} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mono-eyebrow mb-1 text-mute">Platform</legend>
        <div className="flex flex-wrap items-center gap-2">
          {PLATFORMS.map(({ value, label }) => {
            const active = platform === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setPlatform(value);
                  setMessage(null);
                }}
                className={
                  "rounded-[64px] border px-4 h-9 text-sm font-medium transition-colors " +
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-elevated " +
                  (active
                    ? "bg-ink text-white border-ink"
                    : "bg-elevated text-body border-hairline hover:border-ink hover:text-ink")
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="username"
          className="mono-eyebrow text-mute"
        >
          Username
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute"
            >
              @
            </span>
            <input
              id="username"
              name="username"
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              disabled={isPending}
              required
              placeholder="mrbeast…"
              className="h-10 w-full rounded-[6px] border border-hairline bg-elevated pl-7 pr-3 text-sm text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-elevated focus-visible:border-link disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className={
              "h-10 rounded-[6px] bg-ink px-4 text-sm font-medium text-white " +
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-elevated " +
              "hover:bg-black disabled:opacity-60"
            }
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-30"
                  />
                  <path
                    d="M22 12a10 10 0 0 0-10-10"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
                Adding…
              </span>
            ) : (
              "Add Channel"
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label htmlFor="oldVideoCount" className="flex flex-col gap-1.5">
          <span className="mono-eyebrow text-mute">Old videos count</span>
          <input
            id="oldVideoCount"
            name="oldVideoCount"
            type="number"
            min={0}
            max={200}
            step={1}
            inputMode="numeric"
            defaultValue={8}
            disabled={isPending}
            aria-describedby="oldVideoCount-hint"
            className="h-10 w-full rounded-[6px] border border-hairline bg-elevated px-3 text-sm text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-elevated focus-visible:border-link disabled:opacity-60"
          />
          <span id="oldVideoCount-hint" className="text-xs leading-relaxed text-faint">
            Most recent existing videos, backfilled once.
          </span>
        </label>
        <label htmlFor="latestVideoCount" className="flex flex-col gap-1.5">
          <span className="mono-eyebrow text-mute">Latest videos count</span>
          <input
            id="latestVideoCount"
            name="latestVideoCount"
            type="number"
            min={0}
            max={200}
            step={1}
            inputMode="numeric"
            defaultValue={8}
            disabled={isPending}
            aria-describedby="latestVideoCount-hint"
            className="h-10 w-full rounded-[6px] border border-hairline bg-elevated px-3 text-sm text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-elevated focus-visible:border-link disabled:opacity-60"
          />
          <span id="latestVideoCount-hint" className="text-xs leading-relaxed text-faint">
            Newest uploads to keep tracking going forward.
          </span>
        </label>
      </div>

      <div aria-live="polite">
        {error && (
          <p className="text-sm text-error" role="status">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-link" role="status">
            {message}{" "}
            <Link href="/tracked" className="underline hover:text-link-deep">
              View tracked accounts →
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}
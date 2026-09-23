"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { addChannels, refreshChannel } from "@/app/actions";
import { useConsent } from "@/components/ConsentGate";
import {
  detectProfileUrl,
  isUrlLike,
  PLATFORM_LABELS,
  PLATFORM_VALUES,
} from "@/lib/types";
import type { PlatformValue } from "@/lib/types";
import { getDictionary, type Locale } from "@/lib/i18n";
import { Spinner } from "@/components/Spinner";

// The My Accounts add bar: a comma-separated handles input, a platform picker,
// old/latest count inputs and an Add button. Plain handles are added on the
// picked platform; pasted profile URLs are detected per-token and always land
// on their own platform, regardless of the selected tab. When a batch of URLs
// all point at the same platform, the tab auto-switches to match.
export function AddChannelBar({
  locale,
  exhausted = false,
}: {
  locale: Locale;
  exhausted?: boolean;
}) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const { status, requestConsent } = useConsent();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [platform, setPlatform] = useState<PlatformValue>("YOUTUBE");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

  function onUsernamesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const tokens = event.target.value.split(/[\s,;]+/).filter(Boolean);
    if (tokens.length === 0) return;

    // Every token must be a detectable URL for the tab to switch; a mix of
    // handles and URLs (or several platforms) stays on the current tab, with
    // the server resolving each URL to its own platform.
    const detected = tokens.map(detectProfileUrl);
    if (detected.some((d) => d === null)) return;
    const distinct = new Set(detected.map((d) => d!.platform));
    if (distinct.size === 1) {
      const target = detected[0]!.platform;
      if (target !== platform) setPlatform(target);
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    // Reject before hitting the server: a token that looks like a URL but
    // isn't a channel/profile link (video URL, unknown host, malformed input)
    // is an error, never a handle.
    const tokens = new FormData(event.currentTarget)
      .get("usernames")
      ?.toString()
      .split(/[\s,;]+/)
      .filter(Boolean);
    const bad = tokens?.find((token) => isUrlLike(token) && !detectProfileUrl(token));
    if (bad) {
      setError("Please paste a channel/profile link or handle, not a video link.");
      return;
    }

    // Capture the form before awaiting — React nulls `event.currentTarget`
    // once the synchronous handler returns. Kept in a ref too so the pending
    // re-submit (after consent is granted) can still reset the fields.
    const form = event.currentTarget;
    formRef.current = form;
    const formData = new FormData(form);
    requestConsent(() => {
      startTransition(async () => {
        const result = await addChannels(formData);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        formRef.current?.reset();
        setMessage(result.message);
        router.refresh();

        // Kick off each new card's first sync immediately — parallel server
        // actions, one per channel — so the page stays interactive while the
        // (ScrapeCreators/YouTube) fetches run. The cards show a "Syncing…"
        // state via the clipstrack:sync event and clear it when every channel
        // in the batch has settled.
        const ids = result.channels.map((c) => c.id);
        window.dispatchEvent(
          new CustomEvent("clipstrack:sync", { detail: { ids, pending: true } }),
        );
        void Promise.allSettled(ids.map((id) => refreshChannel(id))).then(() => {
          window.dispatchEvent(
            new CustomEvent("clipstrack:sync", { detail: { ids: [], pending: false } }),
          );
          router.refresh();
        });
      });
    });
  }

  const fieldClass =
    "h-11 rounded-[6px] border border-hairline px-3 text-sm text-ink " +
    "bg-elevated placeholder:text-faint focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-canvas focus-visible:border-link";

  const pillClass = (active: boolean) =>
    "h-11 rounded-[64px] border px-4 text-sm font-medium transition-colors sm:h-9 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-elevated " +
    (active
      ? "border-ink bg-ink text-on-ink"
      : "border-hairline bg-elevated text-body hover:border-ink hover:text-ink");

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      {exhausted && (
        <div
          role="status"
          className="rounded-md border border-error bg-elevated p-4 text-sm font-medium text-error"
        >
          {dict.credits.limitReached}
        </div>
      )}
      <fieldset>
        <legend className="mono-eyebrow mb-2 w-full text-mute">
          {dict.add.platform}
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
          placeholder={dict.add.placeholder}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={onUsernamesChange}
          aria-label={dict.add.ariaHandles}
          className={`${fieldClass} min-w-[220px] flex-1`}
        />
        <label className="flex h-11 items-center gap-2 rounded-[6px] border border-hairline bg-elevated px-2.5">
          <span className="mono-eyebrow text-mute">{dict.add.old}</span>
          <input
            name="oldVideoCount"
            type="number"
            min={0}
            max={200}
            step={1}
            inputMode="numeric"
            defaultValue={4}
            aria-label={dict.add.ariaOld}
            className="w-14 bg-transparent text-sm tabular-nums text-ink focus-visible:outline-none"
          />
        </label>
        <label className="flex h-11 items-center gap-2 rounded-[6px] border border-hairline bg-elevated px-2.5">
          <span className="mono-eyebrow text-mute">{dict.add.latest}</span>
          <input
            name="latestVideoCount"
            type="number"
            min={0}
            max={200}
            step={1}
            inputMode="numeric"
            defaultValue={4}
            aria-label={dict.add.ariaLatest}
            className="w-14 bg-transparent text-sm tabular-nums text-ink focus-visible:outline-none"
          />
        </label>
        <label className="flex h-11 items-center gap-2 rounded-[6px] border border-hairline bg-elevated px-2.5">
          <span className="mono-eyebrow text-mute">{dict.add.ratio}</span>
          <input
            name="minLikeRatio"
            type="number"
            min={0}
            max={100}
            step={0.1}
            inputMode="decimal"
            placeholder="-"
            aria-label={dict.add.ariaRatio}
            title={dict.add.ratioTitle}
            className="w-16 bg-transparent text-sm tabular-nums text-ink placeholder:text-faint focus-visible:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-[6px] bg-ink px-5 text-sm font-medium text-on-ink hover:bg-ink-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-60"
        >
          {isPending ? (
            <Spinner label={dict.add.adding} />
          ) : (
            dict.add.submit
          )}
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
      {status !== "granted" && (
        <p className="text-sm text-warning-deep" role="note">
          {dict.consent.note}
        </p>
      )}
      <p className="text-base text-mute">{dict.add.helper}</p>
    </form>
  );
}
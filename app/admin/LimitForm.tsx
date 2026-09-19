"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateDailyLimit } from "./actions";

const inputClass =
  "h-9 rounded-[6px] border border-hairline px-2.5 text-sm text-ink " +
  "bg-elevated placeholder:text-faint focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-canvas focus-visible:border-link";

const buttonClass =
  "h-9 rounded-[6px] px-3.5 text-sm font-medium transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

export function LimitForm({ initialLimit }: { initialLimit: number }) {
  const router = useRouter();
  const [value, setValue] = useState(String(initialLimit));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateDailyLimit(Number(value));
      if (result.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <label htmlFor="limit" className="flex flex-1 flex-col gap-1">
        <span className="mono-eyebrow text-mute">Credits per day</span>
        <input
          id="limit"
          name="limit"
          type="number"
          min={1}
          max={1000000}
          step={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`${inputClass} w-full`}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className={`${buttonClass} bg-ink text-on-ink hover:bg-ink-press disabled:opacity-60`}
      >
        {pending ? "Saving..." : saved ? "Saved ✓" : "Save"}
      </button>
      <div aria-live="polite" className="w-full basis-full">
        {error && (
          <p className="text-sm text-error" role="status">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
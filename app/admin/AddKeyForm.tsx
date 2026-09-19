"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addScrapeKey } from "./actions";

const inputClass =
  "h-9 rounded-[6px] border border-hairline px-2.5 text-sm text-ink " +
  "bg-elevated placeholder:text-faint focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-canvas focus-visible:border-link";

const buttonClass =
  "h-9 rounded-[6px] px-3.5 text-sm font-medium transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

export function AddKeyForm() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [secret, setSecret] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await addScrapeKey(label, secret);
      if (result.ok) {
        setLabel("");
        setSecret("");
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <label htmlFor="label" className="flex flex-1 flex-col gap-1">
        <span className="mono-eyebrow text-mute">Label</span>
        <input
          id="label"
          name="label"
          type="text"
          placeholder="e.g. work, backup"
          maxLength={60}
          required
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className={`${inputClass} w-full`}
        />
      </label>
      <label htmlFor="key" className="flex flex-[2] flex-col gap-1">
        <span className="mono-eyebrow text-mute">API key</span>
        <input
          id="key"
          name="key"
          type="password"
          autoComplete="off"
          placeholder="x-api-key from ScrapeCreators"
          minLength={8}
          required
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className={`${inputClass} w-full`}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className={`${buttonClass} bg-ink text-on-ink hover:bg-ink-press disabled:opacity-60`}
      >
        {pending ? "Adding..." : saved ? "Added ✓" : "Add key"}
      </button>
      <div aria-live="polite" className="w-full">
        {error && (
          <p className="text-sm text-error" role="status">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
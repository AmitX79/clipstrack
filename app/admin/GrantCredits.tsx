"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  grantCredits,
  lookupUserByCode,
  type GrantLookupUser,
} from "./actions";

const inputClass =
  "h-11 rounded-[6px] border border-hairline px-2.5 text-sm text-ink sm:h-9 " +
  "bg-elevated placeholder:text-faint focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-canvas focus-visible:border-link";

const buttonClass =
  "h-11 rounded-[6px] px-3.5 text-sm font-medium transition-colors sm:h-9 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

export function GrantCredits() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [user, setUser] = useState<GrantLookupUser | null>(null);
  const [lookupPending, setLookupPending] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [bonus, setBonus] = useState("");
  const [override, setOverride] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lookupPending || pending) return;
    setLookupError(null);
    setError(null);
    setSaved(false);
    setUser(null);
    setLookupPending(true);
    const result = await lookupUserByCode(code);
    setLookupPending(false);
    if (result.ok) {
      setUser(result.user);
      setBonus("");
      setOverride(
        result.user.limitOverride != null
          ? String(result.user.limitOverride)
          : "",
      );
    } else {
      setLookupError(result.error);
    }
  }

  function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !user) return;
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await grantCredits({
        code: user.code,
        addBonus: bonus.trim() === "" ? 0 : Number(bonus),
        limitOverride: override.trim() === "" ? null : Number(override),
      });
      if (result.ok) {
        setSaved(true);
        setBonus("");
        setOverride("");
        const again = await lookupUserByCode(user.code);
        if (again.ok) setUser(again.user);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={onSearch} id="grant-search-form" className="flex flex-wrap items-end gap-2">
        <label htmlFor="grant-code" className="flex flex-1 flex-col gap-1">
          <span className="mono-eyebrow text-mute">User ID</span>
          <input
            id="grant-code"
            name="code"
            type="text"
            placeholder="CT-X7K9P2"
            autoComplete="off"
            spellCheck={false}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className={`${inputClass} w-full font-mono uppercase`}
          />
        </label>
        <button
          type="submit"
          disabled={lookupPending || pending}
          className={`${buttonClass} border border-hairline text-body hover:text-ink disabled:opacity-60`}
        >
          {lookupPending ? "Searching..." : "Search"}
        </button>
      </form>

      {lookupError && (
        <p className="text-sm text-error" role="status">
          {lookupError}
        </p>
      )}

      {user && (
        <div className="rounded-md border border-hairline bg-canvas p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <span className="font-mono text-ink">{user.code}</span>
            <span className="text-body">
              Used today{" "}
              <span className="tabular-nums text-ink">{user.used}</span> of{" "}
              <span className="tabular-nums text-ink">{user.totalLimit}</span>
              {user.bonus > 0 && (
                <span className="text-faint"> (incl. {user.bonus} bonus)</span>
              )}
              {user.limitOverride != null && (
                <span className="text-faint">
                  {" "}· override {user.limitOverride}
                </span>
              )}
            </span>
          </div>
          <p className="mt-1 text-xs text-faint">
            Remaining today: {user.remaining}. Base limit (global or override):{" "}
            {user.baseLimit}.
          </p>

          <form onSubmit={onSave} id="grant-edit-form" className="mt-3 flex flex-wrap items-end gap-2">
            <label htmlFor="grant-bonus" className="flex flex-col gap-1">
              <span className="mono-eyebrow text-mute">Add bonus credits</span>
              <input
                id="grant-bonus"
                name="bonus"
                type="number"
                min={0}
                max={1000000}
                step={1}
                placeholder="0"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                className={`${inputClass} w-28`}
              />
            </label>
            <label htmlFor="grant-override" className="flex flex-col gap-1">
              <span className="mono-eyebrow text-mute">
                Daily limit override
              </span>
              <input
                id="grant-override"
                name="override"
                type="number"
                min={1}
                max={1000000}
                step={1}
                placeholder="blank = clear"
                value={override}
                onChange={(e) => setOverride(e.target.value)}
                className={`${inputClass} w-36`}
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
        </div>
      )}
    </div>
  );
}
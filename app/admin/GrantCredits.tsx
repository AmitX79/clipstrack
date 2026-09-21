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

function SaveButton({ pending, saved }: { pending: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${buttonClass} bg-ink text-on-ink hover:bg-ink-press disabled:opacity-60`}
    >
      {pending ? "Saving..." : saved ? "Saved ✓" : "Save"}
    </button>
  );
}

export function GrantCredits() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [user, setUser] = useState<GrantLookupUser | null>(null);
  const [lookupPending, setLookupPending] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [bonus, setBonus] = useState("");
  const [daily, setDaily] = useState("");
  const [bonusSaved, setBonusSaved] = useState(false);
  const [dailySaved, setDailySaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lookupPending || pending) return;
    setLookupError(null);
    setError(null);
    setBonusSaved(false);
    setDailySaved(false);
    setUser(null);
    setLookupPending(true);
    const result = await lookupUserByCode(code);
    setLookupPending(false);
    if (result.ok) {
      setUser(result.user);
      setBonus("");
      setDaily(
        result.user.dailyOverride != null ? String(result.user.dailyOverride) : "",
      );
    } else {
      setLookupError(result.error);
    }
  }

  async function refreshUser() {
    if (!user) return;
    const again = await lookupUserByCode(user.code);
    if (again.ok) setUser(again.user);
    router.refresh();
  }

  function onSaveBonus(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !user) return;
    const addBonus = bonus.trim() === "" ? 0 : Number(bonus);
    if (addBonus <= 0) return;
    setError(null);
    setBonusSaved(false);
    startTransition(async () => {
      const result = await grantCredits({
        code: user.code,
        addBonus,
        dailyOverride: null,
      });
      if (result.ok) {
        setBonusSaved(true);
        setBonus("");
        await refreshUser();
        setTimeout(() => setBonusSaved(false), 2000);
      } else {
        setError(result.error);
      }
    });
  }

  function onSaveDaily(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !user) return;
    const dailyOverride = daily.trim() === "" ? null : Number(daily);
    setError(null);
    setDailySaved(false);
    startTransition(async () => {
      const result = await grantCredits({
        code: user.code,
        addBonus: 0,
        dailyOverride,
      });
      if (result.ok) {
        setDailySaved(true);
        await refreshUser();
        setTimeout(() => setDailySaved(false), 2000);
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
              {user.dailyOverride != null && (
                <span className="text-faint">
                  {" "}· daily limit {user.dailyOverride}
                </span>
              )}
            </span>
          </div>
          <p className="mt-1 text-xs text-faint">
            Remaining today: {user.remaining}.{" "}
            {user.dailyOverride != null ? (
              <>
                Permanent daily limit set: {user.dailyOverride}. This replaces
                the global limit every day until changed or cleared.
              </>
            ) : (
              <>
                No permanent limit set — the global daily limit ({user.baseLimit}
                ) applies.
              </>
            )}
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <form
              onSubmit={onSaveBonus}
              id="grant-bonus-form"
              className="flex flex-wrap items-end gap-2"
            >
              <label htmlFor="grant-bonus" className="flex flex-col gap-1">
                <span className="mono-eyebrow text-mute">
                  Add one-time bonus credits
                </span>
                <input
                  id="grant-bonus"
                  name="bonus"
                  type="number"
                  min={1}
                  max={1000000}
                  step={1}
                  placeholder="0"
                  value={bonus}
                  onChange={(e) => setBonus(e.target.value)}
                  className={`${inputClass} w-28`}
                />
              </label>
              <div className="flex flex-col gap-1">
                <span className="mono-eyebrow text-mute">&nbsp;</span>
                <SaveButton pending={pending} saved={bonusSaved} />
              </div>
              <p className="w-full basis-full text-xs text-faint sm:hidden">
                One-time only — kicks in after the daily allowance and does not
                renew tomorrow.
              </p>
            </form>

            <form
              onSubmit={onSaveDaily}
              id="grant-daily-form"
              className="flex flex-wrap items-end gap-2"
            >
              <label htmlFor="grant-daily" className="flex flex-col gap-1">
                <span className="mono-eyebrow text-mute">
                  Permanent daily limit
                </span>
                <input
                  id="grant-daily"
                  name="daily"
                  type="number"
                  min={1}
                  max={1000000}
                  step={1}
                  placeholder="blank = clear"
                  value={daily}
                  onChange={(e) => setDaily(e.target.value)}
                  className={`${inputClass} w-36`}
                />
              </label>
              <div className="flex flex-col gap-1">
                <span className="mono-eyebrow text-mute">&nbsp;</span>
                <SaveButton pending={pending} saved={dailySaved} />
              </div>
              <p className="w-full basis-full text-xs text-faint sm:hidden">
                Replaces the global limit for this visitor every day until
                changed; blank clears it.
              </p>
            </form>
          </div>

          <div aria-live="polite" className="mt-2">
            {error && (
              <p className="text-sm text-error" role="status">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
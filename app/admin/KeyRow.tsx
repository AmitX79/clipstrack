"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { refreshKeyBalance, removeScrapeKey, toggleScrapeKey } from "./actions";

export type AdminScrapeKeyData = {
  id: string;
  label: string;
  keyMasked: string;
  active: boolean;
  quotaExhausted: boolean;
  remainingCredits: number | null;
  lastCheckedAt: string | null;
  createdAt: string;
};

type Busy = "toggle" | "remove" | "refresh" | null;

type ActionResult = { ok: true; remaining?: number | null } | { ok: false; error: string };

export function KeyRow({ item }: { item: AdminScrapeKeyData }) {
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(item.remainingCredits);
  const [busy, setBusy] = useState<Busy>(null);
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null,
  );
  const [, startTransition] = useTransition();

  function flash(kind: "ok" | "err", text: string) {
    setNote({ kind, text });
    setTimeout(() => setNote(null), 2500);
  }

  function run(
    kind: Exclude<Busy, null>,
    fn: () => Promise<ActionResult>,
  ) {
    if (busy) return;
    setNote(null);
    startTransition(async () => {
      setBusy(kind);
      try {
        const result = await fn();
        if (result.ok) {
          if (kind === "refresh" && result.remaining !== undefined) {
            setCredits(result.remaining);
          }
          router.refresh();
          flash(
            "ok",
            kind === "refresh"
              ? "Balance updated ✓"
              : kind === "toggle"
                ? item.active
                  ? "Key disabled"
                  : "Key enabled"
                : "Key removed",
          );
        } else {
          flash("err", result.error);
        }
      } finally {
        setBusy(null);
      }
    });
  }

  const exhausted = credits != null && credits <= 0;

  return (
    <li className="flex flex-col gap-1.5 py-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 flex-1">
          <span className="font-medium text-ink">{item.label}</span>
          <span className="ml-2 font-mono text-xs text-faint">
            {item.keyMasked}
          </span>
        </span>
        <span
          className={`mono-eyebrow text-xs tabular-nums ${
            credits == null
              ? "text-faint"
              : exhausted
                ? "text-error"
                : "text-body"
          }`}
        >
          {credits == null ? "balance unknown" : `${credits} credits`}
        </span>
        <button
          type="button"
          onClick={() => run("refresh", () => refreshKeyBalance(item.id))}
          disabled={busy != null}
          className="text-xs font-medium text-link hover:text-link-deep disabled:opacity-50"
        >
          {busy === "refresh" ? "Refreshing..." : "Refresh balance"}
        </button>
        <button
          type="button"
          onClick={() => run("toggle", () => toggleScrapeKey(item.id))}
          disabled={busy != null}
          className="text-xs font-medium text-link hover:text-link-deep disabled:opacity-50"
        >
          {busy === "toggle"
            ? item.active
              ? "Disabling..."
              : "Enabling..."
            : item.active
              ? "Disable"
              : "Enable"}
        </button>
        <button
          type="button"
          onClick={() => run("remove", () => removeScrapeKey(item.id))}
          disabled={busy != null}
          className="text-xs font-medium text-error hover:text-error-deep disabled:opacity-50"
        >
          {busy === "remove" ? "Removing..." : "Remove"}
        </button>
      </div>
      {note && (
        <p
          role="status"
          className={`text-xs ${note.kind === "ok" ? "text-link" : "text-error"}`}
        >
          {note.text}
        </p>
      )}
    </li>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeYoutubeKey, toggleYoutubeKey } from "./actions";

export type AdminYoutubeKeyData = {
  id: string;
  label: string;
  keyMasked: string;
  active: boolean;
  quotaExhausted: boolean;
  unitsUsed: number;
  limit: number;
  lastUsedAt: string | null;
  createdAt: string;
};

type Busy = "toggle" | "remove" | null;

export function YoutubeKeyRow({ item }: { item: AdminYoutubeKeyData }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Busy>(null);
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null,
  );
  const [, startTransition] = useTransition();

  function flash(kind: "ok" | "err", text: string) {
    setNote({ kind, text });
    setTimeout(() => setNote(null), 2500);
  }

  function run(kind: Exclude<Busy, null>, fn: () => Promise<{ ok: boolean; error?: string }>) {
    if (busy) return;
    setNote(null);
    startTransition(async () => {
      setBusy(kind);
      try {
        const result = await fn();
        if (result.ok) {
          router.refresh();
          flash(
            "ok",
            kind === "toggle"
              ? item.active
                ? "Key disabled"
                : "Key enabled"
              : "Key removed",
          );
        } else {
          flash("err", result.error ?? "Something went wrong.");
        }
      } finally {
        setBusy(null);
      }
    });
  }

  const exhausted = item.quotaExhausted || item.unitsUsed >= item.limit;
  const status = !item.active ? "disabled" : exhausted ? "exhausted" : "active";
  const statusClass = !item.active
    ? "text-faint"
    : exhausted
      ? "text-error"
      : "text-body";

  return (
    <li className="flex flex-col gap-1.5 py-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 flex-1">
          <span className="font-medium text-ink">{item.label}</span>
          <span className="ml-2 font-mono text-xs text-faint">
            {item.keyMasked}
          </span>
        </span>
        <span className={`mono-eyebrow text-xs tabular-nums ${statusClass}`}>
          {status} · {item.unitsUsed}/{item.limit}
        </span>
        <button
          type="button"
          onClick={() => run("toggle", () => toggleYoutubeKey(item.id))}
          disabled={busy != null}
          className="inline-flex min-h-[44px] items-center rounded-[6px] px-2 text-left text-xs font-medium text-link hover:bg-hairline-soft hover:text-link-deep disabled:opacity-50"
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
          onClick={() => run("remove", () => removeYoutubeKey(item.id))}
          disabled={busy != null}
          className="inline-flex min-h-[44px] items-center rounded-[6px] px-2 text-left text-xs font-medium text-error hover:bg-hairline-soft hover:text-error-deep disabled:opacity-50"
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

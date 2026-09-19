"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { refreshBalancesNow } from "./actions";

const buttonClass =
  "h-9 rounded-[6px] px-3.5 text-sm font-medium transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

export function RefreshAllButton() {
  const router = useRouter();
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (pending) return;
    setNote(null);
    startTransition(async () => {
      const result = await refreshBalancesNow();
      if (result.ok) {
        router.refresh();
        setNote({ kind: "ok", text: "Balances updated ✓" });
        setTimeout(() => setNote(null), 2500);
      } else {
        setNote({ kind: "err", text: result.error });
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={`${buttonClass} border border-hairline text-body hover:text-ink disabled:opacity-60`}
      >
        {pending ? "Refreshing..." : "Refresh balances"}
      </button>
      {note && (
        <p
          role="status"
          className={`text-xs ${note.kind === "ok" ? "text-link" : "text-error"}`}
        >
          {note.text}
        </p>
      )}
    </div>
  );
}
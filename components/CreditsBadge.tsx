"use client";

import { useEffect, useRef, useState } from "react";

// Right-aligned credits summary for the /accounts header. Hover (pointer) or
// tap (touch/keyboard) reveals the breakdown: YouTube is unlimited via its own
// official API quota, while Instagram + TikTok share the per-visitor
// ScrapeCreators budget. All text arrives pre-translated from the server.
export function CreditsBadge({
  badge,
  tooltipYt,
  tooltipIgtt,
}: {
  badge: string;
  tooltipYt: string;
  tooltipIgtt: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={badge}
        className="inline-flex h-11 items-center rounded-full border border-hairline bg-elevated px-4 text-sm font-medium text-body transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-canvas sm:h-9"
      >
        <span
          aria-hidden="true"
          className="mr-2 h-2 w-2 shrink-0 rounded-full bg-link"
        />
        <span className="tabular-nums">{badge}</span>
      </button>
      {open && (
        <div
          role="tooltip"
          aria-label={badge}
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-md border border-hairline bg-elevated p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0px_4px_16px_rgba(0,0,0,0.5)]"
        >
          <p className="text-sm leading-relaxed text-body">{tooltipYt}</p>
          <div className="my-3 h-px bg-hairline" aria-hidden="true" />
          <p className="text-sm font-medium leading-relaxed text-ink">
            {tooltipIgtt}
          </p>
        </div>
      )}
    </div>
  );
}
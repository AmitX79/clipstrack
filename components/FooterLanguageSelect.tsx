"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_LABELS,
  localizedHref,
  type Locale,
} from "@/lib/i18n";

function GlobeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[14px] w-[14px]">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// Compact language switcher for the footer. Like NavBar, locale changes are a
// hard navigation: window.location.href, never client-side router.push.
export function FooterLanguageSelect({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const pathname = usePathname();
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

  function switchLocale(next: Locale) {
    const rest =
      locale === DEFAULT_LOCALE
        ? pathname
        : pathname.replace(new RegExp(`^/${locale}`), "") || "/";
    setOpen(false);
    window.location.assign(localizedHref(next, rest === "/" ? "" : rest));
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className="inline-flex h-11 items-center gap-1.5 rounded-full border border-hairline bg-elevated px-3 text-sm font-medium text-body transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-canvas sm:h-9"
      >
        <GlobeIcon />
        <span className="tabular-nums">{locale.toUpperCase()}</span>
        <ChevronIcon />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={label}
          className="absolute bottom-full left-0 mb-1 w-44 rounded-md border border-hairline bg-elevated p-1 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0px_4px_16px_rgba(0,0,0,0.5)]"
        >
          {LOCALES.map((other) => (
            <button
              key={other}
              type="button"
              role="menuitemradio"
              aria-checked={other === locale}
              onClick={() => switchLocale(other)}
              className="flex w-full items-center justify-between gap-2 rounded-[6px] px-3 py-2 text-sm text-body hover:bg-hairline-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link"
            >
              <span>{LOCALE_LABELS[other]}</span>
              {other === locale && (
                <span aria-hidden="true" className="text-link">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
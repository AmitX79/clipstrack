"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_LABELS,
  getDictionary,
  localizedHref,
  type Locale,
} from "@/lib/i18n";

const THEME_KEY = "clipstrack.theme";

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-[18px] w-[18px]">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
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

export function NavBar({
  active,
  locale,
}: {
  active?: "home" | "accounts" | "faq";
  locale: Locale;
}) {
  const pathname = usePathname();
  const dict = getDictionary(locale);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const LINKS = [
    { href: localizedHref(locale, "/#how"), label: dict.nav.how, key: "how" },
    { href: localizedHref(locale, "/accounts"), label: dict.nav.accounts, key: "accounts" },
    { href: localizedHref(locale, "/faq"), label: dict.nav.faq, key: "faq" },
  ] as const;

  // Sync local toggle state after hydration (class is already set by inline
  // script in <head>, so no flash occurs — this just lets the button icon match).
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Close the language menu on outside click or Escape.
  useEffect(() => {
    if (!langOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (
        langRef.current &&
        !langRef.current.contains(event.target as Node)
      ) {
        setLangOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLangOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [langOpen]);

  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      /* storage unavailable — theme still applies for this page load */
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next ? "#0a0a0b" : "#fafafa");
    setDark(next);
  }

  function switchLocale(next: Locale) {
    const rest =
      locale === DEFAULT_LOCALE
        ? pathname
        : pathname.replace(new RegExp(`^/${locale}`), "") || "/";
    setLangOpen(false);
    window.location.href = localizedHref(next, rest === "/" ? "" : rest);
  }

  const linkClass = (key: string) =>
    "rounded-full px-3 py-2 text-sm tracking-[-0.02em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 " +
    (active === key ? "text-ink" : "text-body hover:text-ink");

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-white dark:bg-elevated">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6"
        aria-label="Primary"
      >
        <a href={localizedHref(locale, "")} className="flex items-center gap-2 text-base font-medium tracking-[-0.4px] text-ink">
          <img src="/logo.svg" alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
          ClipsTrack
        </a>

        <div className="ml-auto flex items-center gap-2">
          {/* Desktop links */}
          <div className="hidden items-center gap-1 sm:flex">
            {LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                aria-current={active === link.key ? "page" : undefined}
                className={linkClass(link.key)}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Language switcher — always visible */}
          <div ref={langRef} className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={langOpen}
              aria-label={dict.nav.lang}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-elevated px-3 text-sm font-medium text-body transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              <GlobeIcon />
              <span className="tabular-nums">{locale.toUpperCase()}</span>
              <ChevronIcon />
            </button>

            {langOpen && (
              <div
                role="menu"
                aria-label={dict.nav.lang}
                className="absolute right-0 top-full mt-1 w-44 rounded-md border border-hairline bg-elevated p-1 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0px_4px_16px_rgba(0,0,0,0.5)]"
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

          {/* Theme toggle — always visible */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={dark ? dict.nav.themeLight : dict.nav.themeDark}
            aria-pressed={dark}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-elevated text-body transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Desktop CTA */}
          <a
            href={localizedHref(locale, "/accounts#add")}
            className="hidden rounded-[6px] bg-ink px-4 py-2.5 text-base font-medium text-on-ink hover:bg-ink-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 sm:inline-flex"
          >
            {dict.nav.add}
          </a>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-hairline bg-elevated text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 sm:hidden"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div id="mobile-nav" className="border-t border-hairline bg-white dark:bg-elevated sm:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-3">
            {LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                aria-current={active === link.key ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className="rounded-[6px] px-3 py-2.5 text-sm text-ink hover:bg-hairline-soft"
              >
                {link.label}
              </a>
            ))}
            <a
              href={localizedHref(locale, "/accounts#add")}
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-[6px] bg-ink px-4 py-2.5 text-center text-base font-medium text-on-ink hover:bg-ink-press"
            >
              {dict.nav.add}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
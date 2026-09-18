"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/#how", label: "How it works", key: "how" },
  { href: "/tracked", label: "My Accounts", key: "tracked" },
];

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

export function NavBar({ active }: { active?: "tracked" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);

  // Sync local toggle state after hydration (class is already set by inline
  // script in <head>, so no flash occurs — this just lets the button icon match).
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

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

  const linkClass = (key: string) =>
    "rounded-full px-4 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 " +
    (active === key ? "text-ink" : "text-body hover:text-ink");

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-canvas">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6"
        aria-label="Primary"
      >
        <Link href="/" className="text-lg font-semibold tracking-[-0.4px] text-ink">
          ClipsTrack
        </Link>

        <div className="ml-auto flex items-center gap-2">
          {/* Desktop links */}
          <div className="hidden items-center gap-1 sm:flex">
            {LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                aria-current={active === link.key ? "page" : undefined}
                className={linkClass(link.key)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Theme toggle — always visible */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={dark}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-elevated text-body transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Desktop CTA */}
          <Link
            href="/tracked#add"
            className="hidden rounded-[6px] bg-ink px-4 py-2.5 text-base font-medium text-on-ink hover:bg-ink-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 sm:inline-flex"
          >
            Add channel
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-hairline bg-elevated text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 sm:hidden"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div id="mobile-nav" className="border-t border-hairline bg-canvas sm:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-3">
            {LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                aria-current={active === link.key ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className="rounded-[6px] px-3 py-2.5 text-base text-ink hover:bg-hairline-soft"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/tracked#add"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-[6px] bg-ink px-4 py-2.5 text-center text-base font-medium text-on-ink hover:bg-ink-press"
            >
              Add channel
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

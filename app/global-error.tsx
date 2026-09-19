"use client";

import { useEffect } from "react";
import "./globals.css";

// Root-level fallback rendered only when the root layout itself fails, so it
// must ship its own <html>/<body>. Kept minimal on purpose: no nav, no i18n,
// just a message plus a way back. next/font is unavailable here (client
// component), so the body falls back to the Geist/Arial stack below.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global] runtime error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "Geist, Arial, Helvetica, sans-serif" }}>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">
            Something broke on our end.
          </h1>
          <p className="text-sm text-body">Reload the page to get back.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-11 items-center rounded-full bg-ink px-7 text-sm font-medium text-on-ink hover:bg-ink-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
            >
              Try again
            </button>
            <a
              href="/"
              className="inline-flex h-11 items-center rounded-full border border-hairline bg-elevated px-7 text-sm font-medium text-ink hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
            >
              Reload page
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
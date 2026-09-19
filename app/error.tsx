"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import {
  DEFAULT_LOCALE,
  getDictionary,
  isLocale,
  localizedHref,
  type Locale,
} from "@/lib/i18n";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const segment = (pathname ?? "/").split("/")[1];
  const locale: Locale = isLocale(segment) ? segment : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  useEffect(() => {
    console.error("[page] runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-canvas">
      <NavBar locale={locale} />
      <main className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="mono-eyebrow text-mute">500</p>
        <h1 className="display-2xl mt-4 text-ink">{dict.error.runtimeTitle}</h1>
        <p className="mt-4 max-w-md text-base text-body">
          {dict.error.runtimeSub}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center rounded-full bg-ink px-8 text-base font-medium text-on-ink hover:bg-ink-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
          >
            {dict.error.tryAgain}
          </button>
          <Link
            href={localizedHref(locale, "")}
            className="inline-flex h-12 items-center rounded-full border border-hairline bg-elevated px-8 text-base font-medium text-ink hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
          >
            {dict.error.home}
          </Link>
        </div>
      </main>
    </div>
  );
}
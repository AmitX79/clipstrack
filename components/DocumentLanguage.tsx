"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n";

// Keeps <html lang> in sync with the routed locale on every navigation path.
// The [locale] layout's inline script covers initial full loads; soft
// navigations (NavBar links / language switcher) don't re-run that inline
// script, so this effect re-asserts the document language whenever the layout
// (re)mounts with a given locale.
export function DocumentLanguage({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
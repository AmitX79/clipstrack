"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Soft navigations can be served from the client-side Router Cache instead of a
// fresh server render, so a previously-visited page may show stale snapshots
// (e.g. "My Accounts" not showing the latest sync). The very first hard load of
// a page already receives fresh SSR data, so this skips it; every client-side
// navigation back to the page (module already initialized in this session)
// calls router.refresh() to re-request the server component and bypass the
// cache. router.refresh() never triggers a hard browser reload.
export function PageRefresh() {
  const router = useRouter();

  useEffect(() => {
    if (moduleState.__clipstrackVisited) {
      router.refresh();
    }
    moduleState.__clipstrackVisited = true;
  }, [router]);

  return null;
}

const moduleState = globalThis as { __clipstrackVisited?: boolean };
"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

// URL-driven search: each keystroke updates `?q=` (debounced), and the server
// re-renders the filtered card grid — the shareable, back/forward-friendly
// variant of a plain client-side filter.
export function AccountSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const trimmed = value.trim();
      const path = trimmed
        ? `/accounts?q=${encodeURIComponent(trimmed)}`
        : "/accounts";
      router.replace(path, { scroll: false });
    }, 300);
  }

  return (
    <input
      type="search"
      defaultValue={defaultValue}
      onChange={onChange}
      placeholder="Find an account by name…"
      aria-label="Search accounts"
      className="h-10 w-full max-w-sm rounded-[6px] border border-hairline bg-elevated px-3 text-sm text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-elevated focus-visible:border-link"
    />
  );
}
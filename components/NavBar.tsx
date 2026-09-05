import Link from "next/link";

const LINKS = [
  { href: "/#how", label: "How it works", key: "how" },
  { href: "/tracked", label: "Tracked accounts", key: "tracked" },
  { href: "/accounts", label: "All Accounts", key: "accounts" },
];

export function NavBar({ active }: { active?: "tracked" | "accounts" }) {
  return (
    <header className="border-b border-hairline bg-canvas">
      <nav
        className="mx-auto flex h-12 max-w-6xl items-center gap-4 px-6"
        aria-label="Primary"
      >
        <Link href="/" className="text-base font-semibold tracking-[-0.4px] text-ink">
          ClipsTrack
        </Link>
        <div className="ml-auto hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              aria-current={active === link.key ? "page" : undefined}
              className={
                "rounded-full px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 " +
                (active === link.key
                  ? "text-ink"
                  : "text-body hover:text-ink")
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link
          href="/#add"
          className="rounded-[6px] bg-ink px-3.5 py-2 text-sm font-medium text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
        >
          Add channel
        </Link>
      </nav>
    </header>
  );
}
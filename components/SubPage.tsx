import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import type { Locale } from "@/lib/i18n";

export function SubPage({
  locale,
  eyebrow,
  title,
  sub,
  children,
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas">
      <NavBar locale={locale} />
      <main className="mx-auto max-w-6xl px-6 pb-12">
        <section aria-label={eyebrow} className="pt-8 md:pt-12">
          <p className="mono-eyebrow text-mute">{eyebrow}</p>
          <h1 className="display-lg mt-3 text-ink">{title}</h1>
          {sub && <p className="mt-3 max-w-2xl text-base text-body">{sub}</p>}
          <div className="mt-8 space-y-8">{children}</div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
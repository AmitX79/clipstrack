import { getDictionary, type Locale } from "@/lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-16">
        <span className="text-sm text-body">
          <span className="font-semibold text-ink">ClipsTrack</span> —{" "}
          {dict.footer.after}
        </span>
        <span className="mono-eyebrow text-faint">{dict.footer.meta}</span>
      </div>
    </footer>
  );
}
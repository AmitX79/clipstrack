import Link from "next/link";
import { AddChannelForm } from "@/components/AddChannelForm";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";

function FeatureCard({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-hairline bg-elevated p-6">
      <p className="mono-eyebrow text-faint">{index}</p>
      <h3 className="display-md mt-3 text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-body">{children}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas">
      <NavBar />
      <main className="mx-auto max-w-6xl px-6 pb-16">
        {/* Hero */}
        <section
          aria-label="Intro"
          className="relative -mx-6 mb-10 overflow-hidden px-6 py-16 md:py-24"
        >
          <div aria-hidden="true" className="hero-mesh pointer-events-none absolute inset-0" />
          <div className="relative">
            <p className="mono-eyebrow text-mute">Multi-platform tracker</p>
            <h1 className="display-2xl mt-4 max-w-2xl text-ink">
              Every view, tracked.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-body">
              Add a YouTube, Instagram or TikTok handle. ClipsTrack snapshots
              its followers, posts and total views every hour — shown in
              full, never abbreviated.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="/#add"
                className="h-11 rounded-full bg-ink px-7 text-base font-medium text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
              >
                Add a channel
              </a>
              <Link
                href="/tracked"
                className="h-11 rounded-full border border-hairline bg-elevated px-7 text-base font-medium text-ink hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
              >
                View tracked accounts
              </Link>
            </div>
            <p className="mono-eyebrow mt-10 text-mute">
              YouTube&nbsp;&nbsp;·&nbsp;&nbsp;Instagram&nbsp;&nbsp;·&nbsp;&nbsp;TikTok
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how" aria-label="How it works" className="scroll-mt-24">
          <p className="mono-eyebrow text-mute">Why ClipsTrack</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <FeatureCard index="01" title="Hourly snapshots">
              A background job captures stats on the hour, so you can watch a
              channel climb — day by day, full number by full number.
            </FeatureCard>
            <FeatureCard index="02" title="Full numbers">
              No 1.2M or 400K guesses. Followers, views, likes and comments are
              stored and shown at their exact value.
            </FeatureCard>
            <FeatureCard index="03" title="Multi-platform">
              YouTube, Instagram and TikTok in one place, grouped per platform
              under a single set of cards and charts-ready time series.
            </FeatureCard>
          </div>
        </section>

        {/* Add channel */}
        <section
          id="add"
          aria-label="Track an account"
          className="scroll-mt-24 pt-16"
        >
          <div className="grid items-start gap-8 md:grid-cols-2">
            <div>
              <p className="mono-eyebrow text-mute">Track an account</p>
              <h2 className="display-lg mt-3 text-ink">
                Add a handle to get started.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-body">
                Pick the platform, enter a username, and the first sync starts
                immediately. New numbers are collected hourly after that.
              </p>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-body">
                <li className="flex gap-3">
                  <span aria-hidden="true" className="mt-0.5 text-link">→</span>
                  Everyone only ever sees their own tracked accounts.
                </li>
                <li className="flex gap-3">
                  <span aria-hidden="true" className="mt-0.5 text-link">→</span>
                  Re-adding a handle updates it instead of duplicating.
                </li>
                <li className="flex gap-3">
                  <span aria-hidden="true" className="mt-0.5 text-link">→</span>
                  Not synced yet? It stays queued for the next hourly run.
                </li>
              </ul>
            </div>
            <div className="rounded-md border border-hairline bg-elevated p-6 shadow-[0px_1px_1px_rgba(0,0,0,0.04)]">
              <AddChannelForm />
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section aria-label="Start tracking" className="pt-16">
          <div className="border-t border-hairline pt-14 text-center">
            <p className="mono-eyebrow text-mute">Ready when you are</p>
            <h2 className="display-lg mt-3 text-ink">Start tracking.</h2>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/#add"
                className="inline-flex h-11 items-center rounded-full bg-ink px-7 text-base font-medium text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
              >
                Add a channel
              </a>
              <Link
                href="/tracked"
                className="inline-flex h-11 items-center rounded-full border border-hairline bg-elevated px-7 text-base font-medium text-ink hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
              >
                View tracked accounts
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
import Link from "next/link";
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

const WEB_APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Clips Track",
  alternateName: "ClipsTrack",
  url: "https://clipstrack.vercel.app/",
  description:
    "A clip tracker for YouTube Shorts, Instagram Reels and TikTok videos. Snapshots views, likes and comments every hour, shown in full numbers, so you can track video views over time.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  inLanguage: "en",
  keywords:
    "clip tracker, video tracker, YouTube Shorts tracker, Instagram Reels tracker, TikTok video tracker",
};

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
            <p className="mono-eyebrow text-mute">Multi-platform clip tracker</p>
            <h1 className="display-2xl mt-4 max-w-3xl text-ink">
              Every clip, tracked in full — with{" "}
              <span className="text-link">Clips Track</span>.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-body">
              Add a YouTube, Instagram or TikTok handle. Clips Track snapshots
              each clip&apos;s views, likes and comments every hour — shown in
              full, never abbreviated.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="/tracked#add"
                className="inline-flex h-11 items-center rounded-full bg-ink px-7 text-base font-medium text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
              >
                Add a channel
              </a>
              <Link
                href="/tracked"
                className="inline-flex h-11 items-center rounded-full border border-hairline bg-elevated px-7 text-base font-medium text-ink hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
              >
                View my accounts
              </Link>
            </div>
            <p className="mono-eyebrow mt-10 text-mute">
              YouTube Shorts&nbsp;&nbsp;·&nbsp;&nbsp;Instagram
              Reels&nbsp;&nbsp;·&nbsp;&nbsp;TikTok
            </p>
          </div>
        </section>

        {/* What is ClipsTrack */}
        <section id="about" aria-label="What is Clips Track" className="scroll-mt-24">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(WEB_APP_SCHEMA) }}
          />
          <p className="mono-eyebrow text-mute">About</p>
          <h2 className="display-lg mt-3 text-ink">What is Clips Track?</h2>
          <div className="mt-4 max-w-3xl space-y-4 text-sm leading-relaxed text-body">
            <p>
              Clips Track is a clip tracker built for short-form content. Add a
              YouTube Shorts channel, an Instagram creator or a TikTok account,
              and Clips Track records how each clip performs — views, likes,
              comments and favorites — on the hour, every hour. There is no
              spreadsheet to maintain and no manual export: you open a page and
              see exactly what a clip did yesterday and what it is doing right
              now, down to the exact number.
            </p>
            <p>
              Most analytics dashboards round everything into &ldquo;1.2M&rdquo;
              and &ldquo;400K&rdquo;. Clips Track deliberately goes the other
              way, storing each figure at its precise value so a genuine
              comparison is always possible. Whether you call it clip tracking,
              a video tracker, or a clip performance tracker, the idea is the
              same: deliberate, exact, hourly measurements of the short-form
              videos that move your channel.
            </p>
          </div>
        </section>

        {/* Per-platform rules */}
        <section aria-label="Platform content rules" className="pt-16">
          <p className="mono-eyebrow text-mute">Platform rules</p>
          <h2 className="display-lg mt-3 text-ink">
            Track the right clips on every platform
          </h2>
          <div className="mt-4 space-y-4">
            <FeatureCard index="01" title="YouTube Shorts tracker">
              Clips Track only stores YouTube Shorts — clips at most a minute
              long that appear in the Shorts feed. Long-form uploads never leak
              into the numbers, so each channel card stays a true Shorts
              tracker. Views, likes and comments are pulled straight from the
              YouTube Data API and snapshotted on the hour, giving you a clean
              signal of which Shorts actually perform.
            </FeatureCard>
            <FeatureCard index="02" title="Instagram Reels tracker">
              On Instagram, Clips Track follows Reels only. Regular photo posts
              and carousels are filtered out, because Instagram publishes no
              view count for them — and Clips Track never invents numbers
              where the platform publishes none. Every Reel keeps its real play
              count, likes and comments, so the tracker shows growth you can
              actually trust.
            </FeatureCard>
            <FeatureCard index="03" title="TikTok video tracker">
              TikTok is a video-first platform, and Clips Track keeps it that
              way. Photo-mode posts and active live streams are excluded; only
              plain videos with playable URLs are tracked, along with their
              digg, comment and favorite counts. The result is a focused TikTok
              video tracker of the clips that matter — not a dump of every
              item a profile ever posted.
            </FeatureCard>
          </div>
        </section>

        {/* How it works */}
        <section id="how" aria-label="How it works" className="scroll-mt-24 pt-16">
          <p className="mono-eyebrow text-mute">Why ClipsTrack</p>
          <h2 className="display-lg mt-3 text-ink">Full numbers, hourly</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <FeatureCard index="01" title="Hourly snapshots">
              A background job captures stats on the hour, so you can watch
              clips climb — day by day, full number by full number, without
              lifting a finger.
            </FeatureCard>
            <FeatureCard index="02" title="Full numbers">
              No 1.2M or 400K guesses. Views, likes and comments are stored and
              shown at their exact value, every time.
            </FeatureCard>
            <FeatureCard index="03" title="Ratio alerts">
              Set an optional min like-ratio per channel; clips that fall below
              the threshold are flagged with a warning, so weak performance
              stands out at a glance.
            </FeatureCard>
          </div>
          <div className="mt-4 max-w-3xl space-y-4 text-sm leading-relaxed text-body">
            <p>
              To track video views reliably, Clips Track stores a time series —
              one measurement per clip per hour. Open a clip today and you can
              still see what it did a month ago: the first-hour leap on a new
              Reel, the slow morning crawl of a Short, a TikTok video that
              suddenly re-accelerates days later. Because the history is kept in
              exact numbers, the growth curve stays honest and comparable no
              matter when you look at it.
            </p>
            <p>
              The per-clip numbers pair with channel-level totals — followers,
              lifetime views and post counts, also snapshotted hourly. That is
              what turns raw counts into a real clip performance tracker: you
              can compare how a new upload performs against the channel&apos;s
              baseline, spot which formats keep their like-ratio, and decide
              where the next post deserves its momentum.
            </p>
          </div>
        </section>

        {/* Buckets */}
        <section aria-label="Old and latest windows" className="pt-16">
          <div className="border-t border-hairline pt-14">
            <p className="mono-eyebrow text-mute">Windows</p>
            <h2 className="display-lg mt-3 text-ink">
              Old clips backfilled, new clips watched
            </h2>
            <div className="mt-4 max-w-3xl space-y-4 text-sm leading-relaxed text-body">
              <h3 className="display-md text-ink">How buckets work</h3>
              <p>
                When you add a handle, Clips Track first backfills recent clips
                into an <em>Old</em> bucket — a one-time snapshot of the recent
                past. From then on, a <em>Latest</em> bucket keeps just the
                newest uploads, refreshed on every hourly sync. Which clips
                belong to which bucket is decided by publish date, never by
                guesswork, and clips never jump between buckets.
              </p>
              <h3 className="display-md text-ink">Counts you control</h3>
              <p>
                The window sizes are yours to pick per channel: backfill the
                last eight clips and track the newest four, or any other
                combination that fits how you watch. Lower a count and the
                extras are trimmed immediately; raise it and the window re-opens
                and backfills to match. Targeted clips get removed cleanly,
                history and all, so the dashboard always reflects what you
                actually want to watch.
              </p>
              <h3 className="display-md text-ink">Who it is for</h3>
              <p>
                Creators who want to track clip views without a spreadsheet.
                Growth teams comparing Shorts, Reels and TikTok in one view.
                Agencies that report exact numbers to clients. And anyone who
                has ever squinted at a rounded view count and wondered what the
                real figure was. Add as few or as many channels as you like —
                each one carries its own windows and alerts, so the dashboard
                scales from a single handle to a whole roster.
              </p>
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
                href="/tracked#add"
                className="inline-flex h-11 items-center rounded-full bg-ink px-7 text-base font-medium text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
              >
                Add a channel
              </a>
              <Link
                href="/tracked"
                className="inline-flex h-11 items-center rounded-full border border-hairline bg-elevated px-7 text-base font-medium text-ink hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
              >
                View my accounts
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
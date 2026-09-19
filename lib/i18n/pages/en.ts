import type { PageContent } from "./types";

export const en: PageContent = {
  meta: {
    about: {
      title: "About Us",
      description:
        "What ClipsTrack is and why it exists - exact, hourly clip numbers for YouTube Shorts, Instagram Reels and TikTok, without spreadsheets.",
    },
    privacy: {
      title: "Privacy Policy",
      description:
        "What ClipsTrack stores (your tracked channels, public stats and a ct_uid session cookie), why, and how to request full deletion of your data.",
    },
    terms: {
      title: "Terms & Conditions",
      description:
        "The terms for using ClipsTrack - acceptable use, data accuracy and liability, service availability, and how tracked accounts can be removed.",
    },
    contact: {
      title: "Contact Us",
      description:
        "Questions, deletion requests or broken trackers - reach the ClipsTrack team via the contact form or by email.",
    },
  },
  about: {
    eyebrow: "About Us",
    title: "What ClipsTrack is, and why it exists",
    intro:
      "ClipsTrack started with a small annoyance: every analytics dashboard rounds views to “1.2M” and “400K”. Compare a Short and a Reel honestly and you're comparing guesswork.",
    sections: [
      {
        h: "Exact numbers, every hour",
        p: "ClipsTrack snapshots views, likes, comments and favorites for every clip you add - on the hour, every hour, kept at their exact value. No rounding, no “1.2M”. The number you see is the number the platform published at that moment.",
      },
      {
        h: "One page for all three platforms",
        p: "It tracks YouTube Shorts, Instagram Reels and TikTok from a single list of handles. Add a channel, and every video that matches the platform's short-form rules is measured automatically - no spreadsheets, no manual exports.",
      },
      {
        h: "Who it's for",
        p: "Creators and agencies who run the same clip across several platforms and want to compare them properly, plus anyone tired of maintaining a spreadsheet of video stats by hand.",
      },
      {
        h: "What it isn't",
        p: "ClipsTrack isn't an ads dashboard, a scheduler or a full analytics suite. No feature bloat, no newsletters. It does one thing - exact, hourly clip tracking - and does it quietly.",
      },
    ],
    closing:
      "ClipsTrack is self-hosted, small on purpose, and made for the people who want real numbers. That's you. Go add a channel.",
  },
  privacy: {
    eyebrow: "Privacy",
    title: "Privacy Policy",
    intro:
      "The short version: ClipsTrack stores only what it needs to track clips, never sells your data, and lets you delete everything whenever you want.",
    sections: [
      {
        h: "What we store",
        p: "The only data we keep is what makes tracking work: the handles you submit (YouTube, Instagram or TikTok channel names, URLs or IDs), the public statistics we snapshot for those channels (views, likes, comments and favorites, each with a timestamp), and a small per-visitor identifier.",
      },
      {
        h: "The ct_uid cookie",
        p: "On your first visit we set a cookie named ct_uid - a random identifier with no personal information in it. It exists so the channels you add stay tied to you and not to other visitors. It doesn't track you across other sites, and there's no third-party tracking or advertising anywhere on ClipsTrack.",
      },
      {
        h: "Public data only",
        p: "The statistics we record are public platform data - the same numbers anyone can see by opening the profile. We never capture private information, direct messages, or anything that isn't already publicly visible. What we add is the organization: hourly snapshots, in one place.",
      },
      {
        h: "What we don't do",
        p: "We don't sell, rent or share your data with anyone. There are no ads and no data brokers connected to ClipsTrack. Your tracked accounts are visible only to you and are stored separately from every other visitor's.",
      },
      {
        h: "Requesting deletion",
        p: "To erase everything, send us a note from the contact page and mark it as a deletion request - or email support@clipstrack.com - and we'll remove all channels and history tied to your visitor ID. Because each visitor's data is isolated, deleting yours never touches anyone else's.",
      },
      {
        h: "Automatic cleanup",
        p: "Accounts that stay idle are removed automatically after 90 days, along with their snapshots. If you come back later, you start fresh.",
      },
      {
        h: "Changes",
        p: "If this policy changes materially, we'll update this page with a new date.",
      },
    ],
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms & Conditions",
    intro:
      "These terms cover your use of ClipsTrack - the website you're using right now and anything it offers. By adding channels or using the service, you accept them.",
    sections: [
      {
        h: "Acceptable use",
        p: "ClipsTrack exists to track short-form video accounts. Use it for that, and use it responsibly: don't attempt to break the service, bulk-scrape data to resell, harass account owners, or track accounts you have no legitimate interest in.",
      },
      {
        h: "Where data comes from",
        p: "Statistics are sourced from third-party platforms: the YouTube Data API, Instagram and TikTok. Those platforms control what is published and can change, throttle or remove it at any time. ClipsTrack records what they publish - it doesn't generate or correct the numbers.",
      },
      {
        h: "No guarantee of accuracy",
        p: "We do our best to snapshot faithfully, but we make no warranty that the data is accurate, complete or up to date. Counts may lag, be temporarily unavailable, or differ from what a platform itself shows, and we're not responsible for decisions made from the numbers.",
      },
      {
        h: "Service availability",
        p: "ClipsTrack is provided 'as is' and 'as available'. It may be slow, change or stop working without notice - including for maintenance, platform API changes or cost reasons. We're not liable for any downtime.",
      },
      {
        h: "Removal and suspension",
        p: "We may remove accounts, data or access to the service at our discretion and without notice - for example to protect the service, or where required by law.",
      },
      {
        h: "Liability limits",
        p: "To the maximum extent permitted by law, ClipsTrack and its operators are not liable for indirect, incidental, consequential or special damages arising from your use of the service, even if advised of the possibility.",
      },
      {
        h: "Contact",
        p: "Questions about these terms? Reach us via the contact page or at support@clipstrack.com.",
      },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Contact Us",
    sub: "A question, a deletion request, a broken tracker - send us a note and we'll get back to you.",
    email: "support@clipstrack.com",
    form: {
      name: "Name",
      email: "Email",
      message: "Message",
      namePlaceholder: "Your name",
      emailPlaceholder: "you@example.com",
      messagePlaceholder: "How can we help?",
      submit: "Send message",
      invalid: "Please add your name, a valid email, and a message.",
      mailtoNote:
        "If your email app doesn't open, write to support@clipstrack.com directly.",
    },
    mailtoSubject: "Contact from ClipsTrack",
    mailtoBody:
      "From the ClipsTrack contact page.\n\nName: {name}\nEmail: {email}\n\n{message}",
  },
};
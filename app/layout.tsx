import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Base site-level metadata. Per-locale title/description/OG/twitter live in
// app/[locale]/layout.tsx; metadataBase resolves the relative OG/canonical URLs.
export const metadata: Metadata = {
  metadataBase: new URL("https://clipstrack.vercel.app"),
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: { title: "ClipsTrack" },
  keywords: [
    "Clips Track",
    "clip tracker",
    "video tracker",
    "YouTube Shorts tracker",
    "Instagram Reels tracker",
    "TikTok video tracker",
    "track video views",
  ],
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#fafafa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            // Apply the saved/system theme before first paint to avoid a
            // light-mode flash. Also sync the meta theme-color (mobile chrome).
            __html: `(function(){try{var k="clipstrack.theme";var s=localStorage.getItem(k);var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=d?"#0a0a0b":"#fafafa";}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors`}
      >
        {children}
      </body>
    </html>
  );
}
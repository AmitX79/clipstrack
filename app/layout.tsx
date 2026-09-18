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

export const metadata: Metadata = {
  metadataBase: new URL("https://clipstrack.vercel.app"),
  title: {
    default: "Clips Track — YouTube Shorts, Reels & TikTok Tracker",
    template: "%s | Clips Track",
  },
  description:
    "Clips Track is a clip performance tracker for YouTube Shorts, Instagram Reels and TikTok videos — views, likes and comments every hour, in full numbers.",
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
  openGraph: {
    type: "website",
    siteName: "Clips Track",
    url: "/",
    title: "Clips Track — YouTube Shorts, Reels & TikTok Tracker",
    description:
      "Track views, likes and comments for YouTube Shorts, Instagram Reels and TikTok videos — hourly, in full numbers.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Clips Track — every view, tracked in full numbers",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clips Track — YouTube Shorts, Reels & TikTok Tracker",
    description:
      "Track views, likes and comments for YouTube Shorts, Instagram Reels and TikTok videos — hourly, in full numbers.",
    images: ["/og.png"],
  },
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
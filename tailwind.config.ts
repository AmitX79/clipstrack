import type { Config } from "tailwindcss";

// Design tokens from DESIGN.md (Vercel/Geist system).
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#fafafa",
        elevated: "#ffffff",
        "hairline-soft": "#f2f2f2",
        hairline: "#ebebeb",
        ink: "#171717",
        body: "#4d4d4d",
        mute: "#8f8f8f",
        faint: "#a1a1a1",
        link: "#0070f3",
        "link-deep": "#0761d1",
        "link-soft": "#d3e5ff",
        error: "#ee0000",
        "error-deep": "#c50000",
        warning: "#f5a623",
        "warning-soft": "#ffefcf",
        "warning-deep": "#ab570a",
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "Geist",
          "Arial",
          "Helvetica",
          "sans-serif",
        ],
        mono: ["var(--font-geist-mono)", "Geist Mono", "monospace"],
      },
      borderRadius: {
        // DESIGN.md: app chrome 6px, cards 12px, category pills 64px
        sm: "6px",
        md: "12px",
        lg: "16px",
        "pill-category": "64px",
      },
    },
  },
  plugins: [],
};
export default config;
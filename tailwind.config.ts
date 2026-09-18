import type { Config } from "tailwindcss";

// Design tokens from DESIGN.md (Vercel/Geist system).
const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        elevated: "var(--elevated)",
        "hairline-soft": "var(--hairline-soft)",
        hairline: "var(--hairline)",
        ink: "var(--ink)",
        // Primary button press/hover (light mode: black, dark mode: dimmer)
        "ink-press": "var(--ink-press)",
        // Text on a bg-ink surface (light mode: white, dark mode: near-black)
        "on-ink": "var(--on-ink)",
        body: "var(--body)",
        mute: "var(--mute)",
        faint: "var(--faint)",
        link: "var(--link)",
        "link-deep": "var(--link-deep)",
        "link-soft": "var(--link-soft)",
        error: "var(--error)",
        "error-deep": "var(--error-deep)",
        warning: "var(--warning)",
        "warning-soft": "var(--warning-soft)",
        "warning-deep": "var(--warning-deep)",
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
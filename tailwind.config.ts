import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-cairo)", "Cairo", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      colors: {
        // Use CSS variables — defined in globals.css for light/dark
        bg: {
          deepest: "rgb(var(--bg-deepest) / <alpha-value>)",
          primary: "rgb(var(--bg-primary) / <alpha-value>)",
          card: "rgb(var(--bg-card) / <alpha-value>)",
          elevated: "rgb(var(--bg-elevated) / <alpha-value>)",
          hover: "rgb(var(--bg-hover) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          soft: "rgb(var(--border-soft) / <alpha-value>)",
          strong: "rgb(var(--border-strong) / <alpha-value>)",
        },
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--text-tertiary) / <alpha-value>)",
        },
        gold: {
          DEFAULT: "rgb(var(--gold) / <alpha-value>)",
          bright: "rgb(var(--gold-bright) / <alpha-value>)",
          soft: "rgb(var(--gold-soft) / <alpha-value>)",
        },
        green: {
          DEFAULT: "rgb(var(--green) / <alpha-value>)",
        },
        red: {
          DEFAULT: "rgb(var(--red) / <alpha-value>)",
        },
        blue: {
          DEFAULT: "rgb(var(--blue) / <alpha-value>)",
        },
        orange: {
          DEFAULT: "rgb(var(--orange) / <alpha-value>)",
        },
        purple: {
          DEFAULT: "rgb(var(--purple) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};

export default config;

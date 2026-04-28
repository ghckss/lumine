import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        backgroundSoft: "var(--color-background-soft)",
        surface: "var(--color-surface)",
        surfaceElevated: "var(--color-surface-elevated)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        line: "var(--color-line)",
        primary: "var(--color-primary)",
        primarySoft: "var(--color-primary-soft)",
        accent: "var(--color-accent)",
        accentSoft: "var(--color-accent-soft)",
        danger: "var(--color-danger)",
        glow: "var(--color-glow)"
      }
    }
  },
  plugins: []
};

export default config;

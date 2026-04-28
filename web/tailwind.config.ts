import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        onBackground: "var(--color-on-background)",
        surface: "var(--color-surface)",
        surfaceDim: "var(--color-surface-dim)",
        surfaceBright: "var(--color-surface-bright)",
        surfaceContainerLowest: "var(--color-surface-container-lowest)",
        surfaceContainerLow: "var(--color-surface-container-low)",
        surfaceContainer: "var(--color-surface-container)",
        surfaceContainerHigh: "var(--color-surface-container-high)",
        surfaceContainerHighest: "var(--color-surface-container-highest)",
        surfaceVariant: "var(--color-surface-variant)",
        onSurface: "var(--color-on-surface)",
        onSurfaceVariant: "var(--color-on-surface-variant)",
        outline: "var(--color-outline)",
        outlineVariant: "var(--color-outline-variant)",
        primary: "var(--color-primary)",
        onPrimary: "var(--color-on-primary)",
        primaryContainer: "var(--color-primary-container)",
        onPrimaryContainer: "var(--color-on-primary-container)",
        primaryFixed: "var(--color-primary-fixed)",
        secondary: "var(--color-secondary)",
        onSecondary: "var(--color-on-secondary)",
        secondaryContainer: "var(--color-secondary-container)",
        tertiary: "var(--color-tertiary)",
        tertiaryContainer: "var(--color-tertiary-container)",
        error: "var(--color-error)",
        errorContainer: "var(--color-error-container)"
      },
      fontFamily: {
        body: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-body)", "sans-serif"]
      },
      boxShadow: {
        moon: "0 12px 40px rgba(177, 156, 217, 0.15)",
        ambient: "0 8px 32px rgba(177, 156, 217, 0.10)"
      },
      backdropBlur: {
        moon: "12px"
      }
    }
  },
  plugins: []
};

export default config;

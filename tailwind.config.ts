import type { Config } from "tailwindcss";

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
        background: "#0B0B0F",
        surface: "#111116",
        "surface-elevated": "#16161D",
        border: "#1E1E25",
        "border-subtle": "#181820",
        primary: {
          DEFAULT: "#7C5CFF",
          hover: "#6D4DF5",
          foreground: "#FFFFFF",
        },
        cyan: {
          DEFAULT: "#22D3EE",
          subtle: "rgba(34,211,238,0.1)",
        },
        success: {
          DEFAULT: "#22C55E",
          subtle: "rgba(34,197,94,0.12)",
        },
        warning: {
          DEFAULT: "#F59E0B",
          subtle: "rgba(245,158,11,0.12)",
        },
        danger: {
          DEFAULT: "#F43F5E",
          subtle: "rgba(244,63,94,0.12)",
        },
        "text-primary": "#F4F4F5",
        "text-secondary": "#A1A1AA",
        "text-tertiary": "#52525B",
        muted: {
          DEFAULT: "#1E1E25",
          foreground: "#A1A1AA",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
        full: "9999px",
      },
      boxShadow: {
        "elevation-1": "0 1px 2px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
        "elevation-2": "0 4px 12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
        "elevation-3": "0 8px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
        "primary-glow": "0 0 20px rgba(124,92,255,0.3)",
        "inset-border": "inset 0 0 0 1px rgba(255,255,255,0.06)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(4px)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-8px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "check-in": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.15s ease-out",
        "scale-in": "scale-in 0.15s ease-out",
        "slide-in-left": "slide-in-left 0.15s ease-out",
        "check-in": "check-in 0.2s ease-out",
        shimmer: "shimmer 2s infinite linear",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ---- surfaces (deep, slightly cool neutrals) ----
        base: "#0B0B0F",
        surface: "#121218",
        raised: "#18181F",
        hover: "#1E1E27",
        line: "rgba(255,255,255,0.07)",
        "line-hi": "rgba(255,255,255,0.12)",
        // ---- text ----
        ink: {
          hi: "#F5F5F7",
          DEFAULT: "#C6C6D0",
          lo: "#8A8A99",
          faint: "#5C5C6B",
        },
        // ---- brand: electric violet ----
        violet: {
          400: "#9B82FF",
          500: "#7C5CFF",
          600: "#6A45F0",
        },
        indigo: { 500: "#5B5BF0" },
        // ---- semantic ----
        success: "#34D399",
        warn: "#FBBF24",
        danger: "#F87171",
        info: "#60A5FA",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'Geist Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "28px",
      },
      boxShadow: {
        e1: "0 1px 2px rgba(0,0,0,0.4)",
        e2: "0 8px 30px rgba(0,0,0,0.45)",
        e3: "0 24px 70px rgba(0,0,0,0.55)",
        glow: "0 0 0 1px rgba(124,92,255,0.30), 0 8px 32px rgba(124,92,255,0.22)",
        "glow-sm": "0 0 0 1px rgba(124,92,255,0.25), 0 4px 18px rgba(124,92,255,0.18)",
      },
      backgroundImage: {
        brand: "linear-gradient(135deg, #7C5CFF, #5B5BF0)",
        "brand-soft": "linear-gradient(135deg, rgba(124,92,255,0.16), rgba(91,91,240,0.10))",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "caret-blink": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "gradient-pan": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1s steps(2) infinite",
        shimmer: "shimmer 1.6s infinite",
        "fade-up": "fade-up 0.22s cubic-bezier(0.22,1,0.36,1)",
        "gradient-pan": "gradient-pan 6s ease infinite",
      },
    },
  },
  plugins: [typography],
} satisfies Config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080c14",
        surface: {
          50: "#141c2e",
          100: "#0f172a",
          200: "#0b1120",
          300: "#070b14",
        },
        neon: {
          cyan: "#00f0ff",
          cyanGlow: "rgba(0, 240, 255, 0.4)",
          emerald: "#10b981",
          emeraldGlow: "rgba(16, 185, 129, 0.4)",
          purple: "#a855f7",
          pink: "#ec4899",
          blue: "#3b82f6",
        },
      },
      boxShadow: {
        "neon-cyan": "0 0 20px -3px rgba(0, 240, 255, 0.35)",
        "neon-emerald": "0 0 20px -3px rgba(16, 185, 129, 0.35)",
        "neon-purple": "0 0 20px -3px rgba(168, 85, 247, 0.35)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "neon-glow": "radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.15), transparent 70%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s infinite linear",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

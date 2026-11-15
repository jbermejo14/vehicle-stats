/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: "#0A0A0C",
        card: "#111115",
        "card-hover": "#16161C",
        border: "#1F1F26",
        "border-bright": "#2E2E38",
        accent: {
          DEFAULT: "#FF5500",
          hover: "#FF6B00",
          glow: "rgba(255, 85, 0, 0.25)",
          amber: "#FF9E00",
          coral: "#FF2A00",
        },
        telemetry: {
          green: "#00E599",
          cyan: "#00E5FF",
          blue: "#3B82F6",
          yellow: "#EAB308",
          purple: "#A855F7",
          white: "#F4F4F6",
          gray: "#52525B",
          darkGray: "#27272A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(255, 85, 0, 0.25)",
        "glow-lg": "0 0 35px rgba(255, 85, 0, 0.4)",
        "glow-amber": "0 0 20px rgba(255, 158, 0, 0.25)",
        "glow-green": "0 0 20px rgba(0, 229, 153, 0.25)",
        "glow-cyan": "0 0 20px rgba(0, 229, 255, 0.25)",
      },
      animation: {
        "radar-sweep": "radar 4s linear infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "scan-line": "scanline 6s linear infinite",
      },
      keyframes: {
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 8px rgba(255, 85, 0, 0.4))" },
          "50%": { opacity: "0.7", filter: "drop-shadow(0 0 2px rgba(255, 85, 0, 0.1))" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
    },
  },
  plugins: [],
};

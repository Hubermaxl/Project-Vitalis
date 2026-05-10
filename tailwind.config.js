/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        royal: {
          DEFAULT: "#1d4ed8",
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        status: {
          optimal:  "#059669",
          normal:   "#d97706",
          kritisch: "#dc2626",
        },
        cat: {
          blutbild:     "#e11d48",
          stoffwechsel: "#d97706",
          lipide:       "#7c3aed",
          entzuendung:  "#ea580c",
          schilddruese: "#0284c7",
          leber:        "#059669",
          niere:        "#0891b2",
          vitamine:     "#ca8a04",
          hormone:      "#a21caf",
        },
      },
      fontFamily: {
        sans:    ["var(--font-dm-sans)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["var(--font-instrument-serif)", "Georgia", "serif"],
      },
      letterSpacing: {
        hero:    "-0.078em",  // -2.5px @ 32px
        h1:      "-0.04em",   // -1.2px @ 30px
        h2:      "-0.022em",  // -0.4px @ 18px
      },
      boxShadow: {
        card:  "0 8px 24px rgba(0,0,0,0.08)",
        cardDark: "0 8px 24px rgba(0,0,0,0.40)",
        float: "0 8px 32px rgba(0,0,0,0.10)",
        deep:  "0 20px 48px rgba(0,0,0,0.07)",
      },
    },
  },
  plugins: [],
};

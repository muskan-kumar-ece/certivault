import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        "surface-prominent": "var(--surface-raised)",
        ink: {
          DEFAULT: "var(--ink)",
          secondary: "var(--ink-secondary)",
        },
        hairline: "var(--hairline)",
        brand: {
          primary: "var(--brand-primary)",
          navy: "var(--brand-navy)",
          violet: "var(--brand-violet)",
          cyan: "var(--brand-cyan)",
          soft: "var(--brand-soft)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
        },
        seal: "var(--seal)",
        verified: "var(--seal)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      borderRadius: {
        control: "12px",
        card: "16px",
        sheet: "24px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;

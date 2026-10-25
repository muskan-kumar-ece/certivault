/**
 * CertiVault Design System Tokens (PRD.md §11)
 * Apple-style minimalist aesthetic with strict semantic usage.
 */

export const colors = {
  canvas: {
    light: "#F5F5F7",
    dark: "#000000",
  },
  surface: {
    light: "#FFFFFF",
    dark: "#1C1C1E",
  },
  surfaceRaised: {
    light: "#FFFFFF",
    dark: "#2C2C2E",
  },
  ink: {
    primary: {
      light: "#1D1D1F",
      dark: "#F5F5F7",
    },
    secondary: {
      light: "#6E6E73",
      dark: "#98989D",
    },
  },
  hairline: {
    light: "rgba(60,60,67,0.12)",
    dark: "rgba(84,84,88,0.45)",
  },
  accent: {
    ultramarine: {
      light: "#3355FF",
      dark: "#6B85FF",
    },
    hover: {
      light: "#2642CC",
      dark: "#849BFF",
    },
  },
  seal: {
    verified: {
      light: "#1FA971",
      dark: "#34C98B",
    },
  },
  warning: {
    light: "#E08A00",
    dark: "#FF9F0A",
  },
  danger: {
    light: "#D92D20",
    dark: "#FF453A",
  },
} as const;

export const radii = {
  control: "12px",
  card: "16px",
  sheet: "24px",
  pill: "9999px",
} as const;

export const spacing = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  6: "24px",
  8: "32px",
  12: "48px",
} as const;

export const springs = {
  default: {
    type: "spring",
    stiffness: 380,
    damping: 32,
  },
  snappy: {
    type: "spring",
    stiffness: 450,
    damping: 35,
  },
  gentle: {
    type: "spring",
    stiffness: 280,
    damping: 28,
  },
} as const;

export const typography = {
  largeTitle: { size: "2.125rem", lineHeight: "2.5625rem", weight: "700" }, // 34/41
  title: { size: "1.75rem", lineHeight: "2.125rem", weight: "700" },      // 28/34
  headline: { size: "1.0625rem", lineHeight: "1.375rem", weight: "600" },  // 17/22
  body: { size: "1.0625rem", lineHeight: "1.5rem", weight: "400" },       // 17/24
  subhead: { size: "0.9375rem", lineHeight: "1.25rem", weight: "400" },    // 15/20
  footnote: { size: "0.8125rem", lineHeight: "1.125rem", weight: "400" },  // 13/18
  caption: { size: "0.75rem", lineHeight: "1rem", weight: "400" },        // 12/16
} as const;

/**
 * CertiVault Design System Tokens (PRD.md §11)
 * Apple-style minimalist aesthetic with strict semantic usage.
 */

export const colors = {
  canvas: {
    light: "#F7F8FC",
    dark: "#0B0F19",
  },
  surface: {
    light: "#FFFFFF",
    dark: "#10152E",
  },
  surfaceRaised: {
    light: "#FFFFFF",
    dark: "#1A2035",
  },
  ink: {
    primary: {
      light: "#111827",
      dark: "#F9FAFB",
    },
    secondary: {
      light: "#64748B",
      dark: "#94A3B8",
    },
  },
  hairline: {
    light: "rgba(226, 232, 240, 0.8)",
    dark: "rgba(51, 65, 85, 0.5)",
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
  brand: {
    primary: "#365CFF",
    navy: "#10152E",
    violet: "#8B5CF6",
    cyan: "#67E8F9",
    soft: "#F7F8FC",
  },
  seal: {
    verified: {
      light: "#1FA971",
      dark: "#34C98B",
    },
  },
  warning: {
    light: "#F59E0B",
    dark: "#FBBF24",
  },
  danger: {
    light: "#EF4444",
    dark: "#F87171",
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

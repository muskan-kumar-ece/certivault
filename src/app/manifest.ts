import type { MetadataRoute } from "next";
import { colors } from "@/lib/tokens";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CertiVault — Verified Certificate Engine",
    short_name: "CertiVault",
    description: "Issue and verify bulk certificates for Indian colleges and student clubs.",
    start_url: "/app",
    display: "standalone",
    background_color: colors.canvas.light,
    theme_color: colors.accent.ultramarine.light,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}

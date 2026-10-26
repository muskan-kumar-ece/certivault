import type { Metadata, Viewport } from "next";
import { colors } from "@/lib/tokens";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://certivault.venopai.in"),
  title: "CertiVault — Verifiable Certificates at Scale",
  description:
    "Issue 1,000 verified certificates in 5 minutes. Anyone can check them in 5 seconds.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CertiVault",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: colors.canvas.light },
    { media: "(prefers-color-scheme: dark)", color: colors.canvas.dark },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full font-sans antialiased bg-canvas text-ink flex flex-col" suppressHydrationWarning>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

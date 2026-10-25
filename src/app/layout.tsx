import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CertiVault — Verifiable Certificates at Scale",
  description:
    "Issue 1,000 verified certificates in 5 minutes. Anyone can check them in 5 seconds.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F5F7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
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
    <html lang="en" className="h-full">
      <body className="h-full font-sans antialiased bg-canvas text-ink flex flex-col">
        {children}
      </body>
    </html>
  );
}

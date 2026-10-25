import React from "react";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}

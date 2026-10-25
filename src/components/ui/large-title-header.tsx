import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export interface LargeTitleHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function LargeTitleHeader({
  title,
  subtitle,
  backHref,
  actions,
  className = "",
}: LargeTitleHeaderProps) {
  return (
    <div className={`space-y-1.5 text-left ${className}`}>
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline mb-2 press-feedback"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[34px] leading-[41px] font-bold tracking-tight text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base text-ink-secondary mt-1">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2.5">{actions}</div>}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { usePressMotion } from "./motion";

export interface ListRowProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightAccessory?: React.ReactNode;
  trailing?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  className?: string;
}

export function ListRow({
  title,
  subtitle,
  leftIcon,
  rightAccessory,
  trailing,
  actions,
  onClick,
  showChevron = true,
  className = "",
}: ListRowProps) {
  const press = usePressMotion();
  const accessory = trailing ?? rightAccessory;

  return (
    <motion.div
      {...(onClick ? press : {})}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      onClick={onClick}
      className={`flex items-center justify-between p-3.5 sm:p-4 bg-surface rounded-control border border-hairline transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        onClick ? "cursor-pointer hover:bg-surface-raised" : ""
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {leftIcon && (
          <div className="w-9 h-9 rounded-control bg-canvas border border-hairline flex items-center justify-center flex-shrink-0 text-ink">
            {leftIcon}
          </div>
        )}
        <div className="min-w-0 text-left">
          <p className="text-sm font-semibold text-ink truncate">{title}</p>
          {subtitle && (
            <p className="text-xs text-ink-secondary truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        {accessory}
        {actions}
        {onClick && showChevron && !accessory && !actions && (
          <ChevronRight className="w-4 h-4 text-ink-secondary" />
        )}
      </div>
    </motion.div>
  );
}

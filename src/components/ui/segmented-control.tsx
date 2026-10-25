"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";

export interface SegmentedControlOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  name?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className = "",
  name,
}: SegmentedControlProps) {
  const generatedId = useId();
  const layoutId = `segmented-${name ?? generatedId}`;

  return (
    <div
      role="radiogroup"
      aria-label={name ?? "Select option"}
      className={`inline-flex items-center p-1 rounded-control bg-canvas border border-hairline select-none min-h-[44px] ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={`relative flex-1 min-w-[72px] min-h-[36px] py-1.5 px-3 text-xs font-semibold rounded-control transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer touch-manipulation press-feedback ${
              isSelected ? "text-ink" : "text-ink-secondary hover:text-ink"
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-control bg-surface shadow-sm border border-hairline -z-0"
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 35,
                }}
              />
            )}
            <span className="relative z-10 block truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

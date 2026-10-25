"use client";

import React from "react";
import { motion } from "framer-motion";

export interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number; // diameter in px
  strokeWidth?: number;
  className?: string;
  ariaLabel?: string;
}

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 6,
  className = "",
  ariaLabel = "Progress indicator",
}: ProgressRingProps) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (normalizedProgress / 100) * circumference;

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={normalizedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--hairline)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--accent)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          fill="transparent"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      </svg>
      <span className="absolute font-mono text-xs font-bold text-ink">
        {Math.round(normalizedProgress)}%
      </span>
    </div>
  );
}

export function ProgressBar({
  progress,
  className = "",
  ariaLabel = "Progress bar",
}: {
  progress: number;
  className?: string;
  ariaLabel?: string;
}) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={normalizedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full h-2 rounded-full bg-canvas border border-hairline overflow-hidden ${className}`}
    >
      <motion.div
        className="h-full bg-accent rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${normalizedProgress}%` }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
      />
    </div>
  );
}

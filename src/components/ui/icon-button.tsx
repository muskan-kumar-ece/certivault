"use client";

import React, { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { usePressMotion } from "./motion";
import { ButtonVariant } from "./button";

export interface IconButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "aria-label"> {
  "aria-label"?: string;
  ariaLabel?: string;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  icon: React.ReactNode | React.ComponentType<{ className?: string }>;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-accent hover:bg-accent-hover text-white focus-visible:ring-accent",
  secondary: "bg-surface hover:bg-surface-raised text-ink border border-hairline focus-visible:ring-accent",
  tinted: "bg-accent/10 hover:bg-accent/20 text-accent focus-visible:ring-accent",
  destructive: "bg-danger hover:bg-danger/90 text-white focus-visible:ring-danger",
  ghost: "bg-transparent hover:bg-surface-raised text-ink focus-visible:ring-accent",
};

const sizeStyles = {
  // sm has 44px touch bounding box via pseudo-element expansion
  sm: "w-9 h-9 min-w-[36px] min-h-[36px] rounded-control relative after:absolute after:inset-[-4px] after:content-['']",
  md: "w-11 h-11 min-w-[44px] min-h-[44px] rounded-control", // 44px Apple minimum touch target
  lg: "w-12 h-12 min-w-[48px] min-h-[48px] rounded-card",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      "aria-label": ariaLabelProp,
      ariaLabel,
      variant = "secondary",
      size = "md",
      icon: IconOrNode,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const press = usePressMotion();
    const label = ariaLabel ?? ariaLabelProp;

    if (!label && process.env.NODE_ENV !== "production") {
      console.warn("IconButton: ariaLabel or aria-label is required for accessibility.");
    }

    const renderedIcon = React.isValidElement(IconOrNode) ? (
      IconOrNode
    ) : typeof IconOrNode === "function" ? (
      React.createElement(IconOrNode, { className: "w-5 h-5" })
    ) : null;

    return (
      <motion.button
        ref={ref}
        aria-label={label || "Action"}
        disabled={disabled}
        {...press}
        className={`inline-flex items-center justify-center font-medium outline-none transition-colors select-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-50 disabled:pointer-events-none cursor-pointer touch-manipulation ${
          variantStyles[variant]
        } ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {renderedIcon}
      </motion.button>
    );
  }
);

IconButton.displayName = "IconButton";

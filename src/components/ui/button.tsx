"use client";

import React, { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { usePressMotion } from "./motion";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tinted"
  | "destructive"
  | "ghost";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent hover:bg-accent-hover text-white shadow-sm focus-visible:ring-accent",
  secondary:
    "bg-surface hover:bg-surface-raised text-ink border border-hairline focus-visible:ring-accent",
  tinted:
    "bg-accent/10 hover:bg-accent/20 text-accent focus-visible:ring-accent",
  destructive:
    "bg-danger hover:bg-danger/90 text-white shadow-sm focus-visible:ring-danger",
  ghost:
    "bg-transparent hover:bg-surface-raised text-ink focus-visible:ring-accent",
};

const sizeStyles: Record<ButtonSize, string> = {
  // sm has 44px touch area via pseudo-element expansion
  sm: "h-9 px-3 text-xs rounded-control min-w-[36px] relative after:absolute after:inset-[-4px] after:content-['']",
  md: "h-11 px-4 text-sm rounded-control min-w-[44px]", // 44px Apple minimum touch target
  lg: "h-12 px-6 text-base rounded-card min-w-[48px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const press = usePressMotion();

    return (
      <motion.button
        ref={ref}
        disabled={disabled || loading}
        {...press}
        className={`inline-flex items-center justify-center gap-2 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer touch-manipulation ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!loading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

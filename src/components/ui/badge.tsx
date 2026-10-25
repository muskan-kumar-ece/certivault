import React from "react";

export type BadgeVariant = "verified" | "warning" | "danger" | "neutral" | "accent";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  showDot?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  verified: {
    container: "bg-seal/10 text-seal border-seal/20",
    dot: "bg-seal",
  },
  warning: {
    container: "bg-warning/10 text-warning border-warning/20",
    dot: "bg-warning",
  },
  danger: {
    container: "bg-danger/10 text-danger border-danger/20",
    dot: "bg-danger",
  },
  neutral: {
    container: "bg-canvas text-ink-secondary border-hairline",
    dot: "bg-ink-secondary",
  },
  accent: {
    container: "bg-accent/10 text-accent border-accent/20",
    dot: "bg-accent",
  },
};

export function Badge({
  variant = "neutral",
  showDot = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles.container} ${className}`}
      {...props}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />}
      <span>{children}</span>
    </span>
  );
}

import React from "react";

export interface EmptyStateProps {
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: IconOrNode,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  const renderedIcon = React.isValidElement(IconOrNode) ? (
    IconOrNode
  ) : typeof IconOrNode === "function" ? (
    React.createElement(IconOrNode, { className: "w-6 h-6" })
  ) : null;

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-card bg-surface border border-hairline space-y-4 ${className}`}
    >
      {renderedIcon && (
        <div className="w-12 h-12 rounded-full bg-canvas flex items-center justify-center text-ink-secondary border border-hairline">
          {renderedIcon}
        </div>
      )}
      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-bold text-ink">{title}</h3>
        <p className="text-sm text-ink-secondary">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

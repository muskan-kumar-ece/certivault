"use client";

import React, { forwardRef, useId } from "react";

export interface FieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, helperText, className = "", id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const inputId = providedId ?? generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const describedBy = error
      ? errorId
      : helperText
      ? helperId
      : undefined;

    return (
      <div className={`space-y-1.5 text-left ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary"
          >
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`w-full px-3.5 py-2.5 min-h-[44px] rounded-control bg-canvas border text-ink text-base placeholder:text-ink-secondary/60 outline-none transition-colors focus:ring-2 focus:ring-accent/20 focus:border-accent disabled:opacity-50 disabled:bg-surface-raised cursor-text ${
            error
              ? "border-danger focus:border-danger focus:ring-danger/20"
              : "border-hairline"
          }`}
          {...props}
        />
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-danger font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-ink-secondary">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Field.displayName = "Field";

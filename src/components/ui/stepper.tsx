"use client";

import React from "react";
import { Check } from "lucide-react";

export interface StepItem {
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  className = "",
}: StepperProps) {
  return (
    <nav aria-label="Progress Stepper" className={`w-full py-2 ${className}`}>
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = !!onStepClick && index <= currentStep;

          return (
            <li
              key={step.label}
              className={`flex flex-1 items-center ${
                index < steps.length - 1 ? "pr-2 sm:pr-4" : ""
              }`}
            >
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(index)}
                aria-current={isCurrent ? "step" : undefined}
                className={`flex items-center gap-2.5 min-h-[44px] py-1 px-1 rounded-control outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isClickable ? "cursor-pointer press-feedback" : "cursor-default"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                    isCompleted
                      ? "bg-accent text-white"
                      : isCurrent
                      ? "bg-accent/15 border-2 border-accent text-accent"
                      : "bg-surface border border-hairline text-ink-secondary"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                </div>

                <div className="hidden sm:block text-left">
                  <span
                    className={`block text-xs font-semibold ${
                      isCurrent
                        ? "text-ink font-bold"
                        : isCompleted
                        ? "text-ink"
                        : "text-ink-secondary"
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="block text-[11px] text-ink-secondary">
                      {step.description}
                    </span>
                  )}
                </div>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                    index < currentStep ? "bg-accent" : "bg-hairline"
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

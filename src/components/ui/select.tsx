"use client";

import React from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  error?: string;
  disabled?: boolean;
}

export function Select({
  label,
  value,
  onChange,
  onValueChange,
  options,
  placeholder = "Select an option",
  className = "",
  error,
  disabled = false,
}: SelectProps) {
  const handleChange = (val: string) => {
    onValueChange?.(val);
    onChange?.(val);
  };

  return (
    <div className={`space-y-1.5 text-left ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary">
          {label}
        </label>
      )}

      <RadixSelect.Root value={value} onValueChange={handleChange} disabled={disabled}>
        <RadixSelect.Trigger className="w-full min-h-[44px] inline-flex items-center justify-between px-3.5 py-2.5 rounded-control bg-canvas border border-hairline text-ink text-sm outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon className="text-ink-secondary">
            <ChevronDown className="w-4 h-4" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className="z-50 w-[var(--radix-select-trigger-width)] max-h-60 overflow-y-auto rounded-card bg-surface border border-hairline shadow-lg p-1 animate-in fade-in-80"
          >
            <RadixSelect.Viewport>
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="relative flex items-center justify-between px-3 py-2 rounded-control text-sm text-ink outline-none select-none hover:bg-surface-raised cursor-pointer data-[highlighted]:bg-surface-raised data-[state=checked]:text-accent font-medium"
                >
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator>
                    <Check className="w-4 h-4 text-accent" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

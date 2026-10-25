"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Check, ChevronsUpDown } from "lucide-react";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  label,
  error,
  disabled = false,
  className = "",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();

  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}

      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger
          id={id}
          disabled={disabled}
          className={`flex h-11 w-full items-center justify-between rounded-xl border border-hairline bg-surface px-3.5 py-2 text-base text-ink placeholder:text-ink-secondary focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50 press-feedback ${
            error ? "border-danger focus:ring-danger" : ""
          }`}
          aria-expanded={open}
        >
          <span className={selectedOption ? "text-ink" : "text-ink-secondary"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[200px] overflow-hidden rounded-xl border border-hairline bg-surface-raised p-1 shadow-lg backdrop-blur-md animate-in fade-in-0 zoom-in-95"
          >
            <Command className="flex flex-col overflow-hidden">
              <Command.Input
                placeholder={searchPlaceholder}
                className="h-10 w-full border-b border-hairline bg-transparent px-3 text-sm text-ink placeholder:text-ink-secondary focus:outline-none"
              />
              <Command.List className="max-h-60 overflow-y-auto p-1 text-sm">
                <Command.Empty className="py-6 text-center text-sm text-ink-secondary">
                  {emptyText}
                </Command.Empty>
                <Command.Group>
                  {options.map((option) => (
                    <Command.Item
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        onValueChange?.(option.value);
                        setOpen(false);
                      }}
                      className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-ink hover:bg-surface-raised/80 aria-selected:bg-accent/10 aria-selected:text-accent outline-none select-none press-feedback"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        {option.description && (
                          <span className="text-xs text-ink-secondary">
                            {option.description}
                          </span>
                        )}
                      </div>
                      {value === option.value && (
                        <Check className="h-4 w-4 shrink-0 text-accent" />
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

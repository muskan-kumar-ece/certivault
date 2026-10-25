"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger,
  className = "",
}: DialogProps) {
  // If used as compound container
  if (open === undefined && onOpenChange === undefined && !trigger && !title) {
    return <RadixDialog.Root>{children}</RadixDialog.Root>;
  }

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in-0 duration-200" />
        <RadixDialog.Content
          className={`fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-card bg-surface p-6 shadow-xl border border-hairline duration-200 animate-in fade-in-0 zoom-in-95 outline-none ${className}`}
        >
          <div className="flex items-center justify-between pb-3">
            {title && (
              <RadixDialog.Title className="text-lg font-bold text-ink">
                {title}
              </RadixDialog.Title>
            )}
            <RadixDialog.Close className="rounded-control min-w-[44px] min-h-[44px] flex items-center justify-center text-ink-secondary hover:text-ink hover:bg-surface-raised transition-colors ml-auto cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <X className="w-4 h-4" />
              <span className="sr-only">Close</span>
            </RadixDialog.Close>
          </div>

          {description && (
            <RadixDialog.Description className="text-sm text-ink-secondary pb-4">
              {description}
            </RadixDialog.Description>
          )}

          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

export const DialogRoot = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogPortal = RadixDialog.Portal;
export const DialogClose = RadixDialog.Close;

export function DialogContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in-0 duration-200" />
      <RadixDialog.Content
        className={`fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-card bg-surface p-6 shadow-xl border border-hairline duration-200 animate-in fade-in-0 zoom-in-95 outline-none ${className}`}
      >
        {children}
        <RadixDialog.Close className="absolute right-3 top-3 rounded-control min-w-[44px] min-h-[44px] flex items-center justify-center text-ink-secondary hover:text-ink hover:bg-surface-raised transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <X className="w-4 h-4" />
          <span className="sr-only">Close</span>
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`space-y-1.5 pb-3 text-left ${className}`}>{children}</div>;
}

export function DialogTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RadixDialog.Title className={`text-lg font-bold text-ink ${className}`}>
      {children}
    </RadixDialog.Title>
  );
}

export function DialogDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RadixDialog.Description className={`text-sm text-ink-secondary ${className}`}>
      {children}
    </RadixDialog.Description>
  );
}

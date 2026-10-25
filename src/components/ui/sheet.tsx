"use client";

import * as React from "react";
import { Drawer } from "vaul";

export interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  trigger?: React.ReactNode;
}

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger,
}: SheetProps) {
  // If used as compound component with children only
  if (open === undefined && onOpenChange === undefined && !trigger && !title) {
    return <Drawer.Root>{children}</Drawer.Root>;
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" />
        <Drawer.Content className="bg-surface border-t border-hairline flex flex-col rounded-t-sheet fixed bottom-0 left-0 right-0 max-h-[92dvh] z-50 outline-none">
          <div className="p-4 bg-surface rounded-t-sheet flex-1 max-w-xl w-full mx-auto overflow-y-auto">
            {/* Grab Handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-hairline mb-4" />

            {(title || description) && (
              <div className="space-y-1 text-center mb-6">
                {title && (
                  <Drawer.Title className="text-lg font-bold text-ink">
                    {title}
                  </Drawer.Title>
                )}
                {description && (
                  <Drawer.Description className="text-sm text-ink-secondary">
                    {description}
                  </Drawer.Description>
                )}
              </div>
            )}

            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export const SheetRoot = Drawer.Root;
export const SheetTrigger = Drawer.Trigger;
export const SheetPortal = Drawer.Portal;
export const SheetClose = Drawer.Close;

export function SheetContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" />
      <Drawer.Content
        className={`bg-surface border-t border-hairline flex flex-col rounded-t-sheet fixed bottom-0 left-0 right-0 max-h-[92dvh] z-50 outline-none ${className}`}
      >
        <div className="p-4 bg-surface rounded-t-sheet flex-1 max-w-xl w-full mx-auto overflow-y-auto">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-hairline mb-4" />
          {children}
        </div>
      </Drawer.Content>
    </Drawer.Portal>
  );
}

export function SheetHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`space-y-1 text-center mb-6 ${className}`}>{children}</div>;
}

export function SheetTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Drawer.Title className={`text-lg font-bold text-ink ${className}`}>
      {children}
    </Drawer.Title>
  );
}

export function SheetDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Drawer.Description className={`text-sm text-ink-secondary ${className}`}>
      {children}
    </Drawer.Description>
  );
}

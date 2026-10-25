"use client";

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import {
  Search,
  FileCheck2,
  LayoutTemplate,
  Award,
  CreditCard,
  Users,
  Settings,
} from "lucide-react";

export interface CommandPaletteProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export function CommandPalette({
  open: controlledOpen,
  isOpen: legacyIsOpen,
  onOpenChange: setControlledOpen,
  onClose: legacyOnClose,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const router = useRouter();

  const isControlled = controlledOpen !== undefined || legacyIsOpen !== undefined;
  const currentOpen = controlledOpen ?? legacyIsOpen ?? internalOpen;

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        legacyOnClose?.();
      }
      setControlledOpen?.(nextOpen);
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
    },
    [legacyOnClose, setControlledOpen, isControlled]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleOpenChange(!currentOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [currentOpen, handleOpenChange]);

  const runCommand = (command: () => void) => {
    handleOpenChange(false);
    command();
  };

  if (!currentOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => handleOpenChange(false)}
      />

      {/* Command Palette Card */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-card bg-surface border border-hairline shadow-2xl animate-in fade-in-0 zoom-in-95 z-50">
        <Command label="Global Command Menu" className="w-full">
          <div className="flex items-center border-b border-hairline px-3.5">
            <Search className="w-4 h-4 text-ink-secondary mr-2 flex-shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search actions..."
              className="w-full bg-transparent py-3.5 text-sm text-ink placeholder:text-ink-secondary outline-none"
            />
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-ink-secondary">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-xs font-semibold uppercase text-ink-secondary px-2 py-1.5">
              <Command.Item
                onSelect={() => runCommand(() => router.push("/app"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-sm text-ink cursor-pointer hover:bg-surface-raised aria-selected:bg-surface-raised"
              >
                <Award className="w-4 h-4 text-accent" />
                <span>Dashboard Overview</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push("/app/issue"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-sm text-ink cursor-pointer hover:bg-surface-raised aria-selected:bg-surface-raised"
              >
                <FileCheck2 className="w-4 h-4 text-accent" />
                <span>Issue Certificates (Upload CSV)</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push("/app/templates"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-sm text-ink cursor-pointer hover:bg-surface-raised aria-selected:bg-surface-raised"
              >
                <LayoutTemplate className="w-4 h-4 text-accent" />
                <span>Certificate Templates</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Settings & Team" className="text-xs font-semibold uppercase text-ink-secondary px-2 py-1.5 mt-2">
              <Command.Item
                onSelect={() => runCommand(() => router.push("/app/team"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-sm text-ink cursor-pointer hover:bg-surface-raised aria-selected:bg-surface-raised"
              >
                <Users className="w-4 h-4 text-accent" />
                <span>Team Members & Roles</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push("/app/billing"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-sm text-ink cursor-pointer hover:bg-surface-raised aria-selected:bg-surface-raised"
              >
                <CreditCard className="w-4 h-4 text-accent" />
                <span>Credits & Billing</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push("/app/settings"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-control text-sm text-ink cursor-pointer hover:bg-surface-raised aria-selected:bg-surface-raised"
              >
                <Settings className="w-4 h-4 text-accent" />
                <span>Organization Settings</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

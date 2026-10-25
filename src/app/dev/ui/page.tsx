"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { FileDropZone } from "@/components/ui/file-drop-zone";
import { Stepper } from "@/components/ui/stepper";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ProgressRing, ProgressBar } from "@/components/ui/progress-ring";
import { ListRow } from "@/components/ui/list-row";
import { LargeTitleHeader } from "@/components/ui/large-title-header";
import { CommandPalette } from "@/components/ui/command-palette";
import {
  Sun,
  Moon,
  Plus,
  Trash2,
  Send,
  Award,
} from "lucide-react";

export default function DevUIShowcase() {
  return (
    <ToastProvider>
      <DevUIShowcaseContent />
    </ToastProvider>
  );
}

function DevUIShowcaseContent() {
  const { showToast } = useToast();
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [activeSegment, setActiveSegment] = React.useState("first");
  const [stepperStep, setStepperStep] = React.useState(1);
  const [comboboxValue, setComboboxValue] = React.useState("classic");
  const [selectValue, setSelectValue] = React.useState("a4_landscape");
  const [progress, setProgress] = React.useState(68);
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);

  // Toggle dark mode by manipulating html class
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <main className="min-h-screen bg-canvas text-ink transition-colors duration-200">
      <div className="mx-auto max-w-4xl px-4 py-8 pb-32 sm:px-6">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-hairline">
          <div>
            <span className="text-xs font-semibold tracking-wider text-accent uppercase">
              Design System Showcase
            </span>
            <LargeTitleHeader
              title="CertiVault UI"
              subtitle="Apple-style native components and design tokens"
            />
          </div>
          <div className="flex items-center gap-3">
            <IconButton
              icon={theme === "light" ? Moon : Sun}
              ariaLabel="Toggle theme"
              onClick={toggleTheme}
              variant="tinted"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCommandOpen(true)}
            >
              ⌘K Search
            </Button>
          </div>
        </div>

        <CommandPalette
          isOpen={isCommandOpen}
          onClose={() => setIsCommandOpen(false)}
        />

        <div className="mt-8 space-y-12">
          {/* 1. BUTTONS */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">1. Buttons & Icons</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="tinted">Tinted Action</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="primary" loading>
                Loading
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button size="sm">Small (36px)</Button>
              <Button size="md">Medium (44px)</Button>
              <Button size="lg">Large (48px)</Button>
              <IconButton icon={Plus} ariaLabel="Add certificate" variant="primary" />
              <IconButton icon={Trash2} ariaLabel="Delete item" variant="destructive" />
              <IconButton icon={Send} ariaLabel="Send email" variant="tinted" />
            </div>
          </section>

          {/* 2. BADGES & CHIPS */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">2. Status Badges & Chips</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="verified">CV-26-X89K2P Verified</Badge>
              <Badge variant="warning">Low Credits (10%)</Badge>
              <Badge variant="danger">Revoked</Badge>
              <Badge variant="neutral">Draft (412 rows)</Badge>
              <Badge variant="accent">Pro Annual</Badge>
            </div>
          </section>

          {/* 3. SEGMENTED CONTROL */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">3. Segmented Control</h2>
            <div className="max-w-md">
              <SegmentedControl
                options={[
                  { value: "first", label: "Batches" },
                  { value: "second", label: "All Certificates" },
                  { value: "third", label: "Revoked" },
                ]}
                value={activeSegment}
                onChange={setActiveSegment}
              />
            </div>
          </section>

          {/* 4. FORM FIELDS, SELECT, COMBOBOX */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">4. Form Inputs</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Organization Name"
                placeholder="e.g. IEEE Student Branch"
                helperText="Appears as issuer on generated certificates."
              />
              <Field
                label="Recipient Email"
                placeholder="student@college.edu"
                error="Invalid email format"
              />
              <Select
                label="Certificate Orientation"
                options={[
                  { value: "a4_landscape", label: "A4 Landscape (297 × 210 mm)" },
                  { value: "a4_portrait", label: "A4 Portrait (210 × 297 mm)" },
                ]}
                value={selectValue}
                onValueChange={setSelectValue}
              />
              <Combobox
                label="Select Preset Template"
                options={[
                  { value: "classic", label: "Classic Serif Border", description: "Formal academic honours" },
                  { value: "modern", label: "Modern Minimalist", description: "Clean sans-serif design" },
                  { value: "hackathon", label: "Bold Hackathon", description: "High contrast tech fest" },
                  { value: "corporate", label: "Corporate Training", description: "Enterprise accreditation" },
                ]}
                value={comboboxValue}
                onValueChange={setComboboxValue}
              />
            </div>
          </section>

          {/* 5. FILE DROP ZONE */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">5. File Drop Zone</h2>
            <FileDropZone
              accept=".csv,.xlsx"
              maxSizeBytes={5 * 1024 * 1024}
              onFileSelect={(file) => {
                showToast({
                  title: `Selected ${file.name}`,
                  description: `${(file.size / 1024).toFixed(1)} KB`,
                  variant: "success",
                });
              }}
            />
          </section>

          {/* 6. STEPPER */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">6. Multi-Step Flow Indicator</h2>
            <Stepper
              currentStep={stepperStep}
              steps={[
                { label: "Upload CSV" },
                { label: "Match Headers" },
                { label: "Preview & Review" },
                { label: "Issue" },
              ]}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={stepperStep <= 0}
                onClick={() => setStepperStep((s) => s - 1)}
              >
                Previous Step
              </Button>
              <Button
                size="sm"
                variant="tinted"
                disabled={stepperStep >= 3}
                onClick={() => setStepperStep((s) => s + 1)}
              >
                Next Step
              </Button>
            </div>
          </section>

          {/* 7. PROGRESS & METRICS */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">7. Progress Ring & Bar</h2>
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-4">
                <ProgressRing progress={progress} size={72} strokeWidth={6} />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{progress}% complete</span>
                  <span className="text-xs text-ink-secondary">340 of 500 issued</span>
                </div>
              </div>
              <div className="w-full max-w-xs space-y-2">
                <ProgressBar progress={progress} />
                <div className="flex justify-between text-xs text-ink-secondary">
                  <span>Batch Generation</span>
                  <span>{progress}%</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setProgress((p) => Math.max(0, p - 10))}
              >
                -10%
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setProgress((p) => Math.min(100, p + 10))}
              >
                +10%
              </Button>
            </div>
          </section>

          {/* 8. LIST ROW WITH ACTIONS */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">8. List Rows</h2>
            <div className="overflow-hidden rounded-2xl border border-hairline bg-surface">
              <ListRow
                title="Aarav Sharma"
                subtitle="aarav@ieee.org · CV-26-87HKL2P9"
                trailing={<Badge variant="verified">Verified</Badge>}
                actions={
                  <div className="flex gap-2">
                    <Button size="sm" variant="tinted">
                      Resend
                    </Button>
                    <Button size="sm" variant="destructive">
                      Revoke
                    </Button>
                  </div>
                }
              />
              <ListRow
                title="Priya Patel"
                subtitle="priya@collegemail.edu · CV-26-991KA4LM"
                trailing={<Badge variant="neutral">Pending</Badge>}
                actions={
                  <Button size="sm" variant="tinted">
                    Cancel
                  </Button>
                }
              />
            </div>
          </section>

          {/* 9. SHEETS, DIALOGS, TOASTS */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">9. Modals, Drawers & Toasts</h2>
            <div className="flex flex-wrap items-center gap-3">
              {/* Sheet Trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="secondary">Open Vaul Sheet (Mobile-First)</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Revoke Certificate</SheetTitle>
                    <SheetDescription>
                      Revoking marks this certificate as permanently invalid on the public verification page.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4 space-y-4">
                    <Field label="Revocation Reason" placeholder="e.g. Disqualified / Administrative error" />
                    <Button variant="destructive" className="w-full">
                      Confirm Revocation
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Dialog Trigger */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">Open Desktop Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Issue 412 Certificates</DialogTitle>
                    <DialogDescription>
                      This action will deduct 412 credits from your balance and queue background generation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="secondary">Cancel</Button>
                    <Button variant="primary">Confirm Issue</Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Toast Buttons */}
              <Button
                variant="tinted"
                onClick={() =>
                  showToast({
                    title: "Certificate Issued",
                    description: "Batch 104 queued for rendering.",
                    variant: "success",
                  })
                }
              >
                Trigger Success Toast
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  showToast({
                    title: "Insufficient Credits",
                    description: "Please top up your balance.",
                    variant: "error",
                  })
                }
              >
                Trigger Error Toast
              </Button>
            </div>
          </section>

          {/* 10. SKELETON & EMPTY STATE */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">10. Skeletons & Empty States</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-hairline bg-surface p-4 space-y-3">
                <span className="text-xs font-semibold text-ink-secondary">Skeleton Loader</span>
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 w-24 rounded-xl" />
                  <Skeleton className="h-9 w-24 rounded-xl" />
                </div>
              </div>

              <EmptyState
                icon={Award}
                title="No batches yet"
                description="Upload a CSV or spreadsheet to issue your first verifiable certificates."
                action={
                  <Button variant="primary" size="sm">
                    Issue Certificates
                  </Button>
                }
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

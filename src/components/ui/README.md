# CertiVault Reusable UI Primitives (`src/components/ui`)

Apple-style native components built with strict semantic design tokens, WCAG AA compliance, spring animations, and touch-first ergonomics.

## Components & Props Index

### 1. `Button` (`src/components/ui/button.tsx`)
- **Props:**
  - `variant`: `'primary' | 'secondary' | 'tinted' | 'destructive'` (default: `'primary'`)
  - `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
  - `loading`: `boolean` (displays spinner and disables interaction)
  - `disabled`: `boolean`
  - Standard HTML button attributes (`onClick`, `type`, etc.)

### 2. `IconButton` (`src/components/ui/icon-button.tsx`)
- **Props:**
  - `icon`: `LucideIcon`
  - `ariaLabel`: `string` (required for screen reader accessibility)
  - `variant`: `'primary' | 'secondary' | 'tinted' | 'destructive'`
  - `size`: `'sm' | 'md' | 'lg'` (enforces 44×44px minimum touch targets)

### 3. `SegmentedControl` (`src/components/ui/segmented-control.tsx`)
- **Props:**
  - `options`: `{ value: string; label: string }[]`
  - `value`: `string`
  - `onChange`: `(value: string) => void`
  - Animated Framer Motion layout pill with spring physics

### 4. `Field` (`src/components/ui/field.tsx`)
- **Props:**
  - `label`: `string`
  - `error`: `string`
  - `helperText`: `string`
  - Standard HTML input attributes with >=16px text size to prevent iOS Safari auto-zoom

### 5. `Select` (`src/components/ui/select.tsx`)
- Radix UI accessible select primitive.
- **Props:**
  - `options`: `{ value: string; label: string; disabled?: boolean }[]`
  - `value`: `string`
  - `onValueChange`: `(value: string) => void`
  - `placeholder`: `string`
  - `label`: `string`
  - `error`: `string`

### 6. `Combobox` (`src/components/ui/combobox.tsx`)
- Popover + Command search filter for large collections.
- **Props:**
  - `options`: `{ value: string; label: string; description?: string }[]`
  - `value`: `string`
  - `onValueChange`: `(value: string) => void`
  - `placeholder`: `string`
  - `searchPlaceholder`: `string`

### 7. `FileDropZone` (`src/components/ui/file-drop-zone.tsx`)
- Drag and drop zone with client-side file size and MIME validation.
- **Props:**
  - `onFileSelect`: `(file: File) => void`
  - `accept`: `string` (e.g. `.csv,.xlsx`)
  - `maxSizeBytes`: `number` (default: 5MB)
  - `error`: `string`

### 8. `Stepper` (`src/components/ui/stepper.tsx`)
- Step flow indicator with numeric circles and completion checks.
- **Props:**
  - `steps`: `{ label: string; description?: string }[]`
  - `currentStep`: `number` (0-indexed)

### 9. `Sheet` (`src/components/ui/sheet.tsx`)
- Vaul bottom drawer with grab handle, velocity dismiss, and background dimming.
- Primitives: `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`.

### 10. `Dialog` (`src/components/ui/dialog.tsx`)
- Radix UI modal dialog for desktop workflows.
- Primitives: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`.

### 11. `Toast` (`src/components/ui/toast.tsx`)
- Floating minimalist notification pill with auto-dismiss and spring enter/exit.
- Hooks / Providers: `ToastProvider`, `useToast()`.
- Variants: `default`, `success` (seal), `warning`, `error` (danger).

### 12. `Skeleton` (`src/components/ui/skeleton.tsx`)
- Shimmer pulse loading skeleton for lists, text, and cards.

### 13. `EmptyState` (`src/components/ui/empty-state.tsx`)
- Actionable zero-data empty state card.
- **Props:**
  - `icon`: `LucideIcon`
  - `title`: `string`
  - `description`: `string`
  - `action`: `React.ReactNode`

### 14. `Badge` (`src/components/ui/badge.tsx`)
- Status chips and pills.
- **Variants:** `'verified' | 'warning' | 'danger' | 'neutral' | 'accent'`.

### 15. `ProgressRing` & `ProgressBar` (`src/components/ui/progress-ring.tsx`)
- Smooth circular SVG progress ring and linear progress bar with spring width animation.

### 16. `ListRow` (`src/components/ui/list-row.tsx`)
- Interactive list row with press feedback and action buttons.

### 17. `LargeTitleHeader` (`src/components/ui/large-title-header.tsx`)
- iOS-style collapsible / prominent large page title.

### 18. `TabBar` (`src/components/ui/tab-bar.tsx`)
- Mobile bottom floating navigation bar with 72% opacity backdrop blur, safe-area padding, and active spring pill.

### 19. `Sidebar` (`src/components/ui/sidebar.tsx`)
- Desktop sidebar with Org switcher, command palette trigger, navigation sections, and credit balance indicator.

### 20. `CommandPalette` (`src/components/ui/command-palette.tsx`)
- Quick action ⌘K modal (cmdk) with keyboard navigation and search filter.

### 21. `AppShell` (`src/components/ui/app-shell.tsx`)
- Responsive shell combining `Sidebar` (desktop) and `TabBar` (mobile) with `PageTransition`, `ToastProvider`, and global `⌘K` listener.

### 22. `PageTransition` (`src/components/ui/page-transition.tsx`)
- Smooth page entry/exit animation respecting `prefers-reduced-motion`.

# src/components/ui

## Purpose
Design system primitives and shared UI components (Apple-grade feel).

## Rules
- Components live ONLY here.
- Components must NEVER import from `src/features`, `src/server`, or `src/app`.
- Only import from React, Lucide icons, Radix primitives, Framer Motion, and `src/lib/tokens`.
- No raw hex colors, hardcoded radii, or arbitrary spacing: use design tokens only.
- Support light and dark mode, prefers-reduced-motion, and 44x44px touch targets.

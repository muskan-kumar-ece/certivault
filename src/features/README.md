# src/features

## Purpose
Feature-specific business logic, forms, components, and hooks.
- `templates`: template gallery, pdfme designer embed, presets
- `issue`: 5-step issuance wizard, CSV/XLSX parser, column auto-matcher
- `certificates`: registry, batch detail, certificate detail, revocation sheet
- `billing`: plan cards, credit packs, Razorpay checkout, invoices
- `team`: team members list, role management, invitation dialog
- `org`: organization settings, logo upload, signatories management

## Rules
- Feature modules may import from `src/components/ui` and `src/lib`.
- Feature modules must NOT directly import private modules from other peer features unless exposed via shared interfaces.
- Client feature components must NOT import from `src/server`.

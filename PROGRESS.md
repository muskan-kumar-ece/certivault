# Progress Log: CertiVault

## Current: Work 4 — Design system and app shell (Apple-style feel) (COMPLETED)
Status: done
Branch: work-4/design-system
Tag: work-4-done

---

### Product & Scope Summary (10-Line Proof of Understanding)
1. **Product Core:** CertiVault is a multi-tenant web application for bulk verifiable certificate issuance, delivery, tracking, and instant public verification.
2. **Primary Persona 1 (Entry):** Student club leads (e.g. Aarav) running hackathons and college fests on mobile devices, needing fast, low-cost certificate generation.
3. **Primary Persona 2 (Buyer):** College exam cell and training & placement officers (e.g. Dr. Lakshmi) requiring institutional branding, fraud deterrence, and GST compliance.
4. **Recipient & Verifier:** Recipients receive clean link-first emails and mobile-responsive views; verifiers (recruiters/public) verify in <5s via QR or unguessable public ID (`CV-YY-XXXXXXXX`).
5. **Tech Architecture:** Modular Next.js App Router monolith hosted on Vercel (Mumbai) backed by Supabase Postgres, Auth, Storage, and Realtime (Mumbai).
6. **Background Pipeline:** Time-boxed worker endpoint (`/api/worker`) claiming jobs (`generate_chunk`, `send_email_chunk`, `export`, `invoice`) via Postgres `SKIP LOCKED` queue.
7. **Security & Financial Integrity:** Strict RLS on every table, service-role isolation, and atomic ledger accounting via `apply_credit_delta` with negative-balance DB check constraints.
8. **Design Philosophy:** Native-feeling Apple-grade UI using custom Radix/Tailwind components, spring physics, touch manipulation, 4-pt grid, and strict design tokens.
9. **Monetization:** Prepaid credit packs (Event, Club, Bulk) and annual Campus plans billed in INR via Razorpay with automated 18% GST invoice generation.
10. **v1.0 Boundaries:** Zero LLMs in the issuance hot path, client-side spreadsheet parsing, link-first email delivery (no attachments by default), and presets + quick-edit on mobile.

---

### Done in Work 4
- [x] Implemented complete reusable UI component suite in `src/components/ui/` with zero hex colors (strict CSS variables & `src/lib/tokens.ts`):
  - `button.tsx`: 5 variants, 3 sizes, loading state, touch target expansion, 44px minimum target
  - `icon-button.tsx`: accessible `aria-label` enforcement, 44x44px target
  - `segmented-control.tsx`: iOS-style sliding pill with Framer Motion spring physics, scoped `layoutId`
  - `field.tsx`: input with linked `aria-invalid` / `aria-describedby` error associations, >=16px text
  - `select.tsx`: accessible Radix UI select primitive supporting both `onChange` and `onValueChange`
  - `combobox.tsx`: cmdk + Radix Popover searchable select
  - `file-drop-zone.tsx`: drag & drop zone with client-side 5MB validation and full keyboard accessibility (`tabIndex={0}`, Enter/Space)
  - `stepper.tsx`: responsive step flow indicator with 44px touch targets
  - `sheet.tsx`: Vaul bottom drawer with grab handle, velocity dismiss, and background scale
  - `dialog.tsx`: desktop Radix modal with 44x44px close button and accessible titles
  - `toast.tsx`: floating Apple-style notification pill with auto-dismiss and spring enter/exit
  - `skeleton.tsx`: shimmer pulse loading placeholder
  - `empty-state.tsx`: zero-data state card with icon, message, and CTA
  - `badge.tsx`: status chips (verified, warning, danger, neutral, accent)
  - `progress-ring.tsx`: circular SVG progress ring & progress bar with full `role="progressbar"` ARIA attributes
  - `list-row.tsx`: interactive list rows with press feedback and keyboard activation
  - `large-title-header.tsx`: iOS-style 34px/41px bold header with optional back navigation
  - `tab-bar.tsx`: mobile bottom translucent floating bar (`backdrop-blur-xl`, `h-[calc(4rem+env(safe-area-inset-bottom))]`, `aria-current="page"`)
  - `sidebar.tsx`: desktop sticky navigation (`100dvh`, Org switcher, ⌘K trigger, credit balance widget)
  - `command-palette.tsx`: cmdk ⌘K modal with global shortcut and navigation actions
  - `app-shell.tsx`: responsive layout coordinator switching between `TabBar` (mobile) and `Sidebar` (desktop)
  - `page-transition.tsx`: shared-axis page transition respecting `prefers-reduced-motion`
  - `motion.ts`: shared spring constants and `usePressMotion()` helper
- [x] Built dev showcase page at `/dev/ui` with interactive component demonstrations and light/dark theme toggle.
- [x] Integrated design system into app shell (`src/app/(app)/app/layout.tsx`), sign-in (`/login`), and onboarding (`/onboarding`).
- [x] Documented all 22 components and their prop APIs in `src/components/ui/README.md`.
- [x] Audited via `ui-reviewer` subagent: resolved all touch targets (<44px), keyboard navigation, ARIA attributes, and reduced motion fallbacks.
- [x] Verification suite passing:
  - `npm run guard`: 4/4 checks passed (secrets isolation, RLS, tokens only, allowlist)
  - `npm run lint`: 0 errors
  - `npm run typecheck`: 0 errors
  - `npm test`: 14/14 tests passed
  - `npm run build`: Production build succeeded; all 11 routes prerendered cleanly.

---

### Exit gate — Work 4
- [x] All UI primitives created in `src/components/ui` matching `PRD.md` §11 and `implementation.md` §2
- [x] `usePressMotion` helper and spring constants implemented and respecting `prefers-reduced-motion`
- [x] Touch targets ≥ 44×44px across all controls
- [x] Responsive app shell (TabBar on mobile, Sidebar on desktop, safe areas respected)
- [x] `/dev/ui` showcase page created with light/dark theme switcher
- [x] `ui-reviewer` subagent audit completed and remediations verified
- [x] `npm run guard && npm run lint && npm run typecheck && npm test && npm run build` green
- [x] Tag created: `work-4-done`

---

### Next
- Next step is **WORK 5: Organization, team, and settings**:
  - Organization settings screen (`name`, `logo`, `color`, `sender_name`, `reply_to`, `retention_setting`)
  - Signatories CRUD (name, title, signature image upload with validation)
  - Team screen: list, invite by email (hashed token, expires), accept flow, role changes, remove (with last-owner demotion protection)
  - Storage bucket `branding` + RLS policies and upload helper with image re-encode
  - Audit log writes for role changes, invites, and settings modifications.

# Progress Log: CertiVault

## Current: Work 1 — Repository, folder structure, and rules (COMPLETED)
Status: done
Branch: work-1/repo-skeleton
Tag: work-1-done

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

### Done in Work 1
- [x] Initialized Git repository on branch `work-1/repo-skeleton`.
- [x] Installed allowlist dependencies matching `AGENT_PLAN.md` §5 (Next.js 15, React 19, Supabase SSR & JS, Tailwind CSS, Radix UI, Zod, Vitest).
- [x] Created strict folder layout per `architecture.md` §6 with boundary `README.md` files:
  - `src/app/` (`(marketing)`, `(auth)`, `(app)/app`, `c/[publicId]`, `verify`, `api`)
  - `src/components/ui/` (primitives; no imports from features/server)
  - `src/features/` (`templates`, `issue`, `certificates`, `billing`, `team`, `org`)
  - `src/server/` (`pdf`, `jobs`, `email`, `payments`, `export`, `auth`, `admin`)
  - `src/lib/` (`supabase`, `schemas`, `tokens`, `utils`)
  - `supabase/` (`migrations`, `tests`, `seed.sql`)
  - `scripts/` & `public/fonts/`
- [x] Enforced ESLint boundary restrictions (`no-restricted-imports` blocking UI/lib from accessing features/server).
- [x] Verified intentional bad import failure (deliberate UI → server import failed build with exit code 1, then removed).
- [x] Created `.env.example` with full TRD §17 spec and `.env.local` template for live Supabase credentials (gitignored).
- [x] Implemented Supabase client factories:
  - `src/lib/supabase/browser.ts` (browser client, public anon key)
  - `src/lib/supabase/server.ts` (cookie-based SSR client)
  - `src/server/admin.ts` (restricted service-role client with `import 'server-only'`)
- [x] Verified clean builds across all standing commands:
  - `npm run typecheck`: PASS (0 errors)
  - `npm test`: PASS (1 file, 3 tests)
  - `npm run lint`: PASS (0 errors, 0 warnings)
  - `npm run build`: PASS (all 8 routes compiled statically / dynamically; shared JS 103 kB)
- [x] Created commit `977a810` and git tag `work-1-done`.

---

### Decisions
- 2026-10-25: Adopted strict Feature-Driven Modular Monolith per `architecture.md` ADR 1 and Work 1 specifications.
- 2026-10-25: Enforced `server-only` import barriers preventing accidental client bundle leaks of the service-role key.

---

### Conflicts / Blockers
1. **Live Supabase Credentials**:
   - Ready for user to fill in `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

---

### Exit gate — Work 1
- [x] `npm run lint && npm run typecheck && npm test && npm run build` — all pass cleanly
- [x] Deliberate bad import (ui → server) fails lint (verified and reverted)
- [x] Tag created: `work-1-done`

---

### Next
- Next step is **Work 2: Foundation (database, auth, organizations, app shell)**:
  - Add initial Supabase migrations for `orgs`, `org_members`, `invitations`, `signatories`, `platform_admins`, `audit_logs`.
  - Implement RLS helper functions (`is_member`, `has_role`) and policies.
  - Setup authentication flows (Email OTP + Google).
  - Build basic `(app)` shell and org onboarding.

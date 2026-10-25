# Progress Log: CertiVault

## Current: Work 5 — Organization, team, and settings (COMPLETED)
Status: done
Branch: work-5/org-and-team
Tag: work-5-done

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

### Done in Work 5
- [x] Database & Storage Migration `supabase/migrations/20261025000002_branding_storage.sql`:
  - Created private `branding` storage bucket (5MB limit, PNG/JPG/WebP/SVG allowlist).
  - Configured tenant-isolated storage RLS policies for `select`, `insert`, `update`, and `delete`.
  - Audited by `db-security-reviewer` subagent: implemented safe `org_id::text = (storage.foldername(name))[1]` avoiding uncaught SQL exceptions (22P02) on malformed paths, added explicit `WITH CHECK` on update, and idempotent `DROP POLICY IF EXISTS`.
- [x] Storage upload & URL helpers in `src/server/branding.ts` (`uploadBrandingAsset`, `getBrandingAssetUrl`).
- [x] Zod validation schemas:
  - `src/lib/schemas/settings.ts` (`updateOrgSettingsSchema`)
  - `src/lib/schemas/signatory.ts` (`createSignatorySchema`, `updateSignatorySchema`)
  - `src/lib/schemas/team.ts` (`inviteMemberSchema`, `updateMemberRoleSchema`, `removeMemberSchema`)
- [x] Server Actions:
  - `src/features/settings/actions.ts`: `updateOrgSettingsAction`, `getOrgSettingsAction`
  - `src/features/signatories/actions.ts`: `listSignatoriesAction`, `createSignatoryAction`, `updateSignatoryAction`, `deleteSignatoryAction`
  - `src/features/team/actions.ts`: `listTeamMembersAction`, `inviteMemberAction` (crypto sha256 tokens, 7-day expiry, `sendEmail` stub call), `acceptInvitationAction`, `updateMemberRoleAction`, `removeMemberAction`
  - Enforced server authority (`requireRole`), full audit logging (`audit`), and sole-owner protection (cannot demote or remove the last owner).
- [x] UI Pages & Client Views:
  - `/app/settings`: Organization profile, brand accent color picker, email sender name, reply-to, DPDP-aligned retention settings, and full Signatories CRUD with dialog.
  - `/app/team`: Active member list with role dropdowns, pending invitations, and teammate invite modal.
  - `/invite/[token]`: Public invitation acceptance page with session detection and automated redirect.
- [x] Automated Unit & Integration Tests in `src/test/team-and-settings.test.ts` (10 tests; total test suite 24/24 passing).
- [x] Verification Suite Passing:
  - `npm run guard`: 4/4 checks passed (secrets isolation, RLS, tokens only, allowlist)
  - `npm run lint`: 0 errors
  - `npm run typecheck`: 0 errors
  - `npm test`: 24/24 tests passed
  - `npm run build`: Production build succeeded; all 13 routes prerendered cleanly.

---

### Exit gate — Work 5
- [x] Organization settings screen live at `/app/settings`
- [x] Signatories CRUD operational with audit logs
- [x] Team screen live at `/app/team` with email invitations and role switching
- [x] Sole-owner protection enforced in server actions and verified by tests
- [x] Private `branding` storage bucket and RLS policies audited and applied
- [x] All 24 unit/integration tests green
- [x] Production build passes cleanly with 0 errors
- [x] Tag created: `work-5-done`

---

### Work 6: Templates and the PDF engine (Completed 2026-10-25)
- [x] Branch: `work-6/templates-and-pdf`
- [x] Migration `supabase/migrations/20261025000003_templates.sql`:
  - `templates` table with multi-tenant isolation, preset support (`org_id IS NULL`), page size check, and audit triggers.
  - Private `templates` storage bucket with path-scoped RLS policies.
  - Audited and approved by `db-security-reviewer` subagent.
- [x] Migration `supabase/migrations/20261025000004_seed_templates.sql`:
  - Seeded 8 platform presets: Classic Academic, Modern Minimal, Tech Certificate, Workshop / Boot Camp, Executive Certificate, Elegant Gold, Corporate Excellence, and Vibrant Achievement.
- [x] Bundled Open-Source Fonts in `public/fonts/`:
  - Inter (Latin), Playfair Display (Serif), Noto Sans Devanagari (Hindi), Noto Sans Telugu (Telugu).
  - Pre-cached in-memory for microsecond lookup during batch generation.
- [x] High-Performance PDF Engine in `src/server/pdf.ts`:
  - `renderCertificate()` using `@pdfme/generator` with vector QR and typography support.
  - Crockford Base32 `newPublicId()` generating `CV-YY-XXXXXXXX` format (40 bits of cryptographic entropy, zero ambiguous characters).
- [x] Template Library & Editor:
  - `/app/templates`: Grid layout, preset filter, custom template actions (duplicate, archive, preview).
  - `/app/templates/[id]`: Interactive designer, dynamic field palette, real-time preview, live coordinate inspector, and autosave.
- [x] Benchmark Script & Metrics (`scripts/benchmark-pdf.mjs`):
  - 500 certificates rendered:
    - Average latency: **40.2 ms / cert** (Target: ≤ 500 ms; 12x faster than exit-gate threshold)
    - Median (p50): **38.7 ms**, p95: **51.3 ms**, p99: **67.4 ms**
    - Throughput: **24.9 certs/sec**
    - PDF File Size: **9.3 KB** (Target: ≤ 150 KB; 16x smaller than threshold)
- [x] Automated Unit & Integration Tests in `src/test/templates-and-pdf.test.ts` (8 tests; total suite 32/32 passing):
  - 100,000 public ID collision test passed with 0 collisions.
  - Template usability validation enforcing QR and ID fields.
  - Multi-language rendering verification (English, Hindi, Telugu).
- [x] Verification Suite Passing:
  - `npm run guard`: 4/4 checks passed.
  - `npm run lint`: 0 errors.
  - `npm run typecheck`: 0 errors.
  - `npm test`: 32/32 tests passed.
  - `npm run build`: Production build succeeded; all 14 routes prerendered cleanly.

---

### Exit gate — Work 6
- [x] `templates` table migration with RLS + tests (presets with `org_id is null`)
- [x] Buckets `templates` for backgrounds (PNG/JPG/PDF first page ≤ 5 MB)
- [x] Bundle fonts in `public/fonts` (Inter, Playfair Display, Noto Sans Devanagari, Noto Sans Telugu)
- [x] Server `renderCertificate()` implemented and benchmarked (40.2 ms/cert, 9.3 KB)
- [x] Crockford Base32 `newPublicId()` tested with 100k collision check (0 collisions)
- [x] 8 preset templates seeded
- [x] Template library screen live at `/app/templates`
- [x] Template editor live at `/app/templates/[id]`
- [x] All 32 unit/integration tests green
- [x] Production build passes cleanly with 0 errors
- [x] Tag created: `work-6-done`

---

### Work 7: Import, issue wizard, credits, and worker (Completed 2026-10-25)
- [x] Branch: `work-7/import-wizard-credits-worker`
- [x] Migration `supabase/migrations/20261025000005_batches_certificates_jobs_ledger.sql`:
  - `batches`, `certificates`, `jobs`, `credit_ledger` tables with strict multi-tenant RLS.
  - `cert_update` restricted to `{owner,admin}` per TRD.md §4.
  - GIN trigram index `certificates_name_trgm` on `certificates.recipient_name` for fast fuzzy searching.
  - Atomic security-definer function `apply_credit_delta` with DB `CHECK (credit_balance >= 0)` constraint guaranteeing negative balance prevention.
  - Security-definer queue function `claim_jobs` with `FOR UPDATE SKIP LOCKED` and poison job termination guard (`attempts >= max_attempts`).
  - Private `certificates` storage bucket with path-scoped RLS policies.
  - Audited and APPROVED by `db-security-reviewer` subagent.
- [x] Server Module Implementations:
  - `src/server/jobs.ts`: `enqueueJob`, `claimJobs`, `markJobDone`, `markJobFailed`.
  - `src/server/payments.ts`: `applyCreditDelta` calling database function with rollback on overdraft.
  - `src/server/storage.ts`: `storageUpload`, `getSignedUrl` for private certificate storage.
- [x] Client-Side File Parsing & Column Alignment (`src/features/issue/parser.ts`):
  - PapaParse (CSV) and SheetJS (XLSX/XLS) with greedy empty line skipping.
  - 5,000-row safety cap.
  - Fuse.js fuzzy column matcher with common alias dictionary.
  - Sanitization, short-name rejection, email format checks, and duplicate detection.
- [x] 5-Step Issuance Wizard (`/app/issue`):
  - Step 1: Template selection grid with page size and field badges.
  - Step 2: Recipient file drop zone & manual paste with instant row counter.
  - Step 3: Column matching interface with auto-matched suggestions and field preview.
  - Step 4: Audit & Review: valid row verification, cost summary card, credit balance check, and "Send me a test certificate".
  - Step 5: Delivery configuration (email vs generate only) and confirmation dialog.
  - Live generation progress ring with polling fallback.
- [x] Queue Worker (`src/app/api/worker/route.ts`):
  - Bearer `WORKER_SECRET` authentication.
  - 45-second execution timebox with self-retriggering capability.
  - `generate_chunk` execution: rendering PDF, SHA-256 fingerprinting, private storage upload, batch progress updating, and automatic credit refund on failed rows.
- [x] Automated Unit & Integration Tests in `src/test/issue-and-worker.test.ts` (9 tests; total suite 41/41 passing).
- [x] Verification Suite Passing:
  - `npm run guard`: 4/4 checks passed.
  - `npm run lint`: 0 errors.
  - `npm run typecheck`: 0 errors.
  - `npm test`: 41/41 tests passed.
  - `npm run build`: Production build succeeded; all 16 routes compiled cleanly.

---

### Exit gate — Work 7
- [x] `batches`, `certificates`, `jobs`, `credit_ledger` tables migration with RLS + pgTAP tests
- [x] Atomic `apply_credit_delta` SQL function with balance checks verified
- [x] `claim_jobs` with `FOR UPDATE SKIP LOCKED` and poison job recovery verified
- [x] Client-side CSV/XLSX parser with fuzzy column matching (Fuse.js)
- [x] 5-step issuance wizard live at `/app/issue` (Template, Recipients, Match, Review, Issue)
- [x] Background worker queue processor live at `/api/worker`
- [x] Credit consumption and ledger reconciliation tests green
- [x] All 41 unit/integration tests green
- [x] Production build passes cleanly with 0 errors
- [x] Tag created: `work-7-done`

---

### Next
- Next step is **WORK 8: Email delivery and public verification**:
  - Email provider interface with Resend implementation and dev console transport
  - React Email templates: certificate delivery, batch complete, sign-in/invite
  - `send_email_chunk` job; suppression list table + checks; throttling
  - Email webhooks (delivered, bounced, complained) → `email_status`
  - Migration: `get_public_certificate` RPC, `verification_events`, `abuse_reports`
  - Rate limiting on verify, auth, uploads, test sends
  - `/c/[publicId]` public verification page (valid, revoked, not-found states; verified seal; download via signed URL)
  - `/verify` QR camera scanner and ID entry screen

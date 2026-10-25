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

### Work 8: Email delivery and public verification (Completed 2026-10-25)
- [x] Branch: `work-8/delivery-and-verification`
- [x] Migration `supabase/migrations/20261025000006_verification_and_email.sql`:
  - `verification_events` with non-blocking async recording via `after()`.
  - `abuse_reports` table with hardened RLS policy enforcing `status = 'pending'` and certificate existence check.
  - `email_suppressions` table with case-insensitive lower check constraint and unique index on `lower(email)`. Service-role only RLS.
  - Foreign key cascade performance indexes on `verification_events(certificate_id)` and `abuse_reports(certificate_id)`.
  - Public verification narrow RPC `get_public_certificate`: strict privacy isolation (zero PII, no recipient emails, no internal UUIDs, conditional revocation reason display).
  - Helper function `increment_certificate_download`: strictly restricted to `service_role` (gating downloads through the rate-limited route handler).
  - Audited and APPROVED by `db-security-reviewer`.
- [x] Companion pgTAP test suite: `supabase/tests/20261025000006_verification_and_email_test.sql`.
- [x] Email Delivery Engine in `src/server/email.ts`:
  - Provider interface with Resend implementation and local console dev fallback transport.
  - Suppression list checks preventing delivery to bounced/complained/unsubscribed addresses.
  - Production-ready HTML/text templates for certificate delivery, batch completion, and team invitations (`src/features/email/templates.ts`).
  - DNS deliverability documentation in `docs/email-setup.md` (SPF, DKIM, DMARC, MX).
- [x] Public Verification Page at `/c/[publicId]`:
  - Valid, revoked, not-found, and error states.
  - Green animated verified seal with verification badge and document SHA-256 fingerprint display.
  - Direct PDF download with rate-limited 60-second signed URL redirect via `/api/download?id=CV-YY-XXXXXXXX`.
  - Abuse reporting modal submitting directly to `abuse_reports` with validation.
  - Zero PII exposure verified by automated tests.
- [x] QR Camera Scanner & ID Lookup at `/verify`:
  - Tabbed interface (Enter ID / Scan QR Code) with `BarcodeDetector` API and fallback.
  - Instant redirect to `/c/[publicId]` upon QR detection.
- [x] Automated Unit & Integration Tests in `src/test/verification-and-email.test.ts` (7 tests; total suite 48/48 passing).
- [x] Verification Suite Passing:
  - `npm run guard`: 4/4 checks passed.
  - `npm run lint`: 0 errors.
  - `npm run typecheck`: 0 errors.
  - `npm test`: 48/48 tests passed across 7 test suites.
  - `npm run build`: Production build succeeded; all 17 routes compiled cleanly.

---

### Exit gate — Work 8
- [x] `get_public_certificate` narrow RPC with zero PII leaks verified by automated tests
- [x] `verification_events`, `abuse_reports`, `email_suppressions` migration with RLS + pgTAP tests
- [x] Subagent `db-security-reviewer` audit PASSED with all 5 remediations verified
- [x] Email provider interface with Resend and dev console fallback transport
- [x] Clean HTML/text email templates using design tokens
- [x] Public verification page live at `/c/[publicId]` with verified seal and download redirect
- [x] QR camera scanner and ID entry screen live at `/verify`
- [x] All 48 unit/integration tests green
- [x] Production build passes cleanly with 0 errors
- [x] Tag created: `work-8-done`

---

### Work 9: Registry, revoke/correct, and bulk export (Completed 2026-10-25)
- [x] Branch: `work-9/registry-and-export`
- [x] Migration `supabase/migrations/20261025000007_exports_and_revocation.sql`:
  - `exports` table with `kind` (`zip`, `merged_pdf`, `report_csv`, `links_csv`), `status` (`queued`, `running`, `ready`, `failed`, `expired`), and 7-day expiration.
  - Multi-tenant RLS on `exports` (select for org members, insert for owner/admin/issuer, update/delete for owner/admin).
  - Private `exports` storage bucket (500MB limit, allowed MIME types).
  - Tenant-scoped storage RLS policies on `storage.objects` for `exports` bucket (`exports_storage_select` and `exports_storage_delete`).
  - Non-destructive `archived_pdfs jsonb not null default '[]'::jsonb` column on `certificates` for auditable correction and reissue history without primary key disruption.
  - Audited and APPROVED by `db-security-reviewer`.
- [x] Companion pgTAP test suite: `supabase/tests/20261025000007_exports_and_revocation_test.sql`.
- [x] Bulk Export Engine in `src/server/export.ts`:
  - Locked interface `buildExport(exportId)` fully implemented.
  - `sanitizeCsvValue()` enforcing formula injection defense (escapes leading `=`, `+`, `-`, `@`, `\t`, `\r`).
  - Non-Latin Unicode support (Hindi/Telugu scripts) preserved via UTF-8 with BOM (`\uFEFF`).
  - Cross-platform filename sanitization (`sanitizeFilename()`).
  - ZIP streaming with `fflate` into `{name}_{id}.pdf` bundles.
  - Memory-safe merged PDF generation with `pdf-lib` page copying.
  - Automatic 7-day expiration and background worker queue integration.
- [x] Background Worker Queue `/api/worker`:
  - `export` job processing invoking `buildExport(exportId)`.
  - `cleanup` job processing expiring exports older than 7 days.
- [x] Certificate Actions in `src/features/certificates/actions.ts`:
  - `revokeCertificateAction` with required reason, optional public display, and optional recipient email notification.
  - `correctCertificateAction` preserving the Base32 public ID (`CV-YY-XXXXXXXX`), archiving the superseded PDF, and re-rendering with new details.
  - `requestExportAction` inserting an export request and enqueuing background job.
  - `getExportsListAction` generating signed URLs for download.
  - `retryFailedBatchAction` recovering failed batch certificates without duplicate credit charging.
- [x] Certificates Registry UI:
  - `/app/certificates`: SegmentedControl (Batches vs All Certificates), search input, status filter chips, multi-select mode with bulk export/revoke bar, and slide-over Exports history drawer.
  - `/app/certificates/batch/[id]`: KPI metric cards (Total, Issued, Delivered, Failed, Downloads, Views), retry failed items banner, batch certificate list, and export batch trigger dialog.
  - `/app/certificates/[id]`: Live PDF preview container, cryptographic SHA-256 fingerprint with copy action, correction version history, status timeline, and modals for revocation and correction.
- [x] Automated Unit & Integration Tests in `src/test/registry-and-export.test.ts` (10 tests; total suite 58/58 passing).
- [x] Verification Suite Passing:
  - `npm run guard`: 4/4 checks passed.
  - `npm run lint`: 0 errors.
  - `npm run typecheck`: 0 errors.
  - `npm test`: 58/58 tests passed across 8 test suites.
  - `npm run build`: Production build succeeded; all 18 routes compiled cleanly.

---

### Exit gate — Work 9
- [x] `exports` table and private bucket migration with RLS + pgTAP tests
- [x] Subagent `db-security-reviewer` audit PASSED with storage object policies verified
- [x] All 4 bulk export formats verified: ZIP of PDFs, print merged PDF, report CSV, share links CSV
- [x] Formula injection attack vector sanitized with UTF-8 BOM encoding for Indian scripts
- [x] Background worker handles `export` and `cleanup` jobs with 7-day expiration
- [x] Non-destructive correction reissues certificate with same public ID and archives old PDF
- [x] Revoke action invalidates certificate with reason sheet and optional email notification
- [x] Certificates registry live at `/app/certificates`, batch detail at `/app/certificates/batch/[id]`, certificate detail at `/app/certificates/[id]`
- [x] All 58 unit/integration tests green
- [x] Production build passes cleanly with 0 errors
- [x] Tag created: `work-9-done`

---

### Next
- Next step is **WORK 10: Payments, plans, credits, and invoices**:
  - Pricing config (pack_event: 500 certs @ ₹1,499; pack_club: 2,000 certs @ ₹4,499; pack_bulk: 10,000 certs @ ₹14,999; plan_campus: ₹49,999/year)
  - Razorpay order creation server action with GST computation (18% intra/inter-state)
  - Razorpay checkout integration with UPI priority on mobile
  - Webhook `/api/webhooks/razorpay` with raw body HMAC-SHA256 signature verification and idempotent fulfillment
  - Migration: `payments` table, `invoices` table, sequential invoice numbering (`CV/2026-27/000001`), private `invoices` bucket
  - PDF invoice generator using the same PDF engine
  - Billing UI at `/app/account/billing`

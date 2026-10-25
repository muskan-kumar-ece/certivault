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

### Next
- Next step is **WORK 6: Templates and the PDF engine**:
  - `templates` table migration with RLS + tests (presets with `org_id is null`)
  - Buckets `templates` for backgrounds (PNG/JPG/PDF first page ≤ 5 MB)
  - Bundle fonts in `public/fonts` (Inter, Playfair Display, Noto Sans Devanagari, Noto Sans Telugu)
  - Implement server `renderCertificate()` using pdfme/pdf-lib
  - Implement Crockford Base32 `newPublicId()` with collision/uniqueness tests
  - 8 preset templates + thumbnails seed migration
  - Template library screen `/app/templates` (grid, search, duplicate, archive)
  - Template editor with embedded pdfme designer, inspector, and autosave
  - `scripts/benchmark-pdf.ts` (render 500 certificates, report ms each and file size).

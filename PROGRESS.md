# Progress Log: CertiVault

## Current: Work 2 — Foundation (database, auth, organizations, app shell) (COMPLETED)
Status: done
Branch: work-2/foundation
Tag: work-2-done

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

### Done in Work 2
- [x] Drafted initial foundation migration `supabase/migrations/20261025000001_foundation.sql`:
  - Extensions: `pgcrypto`, `pg_trgm`
  - Enum: `org_role ('owner', 'admin', 'issuer', 'viewer')`
  - 6 initial tables: `orgs`, `org_members`, `invitations`, `signatories`, `platform_admins`, `audit_logs`
  - Security Definer helper functions: `is_member(_org uuid)`, `has_role(_org uuid, _roles org_role[])`
- [x] Audited migration via `db-security-reviewer` subagent:
  - Identified & resolved SQL scope shadowing bug in `org_members` delete policy.
  - Added last-owner demotion protection in `org_members` update policy.
  - Restricted invitation updates to owner/admin to prevent role escalation.
  - Hardened audit log insert policy to enforce `actor_id = auth.uid()` and organization membership.
  - Added unique index on `invitations.token_hash`.
- [x] Implemented server authority helpers in `src/server/auth.ts`:
  - `requireUser()`: strictly enforces authenticated session.
  - `requireRole(orgId, allowedRoles)`: verifies server-side membership and RBAC.
  - `audit(orgId, action, meta)`: records immutable audit trail using admin service-role client.
- [x] Created Zod validation schemas in `src/lib/schemas/org.ts` (`createOrgSchema`, `updateOrgSchema`).
- [x] Built server actions in `src/features/org/actions.ts` (`createOrganizationAction`, `getUserOrganizationsAction`).
- [x] Implemented authentication server actions in `src/features/auth/actions.ts` (Email OTP, Verify OTP, Google OAuth, Sign Out).
- [x] Configured session refresh and route protection in `middleware.ts` (protects `/app`, `/admin`, `/onboarding`).
- [x] Built Auth callback route handler in `src/app/auth/callback/route.ts`.
- [x] Created interactive `/login` page with 6-digit OTP code input and Google sign-in.
- [x] Created 2-step `/onboarding` wizard for organization creation.
- [x] Created authenticated app shell in `src/app/(app)/app/layout.tsx` featuring dynamic `OrgSwitcher`.
- [x] Created Home dashboard view in `src/app/(app)/app/page.tsx` displaying live org balance and quick actions.
- [x] Verified builds and tests:
  - `npm test`: 7/7 unit tests passing
  - `npm run typecheck`: clean (0 errors)
  - `npm run build`: 10 static and dynamic routes compiled successfully
- [x] Created commit `9537f32` and git tag `work-2-done`.

---

### Decisions
- 2026-10-25: Aliased subqueries in `org_members` RLS policies (`m.org_id = org_members.org_id`) to prevent cross-organization owner counting bugs identified during subagent review.
- 2026-10-25: Configured passwordless Email OTP as primary auth path with optional Google OAuth.

---

### Exit gate — Work 2
- [x] Migration SQL created with strict RLS on all 6 tables
- [x] db-security-reviewer audit passed
- [x] Auth callback and middleware operational
- [x] Org creation server actions and Zod schemas tested
- [x] Production build passes cleanly
- [x] Tag created: `work-2-done`

---

### Next
- Next step is **WORK 3: ARCHITECTURE LOCK (freeze the foundations)**:
  - Create `ARCHITECTURE_LOCK.md` containing frozen stack versions, schema contracts, security rules, module interface stubs, ID formats, and job payloads.
  - Implement module interface stubs (`renderCertificate`, `sendEmail`, `enqueueJob`, `applyCreditDelta`, `createOrder`, `buildExport`).
  - Add CI guard scripts (grep checks for secret leaks, hex colors outside tokens, tables without RLS, allowlist dependencies).

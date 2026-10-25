# AGENT_PLAN.md: End-to-End Work Plan for the AI Coding Agent

**Project:** CertiVault (working name) · **Stack:** Next.js + Supabase · **Spec files:** `PRD.md`, `TRD.md`, `architecture.md`, `implementation.md`

Put this file, the four spec files, and a copy of section 1 as `AGENTS.md` (or `CLAUDE.md`) in the repo root. The agent reads this file at the start of every session.

---

## 0. How to use this plan

- The work is split into **numbered Works (0 to 13)**. Do them **in order**, one at a time.
- Each Work has: **Goal → Read first → Rules → Checklist → Exit gate → Handoff**.
- A checkbox may be ticked **only after you have run the verification and seen it pass**. Paste the command output summary into `PROGRESS.md`.
- Do not start Work N+1 until Work N's **Exit gate** is fully green and `PROGRESS.md` is updated.
- If a task is unclear, risky, or conflicts with a spec file, **stop and ask the human** (see section 2).

---

## 1. Global rules (apply to every Work)

### 1.1 Source of truth (highest wins)
1. `ARCHITECTURE_LOCK.md` (created in Work 3, frozen decisions)
2. `TRD.md` → 3. `PRD.md` → 4. `architecture.md` → 5. `implementation.md`
If two files disagree, follow the higher one and note the conflict in `PROGRESS.md`.

### 1.2 Working rules
1. **Small steps.** One feature slice per branch; keep diffs reviewable (aim for under about 400 changed lines).
2. **Plan before coding.** For each task, write 3-5 lines of plan in `PROGRESS.md`, then code.
3. **Tests with code.** Logic that touches money, auth, permissions, files, or IDs must ship with tests.
4. **No guessing APIs.** For pdfme, Razorpay, Supabase, Resend, Next.js: read the installed version's docs or types first. Don't invent function names.
5. **No new dependencies** outside the allowlist (section 5). Ask first.
6. **No secrets in code, logs, commits, or client bundles.** Only `.env.local` / platform env vars. Never log full emails, tokens, or payment payloads.
7. **Server is the authority.** Every server action: `requireUser → requireRole → validate (Zod) → act → audit`. Never trust client-sent org IDs or prices.
8. **RLS on every table.** A new table without RLS and a pgTAP test is not done.
9. **Money and IDs are sacred.** Only touch credits via `apply_credit_delta`. Never edit `credit_balance` directly. Webhooks and jobs must be idempotent.
10. **Design tokens only.** No hard-coded colors, radii, spacing, or font sizes in components. Use tokens and shared components.
11. **Every screen has** loading, empty, and error states; works on phone and desktop; supports light and dark; respects reduced motion.
12. **Accessibility baseline:** 44 px targets, labels on icon buttons, visible focus, AA contrast.
13. **Copy rules:** sentence case, buttons name results ("Issue 412 certificates"), errors say how to fix, no apologies.
14. **Never delete or rewrite user data, migrations already applied, or spec files** without approval. Add new migrations; don't edit old ones.
15. **Keep it boring.** Prefer the simplest approach that meets the spec. No premature abstractions, no extra features.

### 1.3 Commit and branch conventions
- Branch: `work-<N>/<short-name>` (e.g., `work-7/issue-wizard`).
- Commits: `type(scope): message` (`feat(issue): add column matching`). Types: feat, fix, test, chore, docs, refactor.
- Each Work ends with a tag: `work-<N>-done`.

### 1.4 Required standing commands
```bash
npm run lint && npm run typecheck && npm test            # app checks
npx supabase db reset && npx supabase test db            # migrations + RLS tests
npm run build                                            # production build must pass
npm run e2e                                              # from Work 8 onward
```
(Create these npm scripts in Work 1.)

---

## 2. When to stop and ask the human

Stop and ask (do not decide alone) when:
- A spec file is ambiguous, contradictory, or missing a decision that changes behavior.
- You need a **new dependency, paid service, or environment variable**.
- A change would **alter the locked architecture** (Work 3 onward): schema, folder boundaries, module interfaces, ADRs.
- Anything involving **legal text, GST, pricing, refunds, or data-retention policy**.
- A **destructive action**: dropping tables, deleting storage, force-pushing, rotating keys.
- A test fails and the fix would require weakening the test or the security rule.
- You have attempted the same fix 3 times without progress.

Use this format:
```
BLOCKER: <one-line summary>
Context: <what you were doing, which file/section>
Options: A) ... B) ... (with trade-offs)
Recommendation: <your pick and why>
```

---

## 3. Templates

### 3.1 `PROGRESS.md` (create in Work 0, update continuously)
```md
# Progress log

## Current: Work <N> — <name>
Status: in progress | blocked | done
Branch: work-<N>/<name>

### Plan (current task)
- ...

### Done
- [x] <task> — verified by: <command/result>

### Decisions
- <date>: <decision> — reason

### Conflicts / blockers
- ...

### Next
- ...
```

### 3.2 Change request (after the Architecture Lock)
```md
# CR-<number>: <title>
Why needed: ...
What changes (tables / modules / contracts): ...
Impact on existing code and tests: ...
Alternatives considered: ...
Approval: [ ] human approved on <date>
```
Store in `/docs/change-requests/`. Update `ARCHITECTURE_LOCK.md` only after approval.

---

## WORK 0: Orient and prepare

**Goal:** understand the project, set up tracking, confirm the environment.

**Read first:** all four spec files, fully. Then this file.

**Rules:** don't write product code yet.

**Checklist**
- [ ] Read `PRD.md`, `TRD.md`, `architecture.md`, `implementation.md` completely
- [ ] Create `PROGRESS.md` from the template
- [ ] Write a 10-line summary of the product, users, and v1.0 scope into `PROGRESS.md` (to prove understanding)
- [ ] List open questions from PRD §15 and any ambiguities you found; ask the human
- [ ] Confirm tools: Node LTS, npm, Git, Docker (for Supabase local), Supabase CLI
- [ ] Confirm the human has provided (or will provide) accounts: Supabase project (Mumbai), Vercel, Resend, Razorpay test keys, Sentry
- [ ] Copy section 1 of this file into repo-root `AGENTS.md`

**Exit gate:** `PROGRESS.md` exists; open questions answered or logged; environment checks pass (`node -v`, `docker ps`, `npx supabase --version`).

**Handoff:** list assumptions made.

---

## WORK 1: Repository, folder structure, and rules

**Goal:** a clean, rule-enforcing skeleton that every later Work fits into.

**Read first:** `architecture.md` §6, `implementation.md` §1, this file §1.

**Rules**
- Folder names and boundaries must match `architecture.md` §6 exactly.
- Dependency direction: `app → features → server/lib → (nothing)`. `components/ui` must not import from `features` or `server`.
- `src/server/*` is server-only (add `import 'server-only'` at the top of each module).

**Checklist**
- [ ] `create-next-app` (TypeScript, Tailwind, App Router, `src/`, ESLint)
- [ ] Create folders: `src/app/(marketing)`, `(auth)`, `(app)/app`, `c/[publicId]`, `verify`, `admin`, `api`; `src/components/ui`; `src/features/{templates,issue,certificates,billing,team,org}`; `src/server/{pdf,jobs,email,payments,export,ai,auth}`; `src/lib/{supabase,schemas,utils}`; `supabase/{migrations,tests}`; `docs/change-requests`; `scripts`; `public/fonts`
- [ ] Add placeholder `README.md` in each top-level folder (2-3 lines: purpose and import rules)
- [ ] TypeScript `strict: true`; path alias `@/*`
- [ ] ESLint rules: no unused vars, no `any` without comment, import boundary rules (e.g., `eslint-plugin-boundaries` or `no-restricted-imports`) enforcing the dependency direction
- [ ] Prettier + `.editorconfig`; `lint-staged` + `husky` pre-commit (lint + typecheck on staged files)
- [ ] npm scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `test:db`, `e2e`, `format`
- [ ] Vitest configured with a sample passing test; Playwright configured with mobile + desktop projects (empty test OK)
- [ ] `.env.example` listing every variable in `TRD.md` §17 (no real values); `.gitignore` covers `.env*`
- [ ] CI workflow (GitHub Actions): install, lint, typecheck, test, build; DB tests job added in Work 2
- [ ] `docs/` contains the four spec files + `AGENT_PLAN.md`
- [ ] `.github/pull_request_template.md` with the Definition of Done checklist (`implementation.md` §10)
- [ ] Secret scanning step in CI (e.g., gitleaks)

**Exit gate:** `npm run lint && npm run typecheck && npm test && npm run build` pass; CI green on a test PR; a deliberate bad import (ui → server) fails lint (then remove it).

**Handoff:** tag `work-1-done`; note any deviations from `architecture.md` §6.

---

## WORK 2: Foundation (database, auth, organizations, app shell)

**Goal:** a signed-in user can create an organization; data isolation is proven.

**Read first:** `TRD.md` §3, §4 (schema, RLS), `PRD.md` §6, §7.2-7.3, `implementation.md` §3 Week 1.

**Rules**
- Migrations are append-only SQL files in `supabase/migrations`, named `YYYYMMDDHHMMSS_description.sql`.
- Create only tables needed now (`orgs`, `org_members`, `invitations`, `signatories`, `platform_admins`, `audit_logs`) plus helper functions. Other tables arrive in their Works, using the schema from `TRD.md` exactly.
- Every table: RLS enabled in the same migration, with policies and a pgTAP test.
- Three Supabase clients only: browser, server (cookies), admin (service role, server-only file).

**Checklist**
- [ ] `supabase init` / `supabase start`; config for Mumbai region noted in docs
- [ ] Migration: extensions, enum `org_role`, the six tables, `is_member`, `has_role`
- [ ] RLS policies for all six tables per `TRD.md` §4
- [ ] pgTAP tests: member / non-member / anon / wrong-role for each table
- [ ] Supabase clients in `src/lib/supabase/{browser,server}.ts` and `src/server/admin.ts` (with `server-only`)
- [ ] Auth: email OTP + Google; callback route; middleware protecting `(app)`; sign-out
- [ ] `requireUser()`, `requireRole(orgId, roles)`, `audit()` helpers in `src/server/auth`
- [ ] Zod schemas for org create/update in `src/lib/schemas`
- [ ] Server action: create organization (creator becomes owner, grants 50 free credits via ledger once the ledger exists; until then store a TODO note)
- [ ] Onboarding screens (org name/type/city; logo + color) — functional, plain styling is fine (design system comes in Work 4)
- [ ] Org switcher (data only; UI polish later)
- [ ] Basic `(app)` shell with navigation items from `PRD.md` §6 as placeholders
- [ ] Seed script: one demo user + org
- [ ] Add DB tests job to CI

**Exit gate:** `npx supabase db reset && npx supabase test db` green; manual check: sign up → create org → land on `/app`; user B cannot read org A rows (proven by test, not by eye).

**Handoff:** tag `work-2-done`; list all tables, functions, policies created.

---

## WORK 3: ARCHITECTURE LOCK (freeze the foundations)

**Goal:** turn decisions into enforced, written contracts so later work can't drift.

**Read first:** `architecture.md` §10 (ADRs), `TRD.md` entire, everything built in Work 1-2.

**Rules**
- This Work produces documents and guardrails, not features.
- After this Work, locked items change only via a **Change Request approved by the human**.

**Checklist**
- [ ] Create `ARCHITECTURE_LOCK.md` containing:
  - [ ] **Locked stack and versions** (exact versions from `package.json` and Supabase CLI)
  - [ ] **Locked folder structure and import rules** (from Work 1)
  - [ ] **Locked data contracts:** full v1.0 schema from `TRD.md` §3 (tables, columns, constraints) marked "implemented" or "planned: Work N"
  - [ ] **Locked security rules:** RLS-everywhere, service-role confinement, money functions service-role only, webhook signature rule, private buckets, signed URLs
  - [ ] **Locked module interfaces** (TypeScript signatures; implement stubs now): `sendEmail()`, `renderCertificate()`, `enqueueJob()`, `applyCreditDelta()`, `createOrder()`, `buildExport()`, `storage.upload/signedUrl`
  - [ ] **Locked ID format** (`CV-YY-XXXXXXXX`, Crockford Base32) and verify URL shape
  - [ ] **Locked job types and payload shapes**
  - [ ] **Locked route map** from `PRD.md` §6
  - [ ] **Locked design tokens** (names and values from `PRD.md` §11)
  - [ ] **Dependency allowlist** (section 5 below, copied in)
  - [ ] **ADR list** with status "accepted"
  - [ ] **Change-request process** (link to template in section 3.2)
- [ ] Implement the module interface stubs with Zod-typed inputs/outputs and "not implemented" bodies; add unit tests that assert the signatures exist
- [ ] Add CI guard scripts:
  - [ ] grep check: `SUPABASE_SERVICE_ROLE_KEY` / `src/server/admin` never imported from client code
  - [ ] check that every table in migrations has `enable row level security`
  - [ ] check that no file outside `src/lib/tokens` / `globals.css` contains hex colors
  - [ ] dependency check: fail CI if `package.json` has dependencies not on the allowlist
- [ ] Add a "Locked contracts" section to `AGENTS.md`: "Do not change anything listed in ARCHITECTURE_LOCK.md without an approved CR"
- [ ] Ask the human to review and approve `ARCHITECTURE_LOCK.md`

**Exit gate:** human approval recorded in `PROGRESS.md`; CI guard scripts run and pass; a deliberately added hex color, unlisted dependency, or table without RLS makes CI fail (then revert).

**Handoff:** tag `work-3-done`.

---

## WORK 4: Design system and app shell (Apple-style feel)

**Goal:** all reusable UI, so features are assembled, not styled.

**Read first:** `PRD.md` §11, `implementation.md` §2 and §6.

**Rules**
- Components live only in `src/components/ui`. No feature-specific styling inside them.
- Tokens come from CSS variables; light and dark both defined.
- Motion uses the shared spring constants; honor `prefers-reduced-motion`.

**Checklist**
- [ ] Tokens in `globals.css` (colors, radii, spacing, shadows, type scale, spring constants) and a typed `tokens.ts`
- [ ] Fonts: system stack + Inter via `next/font`
- [ ] Components: Button (primary, secondary, tinted, destructive), IconButton, SegmentedControl, Field, Select, Combobox, FileDropZone, Stepper, Sheet (vaul), Dialog, Toast, Skeleton, EmptyState, Chip/Badge, ProgressRing/Bar, ListRow with swipe actions, LargeTitleHeader, TabBar, Sidebar, CommandPalette
- [ ] `usePress` helper: scale 0.97, 100 ms, `touch-action: manipulation`, no tap highlight
- [ ] Responsive shell: bottom tab bar (mobile) / sidebar (desktop); safe-area padding; `100dvh`
- [ ] Page transition wrapper using View Transitions API with fallback
- [ ] `/dev/ui` showcase page (dev-only) with all components, light/dark toggle
- [ ] Replace placeholder shell and onboarding styling with the design system
- [ ] axe accessibility check on `/dev/ui`; Playwright screenshots (iPhone, Pixel, desktop; light/dark)

**Exit gate:** lint/typecheck/tests green; Lighthouse accessibility ≥ 95 on `/dev/ui`; manual review on a real phone recorded in `PROGRESS.md`.

**Handoff:** tag `work-4-done`; list components and their props in `src/components/ui/README.md`.

---

## WORK 5: Organization, team, and settings

**Goal:** complete account management.

**Read first:** `PRD.md` §7.12-7.14, `TRD.md` §4.

**Rules:** role changes and removals are audited; last owner cannot be removed or demoted.

**Checklist**
- [ ] Organization settings screen (name, logo, color, sender name, reply-to, retention setting)
- [ ] Signatories CRUD (name, title, signature image upload with validation)
- [ ] Team screen: list, invite by email (token hashed, expires), accept flow, change role, remove
- [ ] Invitation email via the `sendEmail()` stub or a console/log transport in dev
- [ ] Storage bucket `branding` + policies; upload helper with type/size checks and image re-encode
- [ ] Audit log writes for role changes, invites, settings changes
- [ ] pgTAP tests for roles (issuer cannot manage team; viewer read-only)
- [ ] Playwright: invite → accept → role-restricted UI

**Exit gate:** all checks green; role matrix test passes; last-owner protection test passes.

**Handoff:** tag `work-5-done`.

---

## WORK 6: Templates and the PDF engine

**Goal:** design a template and render a correct, verifiable-looking PDF; prove performance.

**Read first:** `PRD.md` §7.5-7.6, `TRD.md` §5, §7, `implementation.md` Week 2 and §5.

**Rules**
- Presets are rows with `org_id is null`, read-only for users.
- A template cannot be marked usable without a QR field and an ID field.
- Check installed pdfme types/docs before coding; adapt the sketch in `TRD.md` accordingly.

**Checklist**
- [ ] Migration: `templates` with RLS + tests
- [ ] Buckets `templates`; upload backgrounds (PNG/JPG/PDF first page ≤ 5 MB)
- [ ] Bundle fonts in `public/fonts`; verify licenses allow embedding
- [ ] `renderCertificate()` implemented (replace stub) with Hindi and Telugu test names
- [ ] `newPublicId()` with tests (format, alphabet, uniqueness over 100k samples)
- [ ] 8 preset templates + thumbnails; seed migration
- [ ] Template library screen (grid, search, duplicate, archive)
- [ ] Template editor: pdfme designer embedded, field palette, inspector (sheet on small screens), autosave, undo/redo, sample-data preview, long-name stress preview, required-field validation
- [ ] Phone behavior per PRD: presets and quick-edit with the "move fields on a tablet or computer" note
- [ ] `scripts/benchmark-pdf.ts`: render 500 certificates, report ms each and file size
- [ ] QR scan test: render, rasterize, decode QR in a test, assert it equals the verify URL

**Exit gate:** benchmark ≤ 500 ms per certificate on the dev machine (record number; if worse, report options before continuing); QR decode test passes; PDF size ≤ about 150 KB.

**Handoff:** tag `work-6-done`; record benchmark numbers in `PROGRESS.md`.

---

## WORK 7: Import, issue wizard, credits, and worker

**Goal:** issue a batch end to end with correct credit accounting.

**Read first:** `PRD.md` §7.7, `TRD.md` §6-7, `implementation.md` Week 3 and §4.

**Rules**
- Credits change only through `apply_credit_delta` inside the same transaction as the event.
- All jobs idempotent; batch counters recomputed from certificate rows, not blindly incremented.
- Parsing on the client; server re-validates every row with Zod.

**Checklist**
- [ ] Migration: `batches`, `certificates`, `jobs`, `credit_ledger`, `apply_credit_delta`, `claim_jobs`, `issue_batch` with RLS + pgTAP tests
- [ ] Grant free credits on org creation via ledger (resolve the Work 2 TODO)
- [ ] pgTAP: balance can never go negative; concurrent `claim_jobs` never double-claims
- [ ] Client parsing: CSV (Papa) and XLSX (SheetJS), 5,000-row cap; paste and manual add
- [ ] Column auto-match with Fuse.js and alias table; manual override UI
- [ ] Validation: required, email format, duplicates, name length; "Fix" and "Skip rows" actions
- [ ] Wizard routes `?step=1..5` with server-saved drafts; sticky bottom bar; cost summary; insufficient-credit sheet (links to billing)
- [ ] "Send me a test certificate" (rate-limited, free)
- [ ] Worker `/api/worker` (time-boxed, self-retrigger, bearer secret); `pg_cron` + `pg_net` heartbeat migration
- [ ] `generate_chunk` handler; failure isolation; automatic credit refund; SHA-256 stored
- [ ] Progress screen with Realtime and polling fallback; completion state
- [ ] Tests: ID collisions retry; 1,000-row batch completes; kill worker mid-run then resume; credit reconciliation (reserved − refunded = issued)

**Exit gate:** integration test issues 1,000 certificates with ≥ 99% success and exact credit reconciliation; stale-lock recovery test passes.

**Handoff:** tag `work-7-done`; document job payloads in `ARCHITECTURE_LOCK.md` if any changed (via CR if locked).

---

## WORK 8: Email delivery and public verification

**Goal:** recipients get certificates; anyone can verify them fast and safely.

**Read first:** `PRD.md` §7.11-7.12, §12, `TRD.md` §9, §11, `architecture.md` §4.2.

**Rules**
- The verify page uses only the `get_public_certificate` RPC; it must never expose email or internal IDs.
- Webhook signature checked on raw body.
- Unverified-email orgs cannot send bulk email.

**Checklist**
- [ ] Email provider interface with Resend implementation and dev console transport
- [ ] React Email templates: certificate delivery, batch complete, sign-in/invite
- [ ] `send_email_chunk` job; suppression list table + checks; throttling
- [ ] Email webhooks (delivered, bounced, complained) → `email_status`
- [ ] SPF/DKIM/DMARC instructions documented in `docs/email-setup.md`
- [ ] Migration: `get_public_certificate` RPC, `verification_events`, `abuse_reports`
- [ ] Rate limiting (Upstash or DB bucket) on verify, auth, uploads, test sends
- [ ] `/c/[publicId]` page: valid, revoked, not-found, error states; verified seal; download via signed URL route with rate limit
- [ ] `/verify`: ID entry + camera QR scan with fallback
- [ ] Home dashboard data: recent batches, delivery stats
- [ ] Playwright: issue → open verify URL → valid page; tampered ID → not-found
- [ ] Test inbox placement manually on Gmail, Outlook, Yahoo; record results

**Exit gate:** verify page TTFB ≤ 300 ms and LCP ≤ 1.5 s on throttled 4G (Lighthouse run recorded); no PII in the RPC output (test); webhook replay safe.

**Handoff:** tag `work-8-done`.

---

## WORK 9: Registry, revoke/correct, and bulk export

**Goal:** manage issued certificates and export them in bulk.

**Read first:** `PRD.md` §7.8-7.10, `TRD.md` §5, §8.

**Rules**
- Certificates are never hard-deleted by users.
- Correction keeps the same public ID and archives the old PDF.
- CSV exports escape formula characters; use UTF-8 with BOM.

**Checklist**
- [ ] Certificates screen: Batches / All; trigram search; filters; infinite scroll; multi-select mode
- [ ] Batch detail with stats, failed rows, "Retry failed" (no extra credits)
- [ ] Certificate detail with timeline, resend, copy link
- [ ] Revoke (reason sheet, optional notify) and correct/reissue; audit entries; verify page reflects within 30 s (test)
- [ ] Migration: `exports` + RLS; bucket `exports`
- [ ] `export` job: ZIP (streamed, auto-split), merged PDF (chunked via pdf-lib), report CSV, share-links CSV
- [ ] Filters: all / selected / failed only; filename pattern `{name}_{id}`
- [ ] Exports drawer, ready email, 7-day expiry, `cleanup` cron
- [ ] Tests: 1,000-certificate exports open correctly (ZIP integrity, PDF page count, CSV in Excel/Sheets with Hindi/Telugu names); injection payload test

**Exit gate:** all four export types verified on a 1,000-certificate batch; revoke latency test passes; cross-org access attempts fail.

**Handoff:** tag `work-9-done`.

---

## WORK 10: Payments, plans, credits, and invoices

**Goal:** take money safely and grant credits exactly once.

**Read first:** `PRD.md` §7.12, §10, `TRD.md` §10, `implementation.md` Week 6 and §4.5.

**Rules**
- Prices come from server config, never from the client.
- `fulfill_payment` is the only path that grants purchased credits, and it is idempotent.
- Test mode only until the human approves going live.
- **Do not write legal or tax text yourself**; use placeholders and ask the human/CA.

**Checklist**
- [ ] Migration: `payments`, `invoices`, `webhook_events`, invoice-number function, `fulfill_payment`; RLS + tests
- [ ] Product config (packs, Campus plan) in one server module; GST calculation with unit tests (intra vs inter state)
- [ ] `createOrder()` server action; Razorpay Checkout integration; confirm endpoint with signature check
- [ ] Webhook route: raw-body signature check, event dedupe, events `payment.captured`/`order.paid`, `payment.failed`, `refund.processed`
- [ ] Billing screen: plan, balance, packs, Campus upgrade, GST details form, invoices list
- [ ] `invoice` job: sequential numbers per financial year, PDF via the PDF engine, receipt email
- [ ] Low-credit emails (10% and 0); Campus expiry reminders (30/7/1 days)
- [ ] Admin manual credit grant (for bank-transfer customers) with audit
- [ ] Pricing page (public) with the numbers from `PRD.md` §10
- [ ] Tests: webhook replayed 3 times credits once; forged signature rejected; failed payment path; concurrent confirm + webhook credits once; invoice numbers gapless under concurrency

**Exit gate:** full Razorpay **test-mode** purchase works end to end on phone and desktop; all idempotency/forgery tests pass.

**Handoff:** tag `work-10-done`; list items needing human/CA review (invoice format, SAC code, refund wording).

---

## WORK 11: Admin console, polish, PWA

**Goal:** operational tools and the "feels good" finish.

**Read first:** `PRD.md` §7.15, §11, `implementation.md` Week 7 and §6.

**Checklist**
- [ ] `/admin` (platform_admins only): orgs list/detail, payments, grant credits, suspend/unsuspend, verified-issuer approval, abuse queue
- [ ] Suspension behavior implemented as specified (blocks issuing/sending; verification of existing certificates still works)
- [ ] Landing page with live demo (name → certificate preview + QR), pricing, FAQ, legal page shells
- [ ] PWA manifest, icons, offline fallback page, install prompt after first issue
- [ ] Complete the polish checklist (`implementation.md` §6) for every screen; fix findings
- [ ] Empty/error/loading states audit; copy audit against PRD voice rules
- [ ] Bundle analysis; keep initial app JS near the TRD budget; image/font optimization
- [ ] Command palette (⌘K) wired to navigation and search
- [ ] Three-person silent usability test (human runs it; agent fixes top issues)

**Exit gate:** Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95 on landing, verify, and Home; Playwright suite green on iPhone, Pixel, desktop in light and dark.

**Handoff:** tag `work-11-done`.

---

## WORK 12: Security hardening, testing, and load

**Goal:** prove it is safe and fast enough to launch.

**Read first:** `TRD.md` §4, §14, §16, §18; `implementation.md` §7.

**Checklist**
- [ ] Run the full security checklist (`implementation.md` §7); fix every failure
- [ ] Cross-org attack tests (read, update, storage paths, signed URLs, RPC misuse)
- [ ] Hostile upload tests (oversized, wrong type, SVG scripts, polyglot files)
- [ ] CSV injection and filename traversal tests
- [ ] Security headers and CSP verified; no secrets in client bundle (scan build output)
- [ ] Dependency audit (`npm audit`) reviewed; high issues resolved or documented
- [ ] Load tests: 5,000-certificate batch; 100 concurrent verifications; worker under restarts
- [ ] Observability: Sentry with PII scrubbing; structured logs; alerts for queue age, payment lag, error rate
- [ ] Backup and restore drill documented in `docs/runbook.md` with runbook items from `TRD.md` §14
- [ ] Verify every acceptance criterion in `TRD.md` §18 and record evidence

**Exit gate:** all `TRD.md` §18 criteria pass with evidence in `PROGRESS.md`; no open high-severity issues.

**Handoff:** tag `work-12-done`.

---

## WORK 13: Production deployment and launch

**Goal:** ship v1.0 to production safely.

**Rules:** the **human performs** account-level actions (Razorpay live approval, DNS, paid plans, legal text approval). The agent prepares and verifies.

**Checklist**
- [ ] Production Supabase (Mumbai) with migrations applied through CI; backups enabled
- [ ] Vercel production project (paid plan if charging), region `bom1`, env vars set, domains configured
- [ ] Sending domain verified; DMARC monitoring on
- [ ] Razorpay live keys swapped (human approval recorded); live webhook configured; ₹1-class real payment and refund tested by the human
- [ ] `pg_cron` heartbeat pointing at production worker URL
- [ ] Seed production presets only (no demo data)
- [ ] Terms, Privacy, Refund, Contact pages populated with human/lawyer-approved text
- [ ] Uptime monitor and alert routing active
- [ ] Beta onboarding: 5 clubs + 1-2 college pilots; support channel live
- [ ] Rollback plan documented (previous Vercel deployment, DB migration down-notes)
- [ ] Post-launch dashboard: activation funnel, batch success rate, email delivery, credits sold

**Exit gate:** a real user completes sign-up → issue → verify → buy credits in production; monitoring shows healthy; human signs off in `PROGRESS.md`.

**Handoff:** tag `v1.0.0`; create the v1.1 backlog from `PRD.md` §5.

---

## 4. Per-Work exit-gate template (copy into `PROGRESS.md`)

```md
### Exit gate — Work <N>
- [ ] npm run lint / typecheck / test — pass
- [ ] npx supabase db reset && npx supabase test db — pass
- [ ] npm run build — pass
- [ ] npm run e2e — pass (Work 8+)
- [ ] CI guard scripts — pass (Work 3+)
- [ ] Manual check on real phone — notes: ...
- [ ] Spec conflicts logged — yes/no
- [ ] Tag created: work-<N>-done
```

---

## 5. Dependency allowlist (initial; extend only via human approval)

**Runtime:** `next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `react-hook-form`, `@hookform/resolvers`, `framer-motion`, `vaul`, `cmdk`, `lucide-react`, `@tanstack/react-query`, `@radix-ui/react-*`, `papaparse`, `xlsx`, `fuse.js`, `fflate`, `pdf-lib`, `@pdfme/generator`, `@pdfme/schemas`, `@pdfme/common`, `@pdfme/ui`, `razorpay`, `resend`, `@react-email/components`, `date-fns`, `nanoid`, `server-only`, `@upstash/redis`, `@upstash/ratelimit`, `@sentry/nextjs`

**Dev:** `vitest`, `@playwright/test`, `eslint` + plugins, `prettier`, `husky`, `lint-staged`, `supabase` (CLI), `@types/*`, `axe-core` / `@axe-core/playwright`, `gitleaks` (CI), optional QR decoder for tests (`jsqr`)

**Optional later (ask first):** analytics (`posthog-js` or Plausible), `tesseract.js`, AI SDK for the small model, WhatsApp provider SDK.

---

## 6. Quick reference: the order of Works

| Work | Name | Output |
|---|---|---|
| 0 | Orient | Understanding, `PROGRESS.md` |
| 1 | Repo and rules | Folder structure, lint/CI guardrails |
| 2 | Foundation | DB, auth, orgs, RLS proven |
| 3 | **Architecture lock** | `ARCHITECTURE_LOCK.md`, CI guards |
| 4 | Design system | Apple-style components and shell |
| 5 | Org and team | Settings, roles, invites |
| 6 | Templates and PDF | Editor, renderer, benchmark |
| 7 | Issue pipeline | Import, wizard, credits, worker |
| 8 | Delivery and verify | Email, public verification |
| 9 | Registry and export | Revoke, correct, bulk exports |
| 10 | Payments | Razorpay, GST invoices, plans |
| 11 | Admin and polish | Admin console, PWA, landing |
| 12 | Hardening | Security, load, runbook |
| 13 | Launch | Production, beta, v1.0.0 |

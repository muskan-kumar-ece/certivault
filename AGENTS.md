# Standing Prompt and Rules for CertiVault

**Stack:** Next.js (App Router, TypeScript, Tailwind) + Supabase (Postgres, Auth, Storage, Realtime, RLS)
**Hosting:** Vercel (Mumbai, `bom1`) + Supabase (Mumbai, `ap-south-1`)
**Primary Specs:**
- `docs/PRD.md` — Product Requirements (screens, flows, pricing, Apple-style design system)
- `docs/TRD.md` — Technical Requirements (schema, RLS, jobs, payments, email, exports)
- `docs/architecture.md` — System architecture, ADRs, storage boundaries, sequences
- `docs/implementation.md` — Week-by-week build guide, code sketches, quality checklists
- `docs/AGENT_PLAN.md` — Ordered Works (0 to 13), rules, checklists, exit gates
- `ARCHITECTURE_LOCK.md` — Frozen decisions (created in Work 3)
- `PROGRESS.md` — Execution tracking, decisions, blockers

**Precedence Order:**
`ARCHITECTURE_LOCK.md` > `TRD.md` > `PRD.md` > `architecture.md` > `implementation.md`

---

## 1. MANDATORY PREFLIGHT PROTOCOL (Before EVERY task)

Before writing, editing, deleting, or executing anything that changes state:
1. Locate and read the relevant doc sections (`TRD.md`, `PRD.md`, `architecture.md`, `implementation.md`, `AGENT_PLAN.md`, `ARCHITECTURE_LOCK.md`).
2. Read `PROGRESS.md` to identify current Work, active branch, and blockers.
3. Inspect existing code/tests in the touched areas.
4. Output the standardized **Preflight Report**:
```
PREFLIGHT
Request: <one line>
Work/phase: <N, name> | Branch: <name>
Docs read: <file §section list>
Requirements found: <bullets with citations>
Existing code reviewed: <paths>
Locked items touched: none | <list>
Gaps / ambiguities: none | <list>
Plan: <3-7 steps tied to doc citations>
Subagents: none | <which, for what>
Verification: <exact commands + checks from exit gate>
```
5. **Gate:** If gaps/ambiguities exist or a required doc section is missing, **STOP AND ASK**. Do not guess or proceed on assumptions.

---

## 2. CORE NON-NEGOTIABLE RULES

1. **Server Authority:** Every server action must execute: `requireUser()` → `requireRole(orgId, [...])` → `validate (Zod)` → `act` → `audit()`. Never trust client-provided org IDs or prices.
2. **RLS Everywhere:** Every single table must have RLS enabled in the migration creating it, accompanied by pgTAP tests covering owner, admin, issuer, viewer, and anon roles.
3. **Credit and Ledger Integrity:** Modifying credit balances is ONLY permitted via `apply_credit_delta`. Direct updates to `credit_balance` are strictly forbidden. Negative balances are prevented by DB CHECK constraints.
4. **Idempotent Webhooks & Jobs:** Razorpay webhooks, worker tasks (`generate_chunk`, `send_email_chunk`, `export`, `invoice`), and payment fulfillment MUST be strictly idempotent.
5. **Design System & Tokens Only:** No hard-coded hex colors, arbitrary spacing, or inline styles. Use CSS tokens (`globals.css`, `src/lib/tokens.ts`) and primitives in `src/components/ui/`.
6. **State Completeness:** Every UI screen/view must support loading (skeleton), empty, and error states; light and dark mode; mobile bottom sheets/tab bar and desktop dialogs/sidebar; and respect `prefers-reduced-motion`.
7. **Accessibility & Touch:** Minimum 44x44px touch targets, visible focus rings, AA contrast, 100ms press feedback (`scale: 0.97`, `touch-action: manipulation`).
8. **Dependencies:** Strictly adhere to the Dependency Allowlist in `AGENT_PLAN.md` §5. Adding unlisted dependencies requires explicit human approval.
9. **Secrets Protection:** Never expose `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `WORKER_SECRET`, or any credentials to the browser or logs. Keep `src/server/*` restricted via `import 'server-only'`.
10. **Public Verification Integrity:** The `/c/[publicId]` route must use the narrow `get_public_certificate` RPC only; recipient emails and internal DB IDs must never be exposed.
11. **Verification Before Tick:** Never claim or tick off an exit-gate checklist item without running the command and witnessing clean output.

---

## 3. SUBAGENTS ROSTER & USAGE

- **`spec-navigator`** (Read-only): Locates and quotes exact requirements, identifies doc conflicts and missing items. Proactively run at preflight.
- **`db-security-reviewer`** (Read-only on code, test runner): Reviews SQL migrations, RLS policies, security definer functions, and financial logic. Mandatory before finalizing DB changes.
- **`ui-reviewer`** (Read-only, a11y test runner): Audits components against design tokens, required states, touch ergonomics, and WCAG AA accessibility. Mandatory before finalizing UI changes.
- **`test-writer`** (Test files only): Writes Vitest, Playwright, and pgTAP tests for sensitive domain logic (auth, credits, IDs, jobs, exports).
- **`pipeline-verifier`** (Integration & runner): Verifies high-throughput jobs, worker restarts, credit reconciliation, and export file integrity.
- **`docs-keeper`** (Docs only): Updates `PROGRESS.md`, tracks decisions/blockers, and drafts change requests.

---

## 4. STOP-AND-ASK PROTOCOL

Halt immediately and ask the human when:
- Requirements are ambiguous or missing.
- Docs conflict and cannot be resolved by the precedence order.
- A new dependency, paid service, or environment variable is needed.
- A change modifies `ARCHITECTURE_LOCK.md` or already applied migrations.
- Legal text, GST compliance, refund terms, or pricing is involved.
- An action is destructive or irreversible.
- A test fix would weaken a security rule or test assertion.
- Three attempts at a fix have failed.

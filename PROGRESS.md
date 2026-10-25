# Progress Log: CertiVault

## Current: Work 0 — Orient and prepare
Status: in progress
Branch: main

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

### Plan (Current Task)
- [x] Read all specification documents (`PRD.md`, `TRD.md`, `architecture.md`, `implementation.md`, `AGENT_PLAN.md`, `AGENT_PROMPT.md`)
- [x] Save standing prompt and rules into repo-root `AGENTS.md` and `CLAUDE.md`
- [x] Register and configure the 6 required subagents (`spec-navigator`, `db-security-reviewer`, `ui-reviewer`, `test-writer`, `pipeline-verifier`, `docs-keeper`)
- [x] Create `PROGRESS.md` with product understanding summary and exit gate tracking
- [ ] Confirm environment requirements and open questions with human

---

### Done
- [x] Full docs review completed — verified 6 spec files in `docs/`
- [x] Repository rules established in `AGENTS.md` and `CLAUDE.md`
- [x] Subagents defined in memory and saved to `.claude/agents/*.md`
- [x] Work 0 environment verification executed:
  - Node.js: `v22.15.0` (OK)
  - npm: `10.9.2` (OK)
  - Git: `2.52.0.windows.1` (OK)

---

### Decisions
- 2026-10-25: Adopted strict precedence order: `ARCHITECTURE_LOCK.md` > `TRD.md` > `PRD.md` > `architecture.md` > `implementation.md`.
- 2026-10-25: Subagents configured with explicit separation of concerns; review subagents are strictly read-only on product code.

---

### Conflicts / Blockers (PRD §15 & Environment Open Questions)
1. **BLOCKER: Docker & Supabase CLI Environment**:
   - `docker` is currently not detected in the Windows PATH.
   - Local Supabase (`npx supabase start`, pgTAP testing) requires Docker Desktop running.
   - *Question for human:* Is Docker Desktop installed or should we prepare cloud Supabase staging/dev project for migration testing if Docker is unavailable locally?
2. **Open Product Questions (from PRD §15)**:
   - Final product name and domain confirmation (confirm if working name "CertiVault" / `certivault.in` remains).
   - Email delivery default: Confirm link-only delivery vs attaching PDFs directly in v1.0 (recommended: link-only as specified in TRD §9 / ADR 7).
   - Free tier credits: 50 credits (default in PRD/TRD) vs 100 credits.
3. **Accounts Provisioning**:
   - Supabase project in Mumbai (`ap-south-1`)
   - Vercel project in Mumbai (`bom1`)
   - Resend API key & sending domain
   - Razorpay test mode credentials (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`)
   - Sentry DSN

---

### Exit gate — Work 0
- [x] `PROGRESS.md` exists with 10-line summary
- [x] Specification documents read completely
- [x] Repo-root `AGENTS.md` created
- [ ] Open questions answered or acknowledged by human
- [ ] Tool confirmation finalized (Docker / Supabase CLI)
- [ ] Account confirmation received
- [ ] Ready to start Work 1

---

### Next
- Receive human confirmation on open questions and Docker setup.
- Begin **Work 1: Repository, folder structure, and rules** (create Next.js skeleton, setup ESLint boundary rules, CI workflows, and test harnesses).

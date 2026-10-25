# ARCHITECTURE LOCK: CertiVault (v1.0 Frozen Foundations)

> **STATUS: FROZEN (Work 3)**  
> **RULE:** Any alteration to this file, locked data schemas, security invariants, or folder boundaries requires a formal **Change Request (CR)** in `/docs/change-requests/` approved by the human lead.

---

## 1. Locked Stack & Package Versions

| Package | Locked Version | Purpose |
|---|---|---|
| `next` | `^15.1.7` / `15.5.28` | React Server Components, App Router, Route Handlers |
| `react` / `react-dom` | `^19.0.0` | UI runtime |
| `typescript` | `^5.7.3` | Strict type checking (`strict: true`) |
| `tailwindcss` | `^3.4.17` | Utility CSS driven exclusively by design tokens |
| `@supabase/supabase-js` | `^2.49.1` | Base Postgres, Auth & Storage client |
| `@supabase/ssr` | `^0.5.2` | Cookie-based SSR session management for App Router |
| `zod` | `^3.24.2` | Universal schema validation (client and server) |
| `framer-motion` | `^12.4.7` | Apple-like spring physics & transitions |
| `vaul` | `^1.1.2` | Native-feeling mobile bottom sheets |
| `cmdk` | `^1.0.4` | Desktop ⌘K command palette |
| `lucide-react` | `^0.475.0` | Iconography |
| `papaparse` | `^5.5.2` | Client-side CSV parser |
| `xlsx` | `0.20.3` | Client-side Excel spreadsheet parser |
| `fuse.js` | `^7.1.0` | Client-side fuzzy header matching |
| `fflate` | `^0.8.2` | Streamed ZIP generation |
| `pdf-lib` | `^1.17.1` | Print-ready PDF merging and page copying |
| `razorpay` | `^2.9.5` | Indian payments (UPI, cards, netbanking) & webhooks |
| `resend` | `^4.1.2` | Transactional email delivery |
| `server-only` | `^0.0.1` | Server boundary barrier enforcement |
| `vitest` | `^3.0.7` | Unit and integration testing |

---

## 2. Locked Folder Structure & Boundary Rules

```
src/
  app/
    (marketing)/        landing, pricing, legal   (static / ISR)
    (auth)/             login, signup, onboarding
    (app)/app/          authenticated shell: mobile tab bar / desktop sidebar
    c/[publicId]/       public verification page (SSR, narrow RPC only)
    verify/             ID entry & camera QR scanner
    admin/              platform admin console
    api/                worker, webhooks, billing confirm, download
  components/ui/        design system primitives ONLY (no feature/server imports)
  features/             templates | issue | certificates | billing | team | org
  server/               pdf | jobs | email | payments | export | ai | auth | admin
  lib/                  supabase, schemas, tokens, utils
supabase/
  migrations/           append-only migrations (YYYYMMDDHHMMSS_name.sql)
  tests/                pgTAP security & RLS test suites
docs/
  change-requests/      CR records for locked architecture changes
```

### Dependency Direction Rules
1. `app` → `features` → `server` / `lib` → `(external libraries)`.
2. `src/components/ui` MUST NEVER import from `src/features`, `src/server`, or `src/app`.
3. `src/lib` MUST NEVER import from `src/features`, `src/server`, or `src/app`.
4. `src/server/*` is strictly server-only (`import 'server-only'`). Client components must NEVER import server modules or reference `SUPABASE_SERVICE_ROLE_KEY`.

---

## 3. Locked Data Contracts (TRD.md §3 Schema Matrix)

| Table | Status | Implementation Milestone | Notes |
|---|---|---|---|
| `orgs` | **Implemented** | Work 2 | Core organization profile, plan, credits, brand color |
| `org_members` | **Implemented** | Work 2 | User-to-org mapping with role enum (`owner`, `admin`, `issuer`, `viewer`) |
| `invitations` | **Implemented** | Work 2 | Pending team invites with unique `token_hash` index |
| `signatories` | **Implemented** | Work 2 | Names, titles, and signature asset paths |
| `platform_admins`| **Implemented** | Work 2 | Platform operator IDs |
| `audit_logs` | **Implemented** | Work 2 | Immutable compliance log entries |
| `templates` | Planned | Work 6 | pdfme layout schemas, background assets, required QR & ID fields |
| `batches` | Planned | Work 7 | Batch runs, state machine, delivery mode, progress counters |
| `certificates` | Planned | Work 7 | Public IDs, recipient data, status, PDF paths, sha256 hashes |
| `jobs` | Planned | Work 7 | Table-backed queue with `SKIP LOCKED` claiming |
| `credit_ledger` | Planned | Work 7 | Append-only ledger; single source of truth for credits |
| `payments` | Planned | Work 10 | Razorpay orders, payments, GST accounting |
| `invoices` | Planned | Work 10 | Sequential FY invoice records (`CV/2026-27/000001`) |
| `webhook_events`| Planned | Work 10 | Webhook deduplication store for idempotency |
| `verification_events` | Planned | Work 8 | Async lookup logs for verify metrics |
| `abuse_reports` | Planned | Work 8 | Public report submissions on certificates |
| `exports` | Planned | Work 9 | Bulk ZIP, merged PDF, and CSV download manifests |

---

## 4. Locked Security Invariants

1. **RLS on Every Table:** Every table created MUST enable RLS in the migration creating it, accompanied by automated pgTAP tests.
2. **Server Authority:** Every server action follows: `requireUser()` → `requireRole(orgId, [...])` → `validate (Zod)` → `act` → `audit()`. Never trust client-supplied org IDs or prices.
3. **Credit & Money Confinement:** Balances modify ONLY via `apply_credit_delta`. Direct updates to `credit_balance` are forbidden; negative balances are blocked by DB `CHECK (credit_balance >= 0)`.
4. **Idempotency Everywhere:** Razorpay webhooks (`webhook_events`), worker tasks (`generate_chunk`, `send_email_chunk`, `export`, `invoice`), and payment fulfillment MUST be strictly idempotent.
5. **Private Buckets & Signed URLs:** All storage buckets (`branding`, `templates`, `certificates`, `exports`, `invoices`) are private. Downloads use short-lived signed URLs (60s to 1h); public bucket access is prohibited.
6. **Public Verification Integrity:** `/c/[publicId]` calls only the narrow `get_public_certificate` RPC. Recipient emails and internal DB IDs must never be exposed.

---

## 5. Locked Module Interfaces (Signatures Enforced by Tests)

```ts
// 1. Email Delivery
sendEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}): Promise<{ id: string; delivered: boolean }>;

// 2. PDF Rendering & Public ID
newPublicId(date?: Date): string; // CV-YY-XXXXXXXX
renderCertificate(
  template: Record<string, unknown>,
  input: Record<string, string>,
  fonts?: Record<string, unknown>
): Promise<Buffer>;

// 3. Background Job Queue
enqueueJob(
  type: 'generate_chunk' | 'send_email_chunk' | 'export' | 'invoice' | 'cleanup',
  payload: Record<string, unknown>,
  runAt?: Date
): Promise<{ id: number }>;

claimJobs(limit?: number): Promise<JobRecord[]>;

// 4. Payments & Credits
createOrder(input: {
  productCode: 'pack_event' | 'pack_club' | 'pack_bulk' | 'plan_campus';
  orgId: string;
}): Promise<{ orderId: string; amountPaise: number; currency: 'INR'; keyId: string }>;

fulfillPayment(orderId: string): Promise<{ fulfilled: boolean }>;

applyCreditDelta(
  orgId: string,
  delta: number,
  reason: 'grant_free' | 'purchase' | 'plan_grant' | 'issue_reserve' | 'issue_refund' | 'adjustment' | 'expiry',
  refType?: string,
  refId?: string
): Promise<number>;

// 5. Bulk Export
buildExport(exportId: string): Promise<{
  exportId: string;
  kind: 'zip' | 'merged_pdf' | 'report_csv' | 'links_csv';
  parts: { path: string; sizeBytes: number; certificateCount: number }[];
  expiresAt: Date;
}>;

// 6. Private Storage
storageUpload(
  bucket: 'branding' | 'templates' | 'certificates' | 'exports' | 'invoices',
  path: string,
  data: Buffer | Uint8Array,
  options?: { contentType?: string; upsert?: boolean }
): Promise<{ path: string }>;

getSignedUrl(
  bucket: 'branding' | 'templates' | 'certificates' | 'exports' | 'invoices',
  path: string,
  expiresInSeconds?: number
): Promise<string>;
```

---

## 6. Locked ID Format & Verify URL Shape

- **Format:** `CV-{YY}-{8 chars}`
- **Alphabet:** Crockford Base32 (no `I`, `L`, `O`, `U`): `0123456789ABCDEFGHJKMNPQRSTVWXYZ`
- **Entropy:** 40 bits of cryptographically secure randomness via `crypto.randomBytes(5)`
- **Verify URL:** `https://{org.verify_subdomain || "verify.certivault.in"}/c/{publicId}`

---

## 7. Locked Job Types & Payloads

| Job Type | Payload Contract | Purpose |
|---|---|---|
| `generate_chunk` | `{ batch_id: string, certificate_ids: string[] }` (≤20 IDs) | Render PDFs, upload to storage, hash, mark issued, enqueue emails |
| `send_email_chunk`| `{ batch_id: string, certificate_ids: string[] }` (≤50 IDs) | Deliver emails with link-first CTA, update email_status |
| `export` | `{ export_id: string }` | Stream ZIP parts or merge PDF pages into exports bucket |
| `invoice` | `{ payment_id: string }` | Generate sequential FY invoice PDF, email receipt |
| `cleanup` | `{}` | Prune expired exports (7 days) and stale drafts |

---

## 8. Locked Route Map (PRD §6)

- **Marketing & Public:** `/`, `/pricing`, `/verify`, `/c/[publicId]`, `/terms`, `/privacy`, `/refunds`, `/contact`
- **Auth:** `/login`, `/auth/callback`, `/onboarding`
- **App:** `/app`, `/app/issue`, `/app/templates`, `/app/templates/new`, `/app/templates/[id]`, `/app/certificates`, `/app/certificates/batch/[id]`, `/app/certificates/[id]`, `/app/account`, `/app/account/billing`, `/app/account/team`, `/app/account/organization`, `/app/account/profile`
- **Internal:** `/admin`
- **API:** `/api/worker`, `/api/webhooks/razorpay`, `/api/billing/confirm`, `/api/download`, `/api/health`

---

## 9. Locked Design Tokens (PRD §11)

| Token Name | Light Value | Dark Value | Semantic Purpose |
|---|---|---|---|
| `--canvas` | `#F5F5F7` | `#000000` | App background |
| `--surface` | `#FFFFFF` | `#1C1C1E` | Card & sheet surfaces |
| `--surface-raised`| `#FFFFFF` | `#2C2C2E` | Popovers and modals |
| `--ink` | `#1D1D1F` | `#F5F5F7` | Primary text |
| `--ink-secondary` | `#6E6E73` | `#98989D` | Secondary labels & captions |
| `--hairline` | `rgba(60,60,67,0.12)` | `rgba(84,84,88,0.45)` | Subtle dividers |
| `--accent` | `#3355FF` | `#6B85FF` | Primary actions & interactive elements |
| `--seal` | `#1FA971` | `#34C98B` | Verified states ONLY (never repurposed) |
| `--warning` | `#E08A00` | `#FF9F0A` | Pending or review alerts |
| `--danger` | `#D92D20` | `#FF453A` | Revocation, destructive actions, errors |

---

## 10. Dependency Allowlist (AGENT_PLAN.md §5)

Only packages listed below are permitted in `package.json`. Adding any new package requires an approved Change Request.

`next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `react-hook-form`, `@hookform/resolvers`, `framer-motion`, `vaul`, `cmdk`, `lucide-react`, `@tanstack/react-query`, `@radix-ui/react-*`, `papaparse`, `xlsx`, `fuse.js`, `fflate`, `pdf-lib`, `@pdfme/generator`, `@pdfme/schemas`, `@pdfme/common`, `@pdfme/ui`, `razorpay`, `resend`, `@react-email/components`, `date-fns`, `nanoid`, `server-only`, `@upstash/redis`, `@upstash/ratelimit`, `@sentry/nextjs`, `vitest`, `@playwright/test`, `eslint`, `prettier`, `husky`, `lint-staged`, `supabase`, `axe-core`, `@types/*`

---

## 11. Architecture Decision Records (ADRs)

| # | Title | Status | Rationale | Revisit When |
|---|---|:---:|---|---|
| 1 | Modular Monolith in Next.js | **Accepted** | Maximum velocity for solo builder; zero linking friction on Vercel | Worker demands dedicated runtime |
| 2 | Supabase for DB/Auth/Storage/Realtime | **Accepted** | Single provider replaces 4 services; native multi-tenant RLS | Self-hosting or compliance mandates change |
| 3 | Postgres-backed Job Queue | **Accepted** | Free, transactional with business state, zero extra infra | >50 sustained jobs/sec |
| 4 | pdfme for Template Generation | **Accepted** | JSON templates, built-in vector QR code, visual editor embed | Custom rendering needs exceed library |
| 5 | Credits as Primary Billing Unit | **Accepted** | Simple metering fits clubs and colleges (1 credit = 1 cert) | Enterprise per-seat pricing requested |
| 6 | Razorpay Orders (One-time) | **Accepted** | Prepaid credit packs & annual Campus plans don't need mandates | Monthly recurring subscriptions added |
| 7 | Link-First Email Delivery | **Accepted** | Superior deliverability, lower egress costs, click tracking | Customer demand mandates attachments |
| 8 | Client-Side CSV/XLSX Parsing | **Accepted** | Eliminates server memory limits; instant client preview | File sizes exceed 10,000 rows |
| 9 | Uncached Verification Reads | **Accepted** | Instant reflection of revoked certificates (<30s) | High traffic demands edge caching |
| 10 | Zero LLMs in Core Issuing Path | **Accepted** | Deterministic reliability and predictable < ₹0.15 unit cost | Paid optional add-on covers model cost |
| 11 | Phone Quick-Edit / Desktop Editor | **Accepted** | Complex drag-positioning is poor UX on mobile; presets excel | Mobile tablet canvas redesign |
| 12 | Mumbai Region (`bom1` / `ap-south-1`) | **Accepted** | Sub-50ms latency for Indian users; domestic data residency | Global international expansion |

---

## 12. Change Request Process

After Work 3, any change to items in this document requires:
1. Drafting a Change Request file in `/docs/change-requests/CR-XXX-title.md` using the template from `AGENT_PLAN.md` §3.2.
2. Explicit human review and approval stamp in `PROGRESS.md`.
3. Updating this file only after approved.

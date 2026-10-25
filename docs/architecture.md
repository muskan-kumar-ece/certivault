# Architecture: CertiVault (working name)

How the pieces fit together. Pairs with `PRD.md` (what), `TRD.md` (specs), `implementation.md` (how to build).

---

## 1. Architecture at a glance

**Style:** a single Next.js application (modular monolith) on Vercel, backed by one Supabase project. Heavy work runs as small background jobs from a Postgres-backed queue. No always-on servers in v1.0.

**Design goals, in priority order:** trust and correctness → low cost → speed on phones → simplicity to build and operate by one person.

---

## 2. System context

```mermaid
flowchart LR
  subgraph People
    A[Issuer<br/>club lead / college staff]
    R[Recipient]
    V[Verifier<br/>recruiter / anyone]
    P[Platform admin]
  end

  subgraph CertiVault
    W[Next.js app on Vercel<br/>UI + API routes + worker]
    S[(Supabase<br/>Postgres, Auth,<br/>Storage, Realtime)]
  end

  A -->|design, import, issue, export, pay| W
  R -->|opens email link, downloads| W
  V -->|scans QR, verifies| W
  P -->|admin console| W
  W <--> S
  W -->|send email| E[Resend / Amazon SES]
  E -->|delivery webhooks| W
  W -->|orders| RZ[Razorpay]
  RZ -->|payment webhooks| W
  W -.->|optional, v1.1| AI[Small LLM API]
  W -.->|optional, v1.1| WA[WhatsApp provider]
```

---

## 3. Containers and responsibilities

```mermaid
flowchart TB
  subgraph Browser["Browser / PWA (phone, tablet, desktop)"]
    UI[React UI<br/>Tailwind + Radix + Framer Motion]
    PARSE[CSV/XLSX parsing<br/>client-side]
    EDIT[Template editor<br/>pdfme designer + custom panels]
  end

  subgraph Vercel["Next.js on Vercel (Mumbai)"]
    RSC[Server Components<br/>pages, verify page]
    SA[Server Actions<br/>issue, billing, team, settings]
    API[Route Handlers<br/>/api/worker, /api/webhooks/*, /api/billing/confirm,<br/>/api/download]
    LIB[Domain modules<br/>pdf, jobs, email, payments, export, ai]
  end

  subgraph Supabase["Supabase (Mumbai)"]
    AUTH[Auth]
    DB[(Postgres + RLS<br/>functions: credits, claim_jobs,<br/>public cert RPC)]
    ST[(Storage<br/>templates, certificates,<br/>exports, branding)]
    RT[Realtime<br/>batch progress]
    CRON[pg_cron + pg_net<br/>worker heartbeat]
  end

  UI --> RSC
  UI --> SA
  UI <-->|subscribe| RT
  PARSE --> SA
  EDIT --> SA
  RSC --> DB
  SA --> LIB
  API --> LIB
  LIB --> DB
  LIB --> ST
  UI --> AUTH
  CRON -->|every minute| API
```

| Container | Owns | Does not own |
|---|---|---|
| **Browser** | Interaction, parsing, preview, optimistic UI | Secrets, money, final validation |
| **Server Components / Actions** | Authorization checks, validation, orchestration | Long-running work |
| **Worker route** | PDF generation, email sends, exports, invoices | User-facing rendering |
| **Postgres** | Source of truth, RLS, credit atomicity, queue | Business logic that needs third-party calls |
| **Storage** | Files (private buckets) | Metadata |
| **Razorpay / Email provider** | Money movement / delivery | Our state (we reconcile via webhooks) |

---

## 4. Key sequences

### 4.1 Issue a batch

```mermaid
sequenceDiagram
  autonumber
  participant U as Issuer (browser)
  participant SA as Server Action
  participant DB as Postgres
  participant WK as Worker (/api/worker)
  participant ST as Storage
  participant EM as Email provider

  U->>SA: Issue batch (template, rows, delivery)
  SA->>DB: BEGIN: check role + limits
  SA->>DB: apply_credit_delta(-N) (fails if short)
  SA->>DB: batch=queued, insert generate_chunk jobs
  SA->>DB: COMMIT
  SA-->>U: Redirect to progress screen
  SA->>WK: kick (fire and forget)
  loop each chunk (about 20 certificates)
    WK->>DB: claim_jobs (SKIP LOCKED)
    WK->>WK: render PDFs (pdfme)
    WK->>ST: upload PDFs
    WK->>DB: mark issued, store sha256, bump counters
    WK->>DB: enqueue send_email_chunk
  end
  WK->>EM: send emails (chunks, throttled)
  EM-->>WK: webhooks (delivered / bounced)
  WK->>DB: update email_status
  DB-->>U: Realtime batch updates
  WK->>DB: batch=completed, notify issuer
```

### 4.2 Verify a certificate

```mermaid
sequenceDiagram
  autonumber
  participant V as Verifier (phone)
  participant N as Next.js /c/[id]
  participant RL as Rate limiter
  participant DB as Postgres

  V->>N: GET /c/CV-26-7K3M9QXT (QR scan)
  N->>RL: check IP bucket
  N->>DB: get_public_certificate(id) (RPC, no PII)
  DB-->>N: name, title, org, status, dates
  N-->>V: Verified page (seal, details, Download PDF)
  N->>DB: after(): insert verification_event
```

### 4.3 Buy credits

```mermaid
sequenceDiagram
  autonumber
  participant U as Issuer
  participant SA as Server Action
  participant RZ as Razorpay
  participant WH as /api/webhooks/razorpay
  participant DB as Postgres
  participant WK as Worker

  U->>SA: createOrder(pack)
  SA->>RZ: create order (amount incl. GST)
  SA->>DB: payments(status=created)
  SA-->>U: order_id + key_id
  U->>RZ: Checkout (UPI / card)
  RZ-->>U: payment_id + signature
  U->>SA: confirm(order, payment, signature)
  SA->>DB: fulfill_payment (idempotent)
  RZ-->>WH: payment.captured (signed)
  WH->>DB: fulfill_payment (no-op if done)
  DB->>DB: grant credits, mark paid
  DB->>WK: invoice job
  WK-->>U: receipt email with GST invoice
```

### 4.4 Bulk export

```mermaid
sequenceDiagram
  autonumber
  participant U as Issuer
  participant SA as Server Action
  participant DB as Postgres
  participant WK as Worker
  participant ST as Storage

  U->>SA: Export (kind, filter)
  SA->>DB: insert exports(queued) + export job
  SA-->>U: "We'll email you when it's ready"
  WK->>DB: claim export job
  WK->>ST: stream PDFs → ZIP parts (or merge / CSV)
  WK->>ST: save to exports bucket
  WK->>DB: exports=ready, expires in 7 days
  WK-->>U: email + in-app notice (signed links)
```

---

## 5. Data and storage architecture

```mermaid
erDiagram
  ORGS ||--o{ ORG_MEMBERS : has
  ORGS ||--o{ TEMPLATES : owns
  ORGS ||--o{ BATCHES : runs
  ORGS ||--o{ CERTIFICATES : issues
  ORGS ||--o{ CREDIT_LEDGER : accounts
  ORGS ||--o{ PAYMENTS : pays
  BATCHES ||--o{ CERTIFICATES : contains
  TEMPLATES ||--o{ BATCHES : used_by
  PAYMENTS ||--o| INVOICES : produces
  BATCHES ||--o{ EXPORTS : exported_as
  CERTIFICATES ||--o{ VERIFICATION_EVENTS : verified_by
```

**Storage buckets (all private)**

| Bucket | Path | Access |
|---|---|---|
| `branding` | `{org_id}/logo.*`, `signatures/*` | Org members; also read by worker when rendering |
| `templates` | `{org_id}/{template_id}/bg.*`, `thumb.png` | Org members |
| `certificates` | `{org_id}/{batch_id}/{public_id}.pdf`, `superseded/` | Signed URLs only, issued by server |
| `exports` | `{org_id}/{export_id}/part-N.*` | Signed URLs, 7-day expiry |
| `invoices` | `{org_id}/{FY}/{number}.pdf` | Org owner/admin |

**Consistency rules**
- DB is truth; files are derived. A certificate is `issued` only after its PDF exists and its hash is stored.
- Credit balance changes only via `apply_credit_delta`, inside the same transaction as the event that causes them.
- Webhooks and jobs are at-least-once, so every handler is idempotent.

---

## 6. Frontend architecture

```
src/
  app/
    (marketing)/        landing, pricing, legal   (static / ISR)
    (auth)/             login, signup, onboarding
    (app)/app/          authenticated shell: tab bar (mobile) / sidebar (desktop)
      page.tsx          Home
      issue/            wizard (step routes)
      templates/        library + editor
      certificates/     registry, batch detail, certificate detail
      account/          billing, team, organization, profile
    c/[publicId]/       public verification
    verify/             ID entry + QR scan
    admin/              platform admin
    api/                worker, webhooks, billing confirm, download
  components/ui/        design system (buttons, sheets, tab bar, ...)
  features/             templates | issue | certificates | billing | team | org
  server/               pdf | jobs | email | payments | export | ai | auth
  lib/                  supabase clients, zod schemas, utils, constants
```

**Principles**
- Server Components fetch data; client components only where interaction needs it.
- One design-system folder; no feature builds its own button or sheet.
- Wizard steps are routes with drafts saved server-side, so back/forward and app restarts work.
- Adaptive shell: the same routes render a tab bar + sheets on narrow screens and a sidebar + dialogs on wide screens (CSS container/media queries, one component tree).

---

## 7. Security architecture

```mermaid
flowchart LR
  B[Browser<br/>anon key + user JWT] -->|RLS-checked| DB[(Postgres)]
  B -->|server actions| S[Server<br/>re-checks role]
  S -->|service role, server only| DB
  WH[Webhooks] -->|signature verified| S
  PUB[Public verifier] -->|narrow RPC only| DB
```

**Trust boundaries:** (1) browser ↔ server, (2) server ↔ database (service role), (3) public ↔ verification RPC, (4) third-party webhooks ↔ server. Each boundary has an explicit check: JWT + role check, RLS, minimal RPC output, signature verification.

**Threats and controls**

| Threat | Control |
|---|---|
| Cross-organization data access | RLS on all tables; pgTAP tests per policy |
| Fake certificates / impersonating a college | Verified-issuer badge via manual check; org name display; abuse reports; suspension |
| Enumerating certificate IDs | 40-bit random IDs, rate limiting, no list endpoints |
| Credit fraud / double-spend | Atomic SQL function, CHECK constraint, append-only ledger |
| Forged payment webhook | Signature on raw body, event dedupe |
| Malicious uploads | Type/size allow-list, re-encode, private buckets |
| CSV injection | Escaping on export |
| Email abuse (spam via bulk send) | Verified email required, free caps, review of large new-org sends, suppression list |
| Data leak via verify page | RPC returns only public fields; no emails |

---

## 8. Scalability and failure handling

**Capacity (v1.0 targets):** 100 organizations, 50,000 certificates per month, 5,000 verifications per day on the planned tiers. Postgres, storage and Vercel handle this comfortably; the bottleneck is PDF generation throughput.

**Scaling path (only when metrics demand it)**
1. Increase worker concurrency and chunk parallelism.
2. Move PDF generation and exports to a small always-on worker (a ₹500-1,500/month VPS or container) that polls the same `jobs` table. Nothing else changes.
3. Move PDF storage to Cloudflare R2 behind the existing storage interface to eliminate egress cost.
4. Add read replicas or caching for verification if traffic grows.

**Failure modes**

| Failure | Behavior |
|---|---|
| Worker invocation times out mid-chunk | Jobs go stale after 5 min, are re-queued; idempotent generation prevents duplicates |
| Email provider down | Jobs back off and retry; admin flag switches provider |
| Razorpay webhook delayed | Client confirm path fulfills first; webhook is a no-op later |
| Webhook delivered twice | `webhook_events` + idempotent fulfillment |
| Single certificate fails | Marked `failed` with reason, credit refunded, "Retry failed" available |
| Verification DB hiccup | Friendly retry state; never shows "invalid" on a server error |
| Bad template (text overflow) | Pre-issue stress preview; auto-shrink; failure isolated per certificate |

---

## 9. Environments and delivery

```mermaid
flowchart LR
  DEV[Local<br/>Supabase CLI + Next dev] --> PR[Pull request<br/>CI: lint, types, unit, DB tests, E2E]
  PR --> STG[Staging<br/>Vercel preview + Supabase staging<br/>Razorpay test mode]
  STG --> PROD[Production<br/>Vercel + Supabase<br/>Razorpay live]
```

- Migrations are SQL files applied by CI (staging first, then production after approval).
- Feature flags (env/DB) gate WhatsApp, AI, approvals, custom domains.
- Observability: Sentry (errors), structured logs, queue-depth and payment-lag alerts, uptime check on `/c/health` and `/api/health`.

---

## 10. Architecture decision records (ADRs)

| # | Decision | Why | Revisit when |
|---|---|---|---|
| 1 | Modular monolith in one Next.js app | Fastest for a solo builder; fewer moving parts | Team grows or worker needs different runtime |
| 2 | Supabase for DB/Auth/Storage/Realtime | One vendor replaces four services; RLS gives strong multi-tenant isolation | Cost or compliance requires self-hosting |
| 3 | Postgres-backed job queue, not a queue service | Free, transactional with business data, simple to debug | > 50 jobs/sec sustained |
| 4 | pdfme for templates and generation | JSON templates, QR support, designer UI exists | Template needs exceed it; fallback pdf-lib |
| 5 | Credits as the billing primitive | Simple to sell and meter; fits clubs and colleges | Per-seat enterprise pricing demands more |
| 6 | Razorpay Orders (one-time) instead of Subscriptions | Annual prepay and packs don't need recurring mandates | Monthly plans are introduced |
| 7 | Link-first email delivery (no attachments by default) | Better deliverability, lower cost, trackable | Customers demand attachments → option in v1.1 |
| 8 | Client-side parsing and OCR | Cuts server cost and latency | Files exceed browser memory (> 10k rows) |
| 9 | Live (uncached) verification reads | Revocation must reflect instantly | Traffic makes caching necessary → tag-based invalidation |
| 10 | No LLM in the core path | Predictable cost and reliability | A feature clearly pays for itself |
| 11 | Phone gets preset quick-edit, full editor on tablet/desktop | Precision layout on a phone is poor UX and costly to build | Usage data shows demand |
| 12 | Mumbai region for compute and DB | Latency and data-residency preference | Expanding beyond India |

---

## 11. What is intentionally left out

Native apps, SSO/SAML, blockchain anchoring, LMS plug-ins, multi-region, microservices, a separate backend service, custom auth, and any AI in issuance. Each can be added later without reworking the core above.

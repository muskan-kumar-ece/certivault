# TRD: CertiVault (working name)

Technical requirements for v1.0. Pairs with `PRD.md`, `architecture.md`, `implementation.md`.

> Library versions and prices change often. Treat names here as the plan, and confirm current versions, limits and pricing at install time.

---

## 1. Technology choices

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router), TypeScript** | One codebase for marketing, app, API routes, SSR for verify pages |
| UI | Tailwind CSS + **Radix UI primitives** + own components; **Framer Motion** (springs); **vaul** (bottom sheets); **cmdk** (command palette); Lucide icons | Accessible primitives with full control over the Apple-like look |
| Forms/validation | React Hook Form + **Zod** (shared schemas client/server) | Single source of truth for validation |
| Data fetching | Server Components + Server Actions; **TanStack Query** for live lists | Less client JS, optimistic updates where needed |
| Backend | **Supabase**: Postgres, Auth, Storage, Realtime, RLS, `pg_cron`, `pg_net` | Replaces most custom backend work |
| PDF engine | **pdfme** (`@pdfme/generator`, `@pdfme/schemas`, optional `@pdfme/ui` designer) with **pdf-lib** for merge/page-copy | Template JSON + bulk generation, QR plugin built in |
| QR | pdfme `qrcode` schema (fallback: `qrcode` npm) | Vector QR inside PDF |
| Spreadsheet parsing | **Papa Parse** (CSV), **SheetJS** (XLSX), client-side first | Parsing on the client saves server cost |
| ZIP | **fflate** or `archiver` streaming | Streamed, low memory |
| Email | **Resend** to start, **Amazon SES** at scale (provider interface) | Cheap, good deliverability |
| Payments | **Razorpay** (Orders + Checkout + Webhooks) | UPI/cards/netbanking, INR, India-standard |
| Rate limiting | Upstash Redis (free tier) or Postgres token bucket | Protect verify, auth, uploads |
| Errors/analytics | Sentry (free), PostHog or Plausible, uptime monitor | Low cost visibility |
| Hosting | **Vercel** (region `bom1`, Mumbai) + **Supabase** (`ap-south-1`, Mumbai) | Low latency to India |
| Optional AI | A small model (Claude Haiku class) behind a feature flag; **no LLM in the core path** | Cost control |
| Testing | Vitest, Playwright (mobile + desktop), pgTAP for RLS | Cover the risky parts |

**Hosting note:** Vercel's free (Hobby) plan is non-commercial. Plan to move to a paid plan before accepting payments. Alternative: self-host Next.js on a small VPS with Docker.

---

## 2. System constraints that shape the design

1. **Serverless time limits.** A long batch can't run in one request. Work is split into small **jobs** (about 20 certificates each) processed by a time-boxed worker endpoint.
2. **Cost.** No always-on servers in v1.0. A VPS worker is an upgrade path, not a requirement.
3. **Trust.** Verification must be fast, correct (revocation reflected within 30 s), and leak no private data.
4. **Money.** Credits and payments must be atomic, idempotent and auditable.
5. **Phones.** Heavy work (parsing, preview) happens client-side where possible; payloads stay small.

---

## 3. Data model (Postgres)

```sql
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type org_role as enum ('owner','admin','issuer','viewer');

create table orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  kind text not null default 'other' check (kind in ('club','college','university','other')),
  logo_path text,
  brand_color text default '#3355FF',
  verified boolean not null default false,
  plan text not null default 'free' check (plan in ('free','campus','university')),
  plan_expires_at timestamptz,
  credit_balance int not null default 0 check (credit_balance >= 0),
  verify_subdomain text unique,
  gstin text,
  billing jsonb not null default '{}',          -- address, state, contact
  suspended_at timestamptz,
  created_at timestamptz not null default now()
);

create table org_members (
  org_id uuid references orgs on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role org_role not null,
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create table invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs on delete cascade,
  email text not null,
  role org_role not null,
  token_hash text not null,
  expires_at timestamptz not null,
  accepted_at timestamptz
);

create table signatories (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs on delete cascade,
  name text not null, title text, signature_path text
);

create table templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs on delete cascade,        -- null = platform preset
  name text not null,
  page_size text not null default 'A4-landscape',
  schema jsonb not null,                                 -- pdfme template (schemas + basePdf ref)
  background_path text,
  thumbnail_path text,
  field_keys text[] not null default '{}',               -- e.g. {name,course,date}
  archived_at timestamptz,
  created_by uuid references auth.users,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table batches (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  template_id uuid not null references templates,
  name text not null,
  status text not null default 'draft' check (status in
    ('draft','queued','generating','delivering','completed','completed_with_errors','failed','canceled')),
  total int not null default 0,
  generated int not null default 0,
  failed int not null default 0,
  delivered int not null default 0,
  delivery_mode text not null default 'email' check (delivery_mode in ('email','none')),
  email_subject text, email_body text,
  credits_reserved int not null default 0,
  created_by uuid references auth.users,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table certificates (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,                        -- e.g. CV-26-7K3M9QXT
  org_id uuid not null references orgs on delete cascade,
  batch_id uuid references batches on delete set null,
  template_id uuid references templates,
  recipient_name text not null,
  recipient_email text,
  data jsonb not null default '{}',                      -- course, date, grade, custom fields
  status text not null default 'pending' check (status in ('pending','issued','failed','revoked')),
  pdf_path text,
  pdf_sha256 text,
  error text,
  issued_at timestamptz,
  revoked_at timestamptz,
  revoked_reason text,
  show_revoked_reason boolean not null default false,
  email_status text not null default 'none' check (email_status in
    ('none','queued','sent','delivered','bounced','complained','failed')),
  email_sent_at timestamptz,
  download_count int not null default 0,
  verify_count int not null default 0,
  created_at timestamptz not null default now()
);
create index on certificates (org_id, created_at desc);
create index on certificates (batch_id, status);
create index certificates_name_trgm on certificates using gin (recipient_name gin_trgm_ops);
create index certificates_email_idx on certificates (org_id, lower(recipient_email));

create table jobs (
  id bigserial primary key,
  type text not null,                                    -- generate_chunk | send_email_chunk | export | invoice
  payload jsonb not null,
  status text not null default 'queued' check (status in ('queued','running','done','failed')),
  run_at timestamptz not null default now(),
  attempts int not null default 0,
  max_attempts int not null default 5,
  locked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);
create index on jobs (status, run_at);

create table exports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  batch_id uuid references batches,
  kind text not null check (kind in ('zip','merged_pdf','report_csv','links_csv')),
  filter jsonb not null default '{}',
  status text not null default 'queued' check (status in ('queued','running','ready','failed','expired')),
  parts jsonb not null default '[]',                     -- [{path,size,count}]
  expires_at timestamptz,
  requested_by uuid references auth.users,
  created_at timestamptz not null default now()
);

create table credit_ledger (                              -- append-only
  id bigserial primary key,
  org_id uuid not null references orgs on delete cascade,
  delta int not null,
  reason text not null check (reason in
    ('grant_free','purchase','plan_grant','issue_reserve','issue_refund','adjustment','expiry')),
  ref_type text, ref_id text,
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  product_code text not null,                             -- pack_event | pack_club | pack_bulk | plan_campus
  razorpay_order_id text unique not null,
  razorpay_payment_id text unique,
  amount_paise int not null,                              -- total incl. GST
  gst_paise int not null default 0,
  status text not null default 'created' check (status in ('created','paid','failed','refunded')),
  fulfilled_at timestamptz,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  payment_id uuid references payments,
  number text unique not null,                            -- CV/2026-27/000123
  pdf_path text, issued_at timestamptz not null default now()
);

create table webhook_events (id text primary key, source text not null, received_at timestamptz default now());
create table audit_logs (
  id bigserial primary key, org_id uuid, actor_id uuid, action text not null,
  entity_type text, entity_id text, meta jsonb default '{}', created_at timestamptz default now()
);
create table verification_events (id bigserial primary key, certificate_id uuid, created_at timestamptz default now());
create table abuse_reports (id uuid primary key default gen_random_uuid(), certificate_id uuid, reason text, contact text, created_at timestamptz default now());
create table platform_admins (user_id uuid primary key references auth.users);
```

**Notes**
- Presets are templates with `org_id is null`, readable by everyone, writable by nobody (except admins).
- `credit_balance` is a denormalized cache updated only through `apply_credit_delta`; the ledger is the source of truth.
- Keep `recipient_email` out of every public query path.

---

## 4. Security and row-level security

Principles: **RLS on every table**; the browser uses only the anon key + the user's JWT; the **service role** key exists only in server code (worker, webhooks, admin).

```sql
create function is_member(_org uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from org_members where org_id = _org and user_id = auth.uid())
$$;

create function has_role(_org uuid, _roles org_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from org_members
                 where org_id = _org and user_id = auth.uid() and role = any(_roles))
$$;

alter table certificates enable row level security;
create policy cert_read   on certificates for select using (is_member(org_id));
create policy cert_insert on certificates for insert with check (has_role(org_id, '{owner,admin,issuer}'));
create policy cert_update on certificates for update using (has_role(org_id, '{owner,admin}'));
-- no delete policy: certificates are never hard-deleted by users

alter table templates enable row level security;
create policy tpl_read  on templates for select using (org_id is null or is_member(org_id));
create policy tpl_write on templates for all
  using (has_role(org_id, '{owner,admin,issuer}')) with check (has_role(org_id, '{owner,admin,issuer}'));
```

**Money functions are not callable by users:**

```sql
create function apply_credit_delta(_org uuid, _delta int, _reason text, _ref_type text, _ref_id text)
returns int language plpgsql security definer set search_path = public as $$
declare new_bal int;
begin
  update orgs set credit_balance = credit_balance + _delta where id = _org returning credit_balance into new_bal;
  insert into credit_ledger(org_id, delta, reason, ref_type, ref_id) values (_org,_delta,_reason,_ref_type,_ref_id);
  return new_bal;                      -- CHECK (credit_balance >= 0) aborts the whole transaction if insufficient
end $$;
revoke all on function apply_credit_delta from public, anon, authenticated;
grant execute on function apply_credit_delta to service_role;
```

**Public verification uses a narrow RPC, not table access:**

```sql
create function get_public_certificate(_public_id text)
returns table (public_id text, recipient_name text, title text, issued_at timestamptz,
               status text, revoked_at timestamptz, revoked_reason text,
               org_name text, org_verified boolean, org_logo text, brand_color text)
language sql stable security definer set search_path = public as $$
  select c.public_id, c.recipient_name, coalesce(c.data->>'title', c.data->>'course'),
         c.issued_at, c.status, c.revoked_at,
         case when c.show_revoked_reason then c.revoked_reason end,
         o.name, o.verified, o.logo_path, o.brand_color
  from certificates c join orgs o on o.id = c.org_id
  where c.public_id = _public_id and c.status in ('issued','revoked')
$$;
grant execute on function get_public_certificate to anon, authenticated;
```

**Other controls**
- **Auth:** email OTP + Google; session cookies via `@supabase/ssr`; server actions re-check membership and role (RLS is the backstop, not the only check).
- **Uploads:** size/type allow-list (PNG, JPG, PDF ≤ 5 MB), re-encode images, strip metadata, never trust file names; CSV/XLSX capped by rows and bytes.
- **CSV injection:** when exporting CSV, prefix cells starting with `= + - @` with `'`.
- **Storage:** all buckets private; downloads through short-lived signed URLs (60 s to 1 h); exports expire after 7 days.
- **Webhooks:** verify signature on the raw body, constant-time compare, store `webhook_events.id` for idempotency.
- **Rate limits:** verify (60/min/IP), auth (5/min/email), uploads (20/hour/user), test certificates (5/day/org).
- **Headers:** strict CSP, `frame-ancestors 'none'` (except the verify page if embedding is wanted later), HSTS, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Secrets:** only in environment variables; `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `WORKER_SECRET`, `RESEND_API_KEY` are never exposed to the client.
- **Abuse controls:** unverified-email orgs cannot email; free-tier orgs capped at 50 total certificates; bulk sends over 500 on a brand-new org flagged for review; org suspension kills worker output and verification still works for already-issued certificates unless revoked.
- **Privacy (DPDP-aligned):** collect only name, email, and fields the issuer maps; privacy policy and DPA; per-org retention setting; deletion/anonymization on request (anonymize recipient name on a certificate only via issuer-approved correction to preserve verifiability).

---

## 5. Certificate identity and integrity

- **Public ID:** `CV-{YY}-{8 chars}` using Crockford Base32 (no I, L, O, U) from 40 random bits via `crypto.randomBytes`. Collision handled by unique constraint + retry. Rate-limited lookups make guessing impractical.
- **Verify URL:** `https://{org.verify_subdomain or "verify.certivault.in"}/c/{public_id}`. The QR encodes exactly this URL.
- **Fingerprint:** `pdf_sha256` computed after generation and stored; shown on the verify page ("Document fingerprint"). v1.1 lets a verifier drop a PDF; hashing happens in the browser.
- **Revocation:** sets `status='revoked'`, `revoked_at`; the verify page reads live data (no long cache) so the change shows within seconds.
- **Corrections:** same `public_id`, regenerated PDF, `audit_logs` entry, old PDF kept in a `superseded/` storage path.

---

## 6. Jobs and worker design

**Why:** serverless functions are time-limited; a table-backed queue is free and reliable.

- `jobs` table with `FOR UPDATE SKIP LOCKED` claiming.
- **Worker endpoint:** `POST /api/worker` (Bearer `WORKER_SECRET`). Claims up to N jobs, processes with a **time box (~45 s)**, then if jobs remain, **invokes itself** again. `export const maxDuration` set to the plan's maximum.
- **Triggers:** (a) immediate fire-and-forget call after a batch is queued, (b) `pg_cron` every minute using `pg_net` to call the worker as a safety net, (c) stale-lock recovery.
- **Retries:** exponential backoff (`run_at = now() + 2^attempts * 30s`), `max_attempts = 5`, then `failed` with `last_error`.
- **Idempotency:** every job is safe to run twice (certificates are generated only if `status='pending'`; storage uploads use deterministic paths with `upsert`).

```sql
create function claim_jobs(_limit int) returns setof jobs language plpgsql as $$
begin
  update jobs set status='queued', locked_at=null
   where status='running' and locked_at < now() - interval '5 minutes';   -- recover stale
  return query
  update jobs set status='running', locked_at=now(), attempts=attempts+1
   where id in (select id from jobs where status='queued' and run_at <= now()
                order by run_at for update skip locked limit _limit)
  returning *;
end $$;
```

**Job types**

| Type | Payload | Does |
|---|---|---|
| `generate_chunk` | `{batch_id, certificate_ids[≤20]}` | Generate PDFs, upload, hash, mark `issued`, update batch counters, refund credits on failure, enqueue email jobs |
| `send_email_chunk` | `{batch_id, certificate_ids[≤50]}` | Send via provider, set `email_status` |
| `export` | `{export_id}` | Build ZIP / merged PDF / CSV into `exports` bucket, email when ready |
| `invoice` | `{payment_id}` | Generate GST invoice PDF, email receipt |
| `cleanup` | `{}` | Expire exports, old drafts, stale tokens (daily via cron) |

---

## 7. Issuing pipeline (spec)

1. **Draft:** wizard stores a `batches` row (`draft`) and recipient rows in `certificates` (`pending`) as the user progresses (client sends parsed JSON in chunks of 500; server validates with Zod).
2. **Issue action (server action):** inside one SQL transaction: verify role and plan limits, `apply_credit_delta(org, -N, 'issue_reserve', 'batch', id)`, set batch `queued`, insert `generate_chunk` jobs. If credits are insufficient, the CHECK constraint aborts and the user sees "Add credits."
3. **Generation:** for each certificate: build `inputs` (name, fields, QR URL, ID), call pdfme `generate`, upload to `certificates/{org_id}/{batch_id}/{public_id}.pdf`, compute SHA-256, mark `issued`. Failure → mark `failed`, `apply_credit_delta(+1, 'issue_refund')`.
4. **Progress:** batch counters update after each chunk; the client subscribes to the batch row via Supabase Realtime (fallback: poll every 3 s).
5. **Delivery:** when a chunk finishes and `delivery_mode='email'`, enqueue `send_email_chunk`. Provider webhooks update `email_status`.
6. **Completion:** when `generated + failed = total`, set final status, email the issuer.

**Performance targets (to be validated in week 2 benchmark):** about 300-500 ms per certificate per worker, 3-4 in parallel → roughly 1,000 certificates in 5-8 minutes. Fonts are subset-embedded to keep PDFs about 60-150 KB.

**PDF generation sketch** (verify against current pdfme docs):

```ts
import { generate } from '@pdfme/generator';
import { text, image, qrcode } from '@pdfme/schemas';

export async function renderCertificate(template: Template, input: Record<string,string>, fonts: Font) {
  const pdf = await generate({
    template,
    inputs: [input],               // { name, course, date, id, qr: verifyUrl, ... }
    plugins: { text, image, qrcode },
    options: { font: fonts },      // Inter, Playfair, Noto Sans Devanagari, Noto Sans Telugu...
  });
  return Buffer.from(pdf);
}
```

---

## 8. Bulk export (spec)

| Export | Method | Limits |
|---|---|---|
| **ZIP of PDFs** | Stream each PDF from storage into a ZIP, using `{name}_{id}.pdf` pattern (sanitized, unique); write parts to `exports/` | Auto-split at 1,000 PDFs or 500 MB per part |
| **Merged PDF** | `pdf-lib` copy pages in chunks (memory-safe), print-ready, ordered by name | Split at 300 certificates per file |
| **Report CSV** | Query + stream: public_id, name, email, status, issued date, email status, verify URL | No practical limit |
| **Share links CSV** | name, email, verify URL (for custom mail merge) | No practical limit |

- Filters: all, selected IDs, failed only, by status/date.
- Small exports (≤ 50 files or CSV) run inline; larger ones run as `export` jobs and notify.
- Parts are served through signed URLs; `exports.expires_at = now() + 7 days`; `cleanup` job deletes files.
- Exports are logged in `audit_logs` (who exported what).

---

## 9. Email

- **Provider interface:** `sendEmail({to, subject, html, text, replyTo, headers})` with Resend and SES implementations selected by env.
- **From:** `{Org name} via CertiVault <certificates@mail.certivault.in>`; `Reply-To` = org contact.
- **DNS:** SPF, DKIM, DMARC on the sending domain; warm up gradually; separate transactional stream from any future marketing.
- **Webhooks:** delivered, bounced, complained → update `certificates.email_status`; hard bounces never retried; complaint → suppress address.
- **Suppression list:** table `email_suppressions(email)` checked before sending.
- **Throttling:** per-provider rate limits respected via chunk size and backoff.
- **Templates:** React Email (renders to HTML + text).

---

## 10. Payments and billing

**Products (config, not hard-coded):** `pack_event`, `pack_club`, `pack_bulk`, `plan_campus`, plus custom manual grants.

**Flow**
1. User picks a product → server action `createOrder(product)`: loads price, computes GST from org billing state, creates Razorpay order (amount in paise, `receipt = payments.id`), inserts `payments(status='created')`.
2. Client opens Razorpay Checkout with `order_id` and public `key_id`.
3. On success the client posts `{order_id, payment_id, signature}` to `/api/billing/confirm`; server verifies `HMAC_SHA256(order_id|payment_id, key_secret)` and calls `fulfill_payment`.
4. **Webhook** `/api/webhooks/razorpay` (events `payment.captured` / `order.paid`, `payment.failed`, `refund.processed`) verifies `X-Razorpay-Signature` over the **raw** body with the webhook secret; dedupes by event id; calls the same `fulfill_payment`.
5. `fulfill_payment(order_id)` is **idempotent**: a single transaction locks the payment row, returns if already `fulfilled_at`, else marks `paid`, grants credits/plan via `apply_credit_delta` (`purchase`/`plan_grant`), and enqueues an `invoice` job.

```ts
// webhook signature check (raw body!)
const raw = await req.text();
const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!).update(raw).digest('hex');
const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(req.headers.get('x-razorpay-signature') ?? ''));
if (!ok) return new Response('invalid', { status: 400 });
```

**Tax and invoices**
- Prices stored ex-GST; GST 18%. Intra-state (billing state = business state): CGST 9% + SGST 9%; inter-state: IGST 18%.
- Invoice numbers sequential per financial year (`CV/2026-27/000001`) generated in a DB function with a counter row to avoid gaps/duplicates.
- Invoice PDF produced with the same PDF engine; includes GSTIN (if provided), SAC code for the service (confirm with a CA), place of supply.
- **Confirm GST registration obligations with a CA before taking payments.**

**Credits**
- Packs credit `credits` immediately; each purchase records an expiry (12 months) tracked in ledger `ref` metadata or a `credit_lots` table (v1.0 may track expiry coarsely: oldest lot first via a lots table; recommended).
- Campus plan: grants 10,000 credits and sets `plan='campus'`, `plan_expires_at = +1 year`; renewal reminder emails at 30/7/1 days.
- Refunds handled manually via Razorpay dashboard plus admin adjustment (negative `adjustment` entry), then webhook updates status.

---

## 11. Verification page (performance and caching)

- Server-rendered route `/c/[publicId]` calling `get_public_certificate` through the anon client in the Mumbai region.
- Cache policy: `Cache-Control: no-store` for status correctness, but keep the query single-row and indexed (target < 50 ms DB, < 300 ms TTFB). Static assets and logo cached aggressively.
- `verification_events` row inserted after the response (`after()`), never blocking render.
- PDF download: route handler validates the ID, rate-limits, returns a 60-second signed URL redirect; increments `download_count`.
- Bot protection: rate limiting + optional Cloudflare Turnstile when abuse is detected.

---

## 12. Optional AI features (off by default)

| Feature | Approach | Cost control |
|---|---|---|
| **Smart Import** (v1.1) | Deterministic fuzzy matching first (Fuse.js on normalized headers). Only unresolved columns go to a small model with a strict JSON schema, first 5 sample rows only | Feature flag, per-org daily cap, cache by header hash, `max_tokens` small; expected well under ₹0.10 per import |
| **Template placement assist** (v1.1) | Client-side OCR (tesseract.js) to find text blocks on an uploaded design | Runs in the browser, zero server cost |
| **Copy help** (email subject/body) | Presets and variables, no model | Free |

No recipient personal data is sent to a model beyond header names and a few redacted sample values; this is stated in the Privacy Policy.

---

## 13. Frontend technical requirements

- **Rendering:** marketing and verify pages as Server Components; app shell is a client layout with Server Component pages. Keep client JS for the app route group under about 200 KB gzip initial.
- **PWA:** manifest, icons, `display: standalone`, theme color per color scheme, offline fallback page; install prompt after first successful issue. (Push notifications deferred.)
- **Touch and layout:** `viewport-fit=cover`, safe-area padding, `100dvh`, `touch-action: manipulation`, 16-px minimum input text, `overscroll-behavior` handled in sheets.
- **Navigation:** route groups `(marketing)`, `(auth)`, `(app)`; parallel/intercepting routes for sheets where useful; View Transitions API via a small wrapper with fallback.
- **Performance budgets:** LCP ≤ 2.0 s and INP ≤ 200 ms on a mid-range Android over 4G; images through `next/image`; fonts via `next/font` with `display: swap`; lists virtualized above 200 rows.
- **State:** server is the source of truth; local state only for UI; wizard drafts persisted in DB.
- **i18n-ready:** strings through a message layer even if only English ships.

---

## 14. Observability and operations

- **Logging:** structured JSON logs with `org_id`, `batch_id`, `job_id`; Sentry for errors with PII scrubbing.
- **Metrics/alerts:** job queue depth and age, failure rate per job type, email bounce rate, payment fulfillment lag, verify p95. Alert on queue age > 10 min and any `fulfill_payment` error.
- **Backups:** Supabase daily backups (paid plan); enable point-in-time recovery once revenue justifies; weekly logical dump of key tables to separate storage.
- **Migrations:** Supabase CLI, SQL files in repo, applied in CI to staging then production.
- **Environments:** `local` (Supabase CLI), `staging`, `production`; Razorpay test vs live keys separated.
- **Runbook items:** stuck batch (re-queue), failed webhook (replay), email provider outage (switch provider flag), accidental revoke (restore via audit log).

---

## 15. Cost model (approximate; verify current pricing)

| Item | Monthly (early) |
|---|---|
| Supabase Pro | about $25 (≈ ₹2,100) |
| Vercel Pro (1 seat) | about $20 (≈ ₹1,700) |
| Domain + email domain | ≈ ₹150 |
| Resend free tier, then SES | ₹0 to ≈ ₹1,700 |
| Sentry, PostHog/Plausible, uptime | ₹0 on free tiers |
| **Total fixed** | **about ₹4,000-6,000** |

Variable per certificate: storage + bandwidth + email + gateway fee ≈ ₹0.10-0.15. At ₹1.20-₹2.00 per credit, gross margin above 90%. Break-even is about 2-3 Campus plans, or about 3,000-4,000 credits sold per month at pack prices.

---

## 16. Test strategy

| Level | Tooling | Must cover |
|---|---|---|
| Unit | Vitest | ID generator, CSV parsing/validation, GST math, credit math, filename sanitizer |
| DB | pgTAP + Supabase local | Every RLS policy (member vs non-member vs anon), `apply_credit_delta` never goes negative, `claim_jobs` concurrency |
| Integration | Vitest + local Supabase | Issue pipeline end to end, webhook idempotency (send twice), export builders |
| E2E | Playwright (iPhone 14 + Pixel + desktop) | Sign up → template → import → issue → verify → export → buy credits (Razorpay test mode) |
| Load | Script/k6 | 5,000-certificate batch; 100 concurrent verify requests |
| Visual/a11y | Playwright screenshots, axe | Key screens in light/dark, reduced motion |
| Security | Manual checklist | Cross-org access attempts, upload abuse, webhook forgery, CSV injection |

---

## 17. Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server only
NEXT_PUBLIC_APP_URL=
VERIFY_BASE_URL=
WORKER_SECRET=
RESEND_API_KEY=                     # or SES_* 
EMAIL_FROM=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=                # server only
RAZORPAY_WEBHOOK_SECRET=            # server only
UPSTASH_REDIS_REST_URL= / TOKEN=
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
AI_ENABLED=false
ANTHROPIC_API_KEY=                  # only if AI_ENABLED
```

---

## 18. Acceptance criteria for v1.0

- A new user issues a test certificate within 10 minutes without help.
- A 1,000-row batch completes with ≥ 99% success and correct credit accounting (reserved − refunded = issued).
- Replaying any Razorpay webhook never double-credits.
- A user from org A can never read or modify org B data (verified by pgTAP).
- Revoking a certificate is reflected on its verify page within 30 seconds.
- Every export type works for a 1,000-certificate batch and files open correctly.
- Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95 on landing and verify pages.

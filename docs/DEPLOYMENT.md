# CertiVault Production Deployment & Operations Guide (v1.0.0)

**Application:** CertiVault (`certivault.in`)  
**Architecture:** Next.js App Router (TypeScript + Tailwind) + Supabase (Postgres, Auth, Storage, Realtime, RLS)  
**Primary Region:** Mumbai, India (`bom1` on Vercel, `ap-south-1` on Supabase)  
**Project Reference:** `hydvivhoetmxtvvqxkuc` (Supabase Mumbai)  

---

## 1. Architecture & Infrastructure Topology

```
                  ┌────────────────────────────────────────┐
                  │          Cloudflare / DNS              │
                  │   certivault.in / mail.certivault.in   │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │    Vercel Edge & Server   │
                        │    Region: bom1 (Mumbai)  │
                        │  Next.js 15 App Router    │
                        └─────────────┬─────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
┌──────────────────────────┐                    ┌───────────────────────────┐
│     Supabase Mumbai      │                    │     Third-Party APIs      │
│      (ap-south-1)        │                    ├───────────────────────────┤
├──────────────────────────┤                    │ • Razorpay (INR Payments) │
│ • Postgres 16 (RLS)      │                    │ • Resend (Transactional)  │
│ • Transaction Pooler     │                    │ • Sentry (Observability)  │
│ • Private Storage Buckets│                    └───────────────────────────┘
│ • pg_cron Worker Trigger │
└──────────────────────────┘
```

---

## 2. Production Environment Variables (Vercel)

Set the following variables in **Vercel Project Settings > Environment Variables** (Production environment):

| Variable | Scope | Description / Example |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | `https://hydvivhoetmxtvvqxkuc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Supabase anonymous public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Only | Supabase service-role secret (strictly restricted to `src/server/*`) |
| `NEXT_PUBLIC_APP_URL` | Client & Server | `https://certivault.in` |
| `VERIFY_BASE_URL` | Client & Server | `https://certivault.in` |
| `WORKER_SECRET` | Server Only | High-entropy 32-byte secret (e.g., `openssl rand -hex 32`) |
| `RESEND_API_KEY` | Server Only | Production API key (`re_...`) |
| `EMAIL_FROM` | Server Only | `"CertiVault <certificates@mail.certivault.in>"` |
| `RAZORPAY_KEY_ID` | Client & Server | Live Key ID (`rzp_live_...`) |
| `RAZORPAY_KEY_SECRET` | Server Only | Live Key Secret (`...`) |
| `RAZORPAY_WEBHOOK_SECRET` | Server Only | Live Webhook Secret from Razorpay Dashboard |
| `UPSTASH_REDIS_REST_URL` | Server Only | Optional distributed rate limiting URL |
| `UPSTASH_REDIS_REST_TOKEN` | Server Only | Optional distributed rate limiting token |
| `SENTRY_DSN` | Client & Server | Sentry production DSN |
| `NEXT_PUBLIC_POSTHOG_KEY` | Client Only | PostHog analytics key |
| `AI_ENABLED` | Server Only | `false` (Strictly disabled in v1.0 per ADR 10) |

---

## 3. Database & Migrations Checklist (Supabase Mumbai)

Verify all 9 migrations are executed in sequence on the live database (`hydvivhoetmxtvvqxkuc`):

```bash
# Verify migrations status
npx supabase migration list --linked

# Or push pending migrations to live instance
npx supabase db push
```

### Applied Migrations Inventory:
1. `20261025000001_foundation.sql`: Core schema (`orgs`, `org_members`, `invitations`, `signatories`, `templates`, `credit_ledger`), RLS policies, `apply_credit_delta` atomic balance function, and `is_org_member` security functions.
2. `20261025000002_branding_storage.sql`: Private storage bucket `branding`, size caps, MIME allowlist, and tenant RLS.
3. `20261025000003_templates.sql`: Template schema, indexing, and cascade rules.
4. `20261025000004_seed_templates.sql`: 8 Global platform starter templates (Classic Academic, Minimal Modern, Tech Hackathon, Corporate Achievement, Indian Bilingual Devanagari/Telugu).
5. `20261025000005_batches_certificates_jobs_ledger.sql`: `batches`, `certificates`, `jobs`, `claim_jobs(batch_size)` with Postgres `FOR UPDATE SKIP LOCKED`.
6. `20261025000006_verification_and_email.sql`: `get_public_certificate` unguessable Crockford Base32 verification RPC and email tracking.
7. `20261025000007_exports_and_revocation.sql`: `exports` table, audit logging, and certificate revocation tracking.
8. `20261025000008_payments_and_invoices.sql`: `payments`, `invoices`, GST compliance fields, and idempotency keys.
9. `20261025000009_admin_and_verification.sql`: `abuse_reports`, org verification status, platform admin role authorization.

### Storage Buckets Required:
- `branding`: Logos and signatures (Private, 5MB max, image types only)
- `certificates`: Generated PDF certificates (`certs/{org_id}/{cert_id}.pdf`, Private)
- `exports`: Generated ZIPs and merged PDFs (Private, 7-day TTL lifecycle)

---

## 4. Background Job Worker & pg_cron Setup

To process batch generation, email delivery, and exports autonomously without an always-on server:

Execute in Supabase SQL Editor:
```sql
-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule worker heartbeat every 1 minute
SELECT cron.schedule(
  'certivault-worker-heartbeat',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://certivault.in/api/worker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.worker_secret', true)
    ),
    body := '{}'::jsonb
  );
  $$
);
```

*Note: Alternatively, Vercel Cron can be used via `vercel.json`:*
```json
{
  "crons": [
    {
      "path": "/api/worker",
      "schedule": "* * * * *"
    }
  ]
}
```

---

## 5. DNS & Email Authentication (mail.certivault.in)

Configure the following DNS records on your domain registrar / Cloudflare:

| Record Type | Name | Content / Value | Purpose |
|---|---|---|---|
| `A` / `CNAME` | `@` | `cname.vercel-dns.com` | Root application |
| `CNAME` | `www` | `cname.vercel-dns.com` | Web alias |
| `TXT` | `mail` | `v=spf1 include:resend.com ~all` | SPF email deliverability |
| `TXT` | `resend._domainkey.mail` | Provided by Resend Dashboard | DKIM cryptographic signature |
| `TXT` | `_dmarc.mail` | `v=DMARC1; p=reject; rua=mailto:dmarc@certivault.in` | DMARC domain protection |
| `MX` | `mail` | `feedback-smtp.resend.com` (Priority 10) | Delivery error bounces |

---

## 6. Razorpay Live Mode Transition & Webhook Drill

1. **Activate Live Account:** Complete Razorpay KYC and activate Live Mode.
2. **Key Generation:** Generate Live Key ID and Secret in Razorpay Dashboard > Settings > API Keys.
3. **Webhook Setup:**
   - Webhook URL: `https://certivault.in/api/webhooks/razorpay`
   - Secret: Generated high-entropy string stored in `RAZORPAY_WEBHOOK_SECRET`.
   - Active Events:
     - `order.paid`
     - `payment.captured`
     - `payment.failed`
4. **Verification Drill:**
   - Purchase the ₹999 Event Pack using a live UPI account or test ₹1-class transaction.
   - Confirm immediate credit addition (+500 credits) in `/app/account/billing`.
   - Confirm automatic 18% GST invoice generation and PDF download.
   - Verify webhook idempotency by re-sending the webhook event from Razorpay Dashboard.

---

## 7. Rollback & Disaster Recovery Procedures

### A. Vercel Instant Rollback
If a critical frontend or server action regression occurs:
1. In Vercel Dashboard > **Deployments**.
2. Locate the previous stable deployment (tagged `work-12-done` or `v1.0.0`).
3. Click **Instant Rollback**. Traffic is rerouted in < 3 seconds across all edge nodes.

### B. Database Migration Rollback Notes
All migrations are strictly backward-compatible additions (additive schema design). If a rollback is necessary:
- Never drop columns that have live data.
- Refer to down-migration notes in `docs/runbook.md` §1-§4.
- Supabase Point-in-Time Recovery (PITR) is enabled on `hydvivhoetmxtvvqxkuc` for up-to-the-second restoration.

---

## 8. Post-Launch Operational Dashboard

Key metrics to monitor in the first 90 days:
1. **Activation:** Sign-up to first issued batch time (Target: ≤ 10 min).
2. **Generation Quality:** Batch success rate (Target: ≥ 99% cleanly generated).
3. **Delivery:** Email delivery rate in Resend dashboard (Target: ≥ 97%).
4. **Public Verification:** p95 page load time on 4G (Target: ≤ 1.5 seconds).
5. **Ledger Reconciliation:** Daily automated check that `orgs.credit_balance = sum(credit_ledger.delta)`.

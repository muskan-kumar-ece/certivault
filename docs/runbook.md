# CertiVault Operational & Disaster Recovery Runbook

**Service:** CertiVault (`certivault.in`)  
**Deployment Region:** Mumbai (`bom1` on Vercel, `ap-south-1` on Supabase)  
**Classification:** Standard Operating Procedures (SOP) & Incident Response  

---

## 1. Stuck Job Recovery (Worker Engine)

CertiVault uses transactional job queueing in the `jobs` table (`status: 'queued' | 'processing' | 'completed' | 'failed'`).

### Symptoms
- Batch stuck in `processing` status in issuer console with progress bar unchanged for > 5 minutes.
- Cron worker invocation log shows Vercel function timeout (e.g., 300s edge limit) or unhandled error during large batch dispatch.

### Diagnosis Query
```sql
SELECT id, batch_id, type, status, attempts, error, created_at, updated_at
FROM public.jobs
WHERE status = 'processing' 
  AND updated_at < NOW() - INTERVAL '5 minutes';
```

### Remediation Procedure
1. **Identify Stale Chunks:** If worker died mid-flight, chunks locked in `processing` with no updates for > 5 minutes can be safely re-queued because PDF generation and storage uploads are idempotent (using deterministic paths `certs/{org_id}/{cert_id}.pdf`).
2. **Re-queue SQL:**
```sql
UPDATE public.jobs
SET status = 'queued',
    attempts = attempts + 1,
    updated_at = NOW()
WHERE status = 'processing'
  AND updated_at < NOW() - INTERVAL '5 minutes'
  AND attempts < 5;
```
3. **Trigger Worker Manually:**
Invoke the worker endpoint directly using curl:
```bash
curl -X POST "https://certivault.in/api/cron/worker" \
  -H "Authorization: Bearer ${WORKER_SECRET}"
```
4. **Permanent Failure Analysis:** If `attempts >= 5`, investigate the specific payload error:
```sql
SELECT id, batch_id, error FROM public.jobs WHERE status = 'failed' ORDER BY updated_at DESC LIMIT 10;
```
Common root causes: Missing font glyphs (fallback used), corrupted image basePdf, or storage quota exceeded.

---

## 2. Razorpay Webhook Replay & Reconciliation Drill

### Symptoms
- User reports credits not added after successful payment deduction.
- Razorpay dashboard shows `payment.captured` with webhook delivery failed (e.g. 500 or timeout).

### Step 1: Verify Idempotency in DB
CertiVault uses `payments.razorpay_payment_id` with a UNIQUE constraint and logs each event in `webhook_events`. Check if payment already exists:
```sql
SELECT id, org_id, status, pack_id, credits_added, amount_paise 
FROM public.payments 
WHERE razorpay_payment_id = 'pay_SAMPLE12345';
```

### Step 2: Webhook Replay
1. Navigate to **Razorpay Dashboard** > **Settings** > **Webhooks**.
2. Locate the failed webhook event (`order_SAMPLE123` or `pay_SAMPLE12345`).
3. Click **Resend Webhook**.
4. The CertiVault webhook handler (`/api/webhooks/razorpay`) validates HMAC SHA256 using `RAZORPAY_KEY_SECRET`, inserts idempotently into `payments`, executes `apply_credit_delta`, and generates the GST invoice.

### Step 3: Manual Credit Reconciliation (Emergency Fallback)
If Razorpay webhook fails repeatedly:
1. Verify payment status in Razorpay Dashboard is `captured`.
2. As a platform admin, use the Admin Console (`/admin/orgs/[id]`) to apply a manual credit adjustment with a clear reference reason (e.g., `Razorpay reconciliation for pay_SAMPLE12345`).
3. This triggers `apply_credit_delta` with audit logging, keeping credit balance and ledger mathematically reconciled.

---

## 3. Secret & Key Rotation Procedures

### A. WORKER_SECRET Rotation
Used for authenticating Vercel cron triggers to `/api/cron/worker`.
1. Generate new 32-byte secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Update `WORKER_SECRET` in Vercel Environment Variables (`Production`).
3. If using external cron (e.g. Supabase pg_cron or cron-job.org), update bearer token header.
4. Verify by triggering `POST /api/cron/worker` with new secret.

### B. RAZORPAY_KEY_SECRET Rotation
1. Log into Razorpay Dashboard > **Settings** > **API Keys**.
2. Click **Generate New Key**. Note the grace period (Razorpay allows 24 hours of dual-key validity).
3. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Vercel Environment Variables.
4. Redeploy Vercel production build.
5. In Razorpay Webhooks settings, update the Webhook Secret and update `RAZORPAY_WEBHOOK_SECRET` in Vercel.
6. Test a 1-credit purchase in test mode to confirm signature verification.

### C. SUPABASE_SERVICE_ROLE_KEY Rotation
*Extreme caution: service role bypasses RLS and is used by server-only routines.*
1. In Supabase Dashboard > **Settings** > **API**.
2. Roll JWT secret / service role key.
3. Immediately update `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
4. Trigger immediate zero-downtime redeploy on Vercel.
5. Inspect worker logs to confirm DB queries succeed.

---

## 4. Accidental Certificate Revocation Recovery

CertiVault implements immutable audit trails. When a certificate is revoked:
- `certificates.status` becomes `'revoked'`.
- `certificates.revocation_reason` and `revoked_at` are stored.
- An immutable entry is written to `audit_logs` (`action = 'certificate.revoked'`).
- The generated PDF remains stored in Supabase storage `certs/{org_id}/{cert_id}.pdf`.

### Remediation Procedure
1. Confirm identity of issuer requesting un-revocation via support ticket.
2. Verify audit entry in database:
```sql
SELECT * FROM public.audit_logs 
WHERE target_id = '<cert_id>' AND action = 'certificate.revoked';
```
3. Un-revoke certificate via database function or platform admin console:
```sql
UPDATE public.certificates
SET status = 'issued',
    revocation_reason = NULL,
    revoked_at = NULL,
    updated_at = NOW()
WHERE id = '<cert_id>' AND org_id = '<org_id>';

INSERT INTO public.audit_logs (org_id, actor_id, action, target_type, target_id, metadata)
VALUES ('<org_id>', '<admin_user_id>', 'certificate.unrevoked', 'certificate', '<cert_id>', '{"reason": "Accidental revocation restored by platform admin"}');
```
4. Verify `/c/[publicId]` immediately transitions back to "Verified & Active" state with green badge.

---

## 5. DDoS, Rate-Limiting & Abuse Response

### Rate Limits Enforced:
- Public verification (`/c/[publicId]`): 60 requests/minute/IP
- Certificate PDF Download (`/api/download`): 60 requests/minute/IP
- Test Certificate Issuance: 5 certificates/day/organization
- Auth / Sign-in: 5 requests/minute/IP
- CSV / Asset Uploads: 20 uploads/hour/org

### Mitigation Steps During Traffic Spikes / Abuse:
1. **Cloudflare / Vercel Edge Rule:**
   - If an IP or CIDR block exceeds threshold or generates bot traffic, add IP to Vercel Firewall / WAF blocklist.
2. **Abuse Report Resolution:**
   - Review reported public IDs in `/admin/abuse`.
   - If certificate violates terms (e.g. fake degree, phishing), mark report resolved, suspend certificate, and toggle organization status to `is_suspended = true`.
3. **Suspension Impact:**
   - Suspended orgs receive HTTP 403 on all mutations via `requireRole` and RLS.
   - Public view of suspended org's certificates displays `"Issuer Suspended - Under Investigation"`.

---

## 6. Database Health & Maintenance (Mumbai ap-south-1)

1. **Connection Pool Monitoring:**
   - Next.js server actions connect via Supabase Transaction Pooler (port 6543) for stateless pooling.
   - Direct connection (port 5432) reserved exclusively for migrations and pg_cron.
2. **Vacuum & Bloat Check:**
   - Supabase Postgres runs autovacuum automatically.
   - For high-churn tables (`jobs`, `webhook_events`), monitor table size:
```sql
SELECT relname, n_dead_tup, last_vacuum, last_autovacuum
FROM pg_stat_user_tables
WHERE relname IN ('jobs', 'webhook_events', 'audit_logs');
```
3. **Backup & PITR (Point-in-Time Recovery):**
   - Daily backups enabled on Supabase project `hydvivhoetmxtvvqxkuc`.
   - Retention: 7 days standard, PITR up to seconds precision.

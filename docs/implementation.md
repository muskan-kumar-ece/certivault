# Implementation Guide: CertiVault (working name)

A build plan you can follow week by week, with acceptance criteria, key code, and a checklist for launch. Pairs with `PRD.md`, `TRD.md`, `architecture.md`.

**Timeline:** 8 weeks to a paid-ready v1.0 for one developer using an AI coding assistant. **Rule:** ship vertical slices (a feature works end to end on phone and desktop) instead of building layers.

---

## 0. Before you write code (do this in week 0-1, in parallel)

| Task | Why now |
|---|---|
| Pick final name, buy domain, set up email addresses | Needed for sending domain and Razorpay |
| Apply for **Razorpay** (KYC, website with Terms, Privacy, Refund, Contact pages) | Approval can take days to weeks |
| Confirm with a CA: GST registration, SAC code, invoice format | Required before charging |
| Create accounts: GitHub, Vercel, Supabase (Mumbai), Resend, Sentry, Upstash | Free tiers are enough to start |
| Collect 3 pilot contacts (club leads + one T&P officer) | Real feedback in weeks 5-8 |
| Draft 8 certificate designs (or commission) | Presets make the first impression |

---

## 1. Project setup

```bash
npx create-next-app@latest certivault --typescript --tailwind --app --src-dir --eslint
cd certivault
npm i @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers \
      framer-motion vaul cmdk lucide-react @tanstack/react-query \
      papaparse xlsx fuse.js fflate pdf-lib @pdfme/generator @pdfme/schemas @pdfme/common \
      razorpay resend @react-email/components date-fns nanoid
npm i -D vitest @playwright/test @types/papaparse supabase
npx supabase init && npx supabase start      # local Postgres/Auth/Storage
```

Add: Radix primitives as needed (`@radix-ui/react-*`), `@pdfme/ui` for the designer.

**Repo layout:** see `architecture.md` §6. Add `/supabase/migrations`, `/supabase/tests` (pgTAP), `/docs` (these four files), `/scripts` (benchmarks, seeds).

**Conventions**
- Zod schemas in `src/lib/schemas/*` shared by client and server.
- Every server action: `requireUser()` → `requireRole(orgId, [...])` → validate → act → `audit()`.
- One Supabase helper per context: browser client, server client (cookies), admin client (service role, server only, lives in `src/server/admin.ts`).
- No inline colors or sizes: use tokens only.

---

## 2. Design system first (week 1, about 2 days)

Build the Apple-feel foundation once so every screen inherits it.

1. **Tokens** in `globals.css` using CSS variables for light/dark (see PRD §11): colors, radii, spacing, shadows, spring constants.
2. **Fonts:** system stack + Inter via `next/font`; Noto Sans Devanagari/Telugu are for PDFs only (not UI).
3. **Primitives:** `Button`, `IconButton`, `SegmentedControl`, `Field`, `Select`, `Sheet` (vaul), `Dialog`, `Toast`, `Skeleton`, `EmptyState`, `Chip`, `ProgressRing`, `ListRow` (swipe actions), `LargeTitleHeader`, `TabBar`, `Sidebar`, `CommandPalette`.
4. **Press feedback:** one `usePress` helper (scale 0.97, 100 ms), `touch-action: manipulation`.
5. **Motion:** a shared `spring = { type: 'spring', stiffness: 380, damping: 32 }` and `useReducedMotion` fallback.
6. **Shell:** responsive layout switching between bottom `TabBar` and `Sidebar`; safe-area padding; `100dvh`.
7. **Storybook-lite:** a `/dev/ui` page showing every component in light/dark. Review on a real phone.

**Acceptance:** `/dev/ui` looks right on iPhone Safari, Android Chrome and desktop; reduced-motion respected; all targets ≥ 44 px; Lighthouse accessibility ≥ 95.

---

## 3. Week-by-week plan

### Week 1: Foundations
- Supabase project (Mumbai), migrations for `orgs`, `org_members`, `invitations`, `signatories`, RLS helpers (`is_member`, `has_role`) and policies.
- Auth: email OTP + Google, `@supabase/ssr` middleware, protected `(app)` routes.
- Onboarding flow (org, logo upload, color), org switcher.
- Design system (section 2), app shell with tab bar/sidebar, empty Home.
- CI: lint, typecheck, unit tests, pgTAP RLS tests on PRs.
- **Done when:** a new user signs up on a phone, creates an org, and lands on Home; user B cannot see org A (pgTAP test passes).

### Week 2: Templates and the PDF engine (de-risk early)
- Storage buckets + upload helpers (type/size checks).
- Preset templates (8) as JSON + thumbnails; template library screen.
- Template editor v1: pdfme Designer embedded, custom field palette, inspector sheet, autosave, required QR + ID fields, preview with sample data.
- Server `renderCertificate()` with embedded fonts (Inter, Playfair Display, Noto Devanagari, Noto Telugu).
- **Benchmark script:** generate 500 certificates; record ms per certificate and PDF size.
- **Done when:** a template made in the editor renders a correct PDF with a scannable QR; benchmark ≤ 500 ms per certificate (otherwise tune fonts/subsetting or switch hot path to pdf-lib).

### Week 3: Import, issue wizard, worker
- Client-side parsing (Papa/SheetJS), column auto-match (Fuse.js), validation UI, draft persistence.
- Migrations: `batches`, `certificates`, `jobs`, `credit_ledger`, `apply_credit_delta`, `claim_jobs`.
- Issue server action (transaction: reserve credits, queue jobs).
- `/api/worker` with time box, self-retrigger, stale-lock recovery; `pg_cron` heartbeat.
- Progress screen via Realtime.
- **Done when:** a 1,000-row CSV issues end to end with live progress; killing the worker mid-run still completes; credit math reconciles (reserved − refunded = issued).

### Week 4: Delivery and verification
- Email provider interface (Resend), React Email templates, sender setup (SPF/DKIM/DMARC).
- `send_email_chunk` job, provider webhooks, suppression list.
- Public verify page `/c/[id]`, `/verify` with QR scanning, abuse report, rate limiting.
- "Send me a test certificate" flow.
- Home dashboard: recent batches, stats.
- **Done when:** recipients get email on Gmail/Outlook/Yahoo (check inbox placement), QR scan on a phone opens the verified page in under 2 s.

### Week 5: Registry, revoke, bulk export
- Certificates screen (Batches | All), search with trigram index, filters, multi-select.
- Batch detail, certificate detail, resend, revoke (reason sheet), correct and reissue, audit log.
- `exports` table and `export` job: ZIP, merged PDF, CSV report, share-links CSV; Exports drawer; expiry cleanup.
- **Done when:** all four exports work for a 1,000-certificate batch; ZIP opens on Windows/macOS/Android; CSV opens in Excel and Sheets with Indian-script names intact (UTF-8 with BOM).

### Week 6: Payments, credits, plans
- Migrations: `payments`, `invoices`, `webhook_events`, invoice-number function.
- Pricing page, billing screen, checkout (Razorpay test mode), confirm endpoint, webhook, `fulfill_payment`.
- Invoice PDF + receipt email; GST fields form; low-credit emails.
- Campus plan purchase, plan expiry reminders, admin manual credit grant (for bank-transfer customers).
- **Done when:** buying a pack in test mode adds credits once even if the webhook fires 3 times; invoice numbers are sequential; failing a payment shows a clear retry path.

### Week 7: Team, admin, polish ("feels good" week)
- Team invites and roles; organization settings; signatories; sender name.
- Internal `/admin`: orgs, payments, grant credits, suspend, verified-issuer approval, abuse queue.
- Polish pass using the checklist in section 6 (motion, empty states, copy, dark mode, skeletons, sheets, haptics).
- PWA manifest and offline fallback; performance pass (bundle size, images, fonts).
- **Done when:** a first-time user finishes onboarding → test certificate on a phone without any confusion (watch 3 people try it silently).

### Week 8: Hardening and beta launch
- Security checklist (section 7), load test (5,000-certificate batch, 100 concurrent verifications), backups and restore drill.
- Switch to production Supabase/Vercel (paid plans), Razorpay live keys, final legal pages.
- Beta with 5 clubs (free credits) + 1-2 college pilots; collect feedback; fix top issues.
- Landing page with demo; short onboarding video; support WhatsApp/email.
- **Done when:** the acceptance criteria in TRD §18 all pass in production.

---

## 4. Key code (sketches to adapt; check library docs for current APIs)

### 4.1 Public ID generator
```ts
// src/server/ids.ts
import { randomBytes } from 'crypto';
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford Base32
export function newPublicId(date = new Date()) {
  const bytes = randomBytes(5);                 // 40 bits
  let n = BigInt('0x' + bytes.toString('hex')), out = '';
  for (let i = 0; i < 8; i++) { out = ALPHABET[Number(n & 31n)] + out; n >>= 5n; }
  return `CV-${String(date.getFullYear()).slice(2)}-${out}`;
}
```

### 4.2 Issue action (credits + queue in one transaction)
```sql
-- supabase/migrations/..._issue_batch.sql
create function issue_batch(_batch uuid) returns void
language plpgsql security definer set search_path = public as $$
declare b batches; n int;
begin
  select * into b from batches where id = _batch for update;
  if not has_role(b.org_id, '{owner,admin,issuer}') then raise exception 'forbidden'; end if;
  if b.status <> 'draft' then raise exception 'already issued'; end if;
  select count(*) into n from certificates where batch_id = _batch and status = 'pending';
  perform apply_credit_delta(b.org_id, -n, 'issue_reserve', 'batch', _batch::text);
  update batches set status='queued', total=n, credits_reserved=n where id=_batch;
  insert into jobs(type, payload)
    select 'generate_chunk', jsonb_build_object('batch_id', _batch, 'ids', array_agg(id))
    from (select id, (row_number() over (order by created_at) - 1) / 20 as grp
          from certificates where batch_id=_batch and status='pending') s
    group by grp;
end $$;
```
Note: `apply_credit_delta` is service-role only, so run this function through the admin client after the server action has authorized the user, or make `issue_batch` the single `security definer` entry point and grant execute to `authenticated` while keeping `apply_credit_delta` ungranted (it is called from inside). Test both paths in pgTAP.

### 4.3 Worker endpoint (time-boxed, self-retriggering)
```ts
// src/app/api/worker/route.ts
export const maxDuration = 60;            // raise on paid plan (e.g. 300)
export async function POST(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.WORKER_SECRET}`)
    return new Response('unauthorized', { status: 401 });
  const started = Date.now();
  const db = adminClient();
  let more = false;
  while (Date.now() - started < 45_000) {
    const { data: jobs } = await db.rpc('claim_jobs', { _limit: 4 });
    if (!jobs?.length) break;
    await Promise.all(jobs.map(runJob));          // each handler catches, sets done/failed/backoff
    more = true;
  }
  if (more) void fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/worker`, {
    method: 'POST', headers: { authorization: `Bearer ${process.env.WORKER_SECRET}` } });
  return Response.json({ ok: true });
}
```

### 4.4 Generate chunk handler (shape)
```ts
async function generateChunk({ batch_id, ids }: Payload) {
  const tpl = await loadTemplate(batch_id);
  const certs = await loadPending(ids);
  for (const c of certs) {
    try {
      const url = `${verifyBase(c.org)}/c/${c.public_id}`;
      const pdf = await renderCertificate(tpl, { ...c.data, name: c.recipient_name, id: c.public_id, qr: url }, FONTS);
      const path = `${c.org_id}/${batch_id}/${c.public_id}.pdf`;
      await storage.upload('certificates', path, pdf, { upsert: true, contentType: 'application/pdf' });
      await markIssued(c.id, path, sha256(pdf));
    } catch (e) {
      await markFailed(c.id, String(e));
      await db.rpc('apply_credit_delta', { _org: c.org_id, _delta: 1, _reason: 'issue_refund', _ref_type: 'certificate', _ref_id: c.id });
    }
  }
  await bumpBatchCounters(batch_id);     // recompute from certificates, don't increment blindly
  await enqueueEmailJobs(batch_id, certs);
  await maybeCompleteBatch(batch_id);
}
```

### 4.5 Fulfill payment (idempotent)
```sql
create function fulfill_payment(_order text) returns void
language plpgsql security definer set search_path = public as $$
declare p payments; credits int;
begin
  select * into p from payments where razorpay_order_id = _order for update;
  if p is null or p.fulfilled_at is not null then return; end if;
  credits := case p.product_code
    when 'pack_event' then 500 when 'pack_club' then 2000
    when 'pack_bulk'  then 5000 when 'plan_campus' then 10000 end;
  perform apply_credit_delta(p.org_id, credits,
    case when p.product_code = 'plan_campus' then 'plan_grant' else 'purchase' end, 'payment', p.id::text);
  if p.product_code = 'plan_campus' then
    update orgs set plan='campus', plan_expires_at = now() + interval '1 year' where id = p.org_id;
  end if;
  update payments set status='paid', paid_at=now(), fulfilled_at=now() where id = p.id;
  insert into jobs(type, payload) values ('invoice', jsonb_build_object('payment_id', p.id));
end $$;
revoke all on function fulfill_payment from public, anon, authenticated;
```

### 4.6 Export ZIP (streamed)
```ts
import { Zip, ZipPassThrough } from 'fflate';
// For each certificate: download bytes, push into zip, flush parts to storage at ~500 MB or 1,000 files.
const safe = (s: string) => s.normalize('NFKD').replace(/[^\w.\- ]+/g, '').trim().slice(0, 80);
const entryName = `${safe(c.recipient_name)}_${c.public_id}.pdf`;
```

### 4.7 Column auto-match
```ts
import Fuse from 'fuse.js';
const ALIASES: Record<string,string[]> = {
  name: ['name','student name','full name','participant','candidate'],
  email: ['email','e-mail','mail id','email address'],
  course: ['course','event','program','workshop','title'],
  date: ['date','issue date','completion date'],
};
// normalize headers (lowercase, strip punctuation) → Fuse search over ALIASES → pick best above threshold.
```

---

## 5. Seed data and starter templates

- `supabase/seed.sql`: preset templates, one demo org, plans/products config.
- **8 presets:** Classic (serif, border), Modern (minimal), Corporate, Academic, Hackathon (bold), Workshop, Internship, Achievement. Each in A4 landscape; 2 in portrait. Include sample English, Hindi and Telugu names to test fonts.
- Fonts bundled in `/public/fonts` (Inter, Playfair Display, Cormorant, Great Vibes for signatures, Noto Sans Devanagari, Noto Sans Telugu). Check each font's license permits embedding in PDFs (most Google Fonts under OFL do).

---

## 6. "Feels good" polish checklist (use on every screen before merging)

**Touch and motion**
- [ ] Every tappable element has a visible press state within 100 ms
- [ ] No 300 ms tap delay; no accidental text selection on buttons
- [ ] Sheets drag smoothly, dismiss by swipe, and don't scroll the page behind
- [ ] Page transitions slide/fade consistently; edge-swipe back works
- [ ] Reduced-motion mode tested

**Visual**
- [ ] Spacing follows the 4-pt grid; no one-off paddings
- [ ] Light and dark mode both reviewed
- [ ] Translucent bars have a solid fallback
- [ ] Safe areas respected on notched iPhones; tab bar doesn't overlap content

**Content and states**
- [ ] Every list has loading skeleton, empty state, and error state
- [ ] Buttons name results ("Issue 412 certificates")
- [ ] Errors explain the fix; no jargon; no apologies
- [ ] Numbers use tabular figures; dates in `12 Oct 2026` format

**Quality**
- [ ] Tested on a real iPhone (Safari), a mid-range Android (Chrome), and desktop
- [ ] Keyboard navigation and focus rings on desktop
- [ ] axe check passes; labels on icon-only buttons
- [ ] Fast on throttled 4G: LCP ≤ 2.0 s

---

## 7. Security and launch checklist

**Security**
- [ ] RLS enabled on every table; pgTAP tests for member/non-member/anon
- [ ] `service_role` key appears only in server files; verified by grep in CI
- [ ] Webhook signature checks and replay test pass
- [ ] Money functions not executable by `anon`/`authenticated` (except intended entry points)
- [ ] Upload limits and type checks tested with hostile files
- [ ] Rate limits on verify, auth, uploads, tests
- [ ] CSV export escaping tested with `=cmd|...` payloads
- [ ] CSP and security headers set
- [ ] Backups enabled; restore tested once

**Business**
- [ ] Razorpay live mode approved; test refund processed
- [ ] GST invoice reviewed by CA
- [ ] Terms, Privacy, Refund, Contact pages live; DPA template ready
- [ ] Support channel (email + WhatsApp) staffed; auto-reply set
- [ ] Sending domain warmed; DMARC monitoring on
- [ ] Verified-issuer review process written down

**Launch**
- [ ] 5 beta clubs have issued at least one batch
- [ ] 1-2 college pilots agreed (free first semester or paid pilot)
- [ ] Demo video and one-page PDF for colleges
- [ ] Status page or uptime monitor public
- [ ] Analytics funnels working; error alerts reaching you

---

## 8. Using an AI coding assistant efficiently (lower build cost)

- **Feed context, not the whole repo:** paste the relevant PRD screen spec + TRD table definitions for the task. Keep a short `CLAUDE.md`/`AGENTS.md` with conventions (tokens only, server action pattern, RLS rule, "no new dependencies without asking").
- **One vertical slice per session:** "Build the Billing screen per PRD §7.12 using existing components" beats "build payments".
- **Use a stronger model for design-critical or risky work** (RLS, money functions, webhook handling, worker concurrency) and a faster/cheaper model for boilerplate (forms, tables, copy, tests).
- **Always ask for tests with the code** (pgTAP for DB functions, Vitest for utilities, Playwright for flows).
- **Review diffs yourself** on anything touching auth, money, or storage permissions.
- **Don't let it invent APIs:** when a library call looks unfamiliar (pdfme, Razorpay, Supabase), open the docs and paste the relevant section into the prompt.
- **Commit small and often;** use preview deployments to check every slice on your phone.

---

## 9. After launch

**First 30 days:** watch the funnel (sign-up → first batch), read every failed batch, call every paying user, fix the top 3 friction points weekly.

**v1.1 priorities (in order):** approval workflow (unlocks colleges) → custom verify subdomain → PDF attachment option → WhatsApp delivery → scheduled sends → PDF fingerprint check → Add-to-LinkedIn → Smart Import.

**Metrics review (weekly):** activation, batch success rate, email delivery rate, credits sold, gross margin, support tickets per 100 batches.

**Cost watch:** Supabase storage/egress, email volume, Vercel function time; move PDF generation to a small VPS worker or Cloudflare R2 only when a number says so.

---

## 10. Definition of done (any task)

1. Works on phone and desktop, light and dark.
2. Loading, empty and error states exist.
3. Authorization enforced server-side and by RLS.
4. Tests added for the logic that could lose money or leak data.
5. No console errors; Sentry clean on staging.
6. Copy reviewed against the PRD voice rules.
7. Merged behind a flag if it's v1.1 material.

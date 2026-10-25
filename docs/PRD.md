# PRD: CertiVault (working name)

**Bulk certificate issuance and public verification for colleges, universities and clubs**
Version 1.0 · Owner: Muskan Kumar · Stack: Next.js + Supabase · Currency: INR

> "CertiVault" and `certivault.in` are placeholders. Check name, domain and trademark availability before committing.

---

## 1. Summary

CertiVault lets an organization design a certificate once, upload a list of names, and issue hundreds or thousands of unique, verifiable certificates in minutes. Every certificate has a unique ID, a QR code, and a public verification page. Recipients get it by email, and the organization tracks everything from one dashboard.

**One-line pitch:** *Issue 1,000 verified certificates in 5 minutes. Anyone can check them in 5 seconds.*

### Why this can win against free tools
| Gap in existing tools | What we do |
|---|---|
| Generators stop at "make PDFs" | Issue, deliver, track, verify, revoke: the whole lifecycle |
| US-priced, USD billing | INR pricing, UPI/cards via Razorpay, GST invoices |
| Clumsy on phones | Apple-quality, touch-first interface that works fully on a phone |
| No institutional trust | Verified-issuer badge, audit log, revocation, custom verify domain |
| Heavy setup | First certificate in under 10 minutes, with presets and a "send me a test" flow |

---

## 2. Users and personas

| Persona | Context | Job to be done | Success looks like |
|---|---|---|---|
| **Aarav, club lead** (primary entry) | Runs a hackathon with 400 participants, uses a phone mostly | "Get certificates out tonight without Canva-ing 400 names" | Done in one sitting, on his phone, ₹0-₹1,000 |
| **Dr. Lakshmi, T&P / exam cell officer** (primary buyer) | Issues course, internship and event certificates all year | "Stop fake certificates and reduce admin workload" | Approvals, branding, registry, annual invoice |
| **Registrar / IT head** (enabler) | Needs security, scale, compliance | "Centralize across departments safely" | Roles, audit log, custom domain, data controls |
| **Priya, recipient** | Gets an email on her phone | "Download, share on LinkedIn, prove it's real" | One tap to view, download, share |
| **Recruiter / verifier** | Receives a PDF or scans a QR | "Is this real?" | Clear green "Verified" result in under 5 seconds, no login |

---

## 3. Goals, non-goals, metrics

### Goals (v1.0)
1. End-to-end self-serve product: sign up → design → import → issue → deliver → verify → export → pay.
2. Time to first certificate under 10 minutes.
3. Gross margin above 90% per certificate, with no LLM calls in the core path.
4. Interface that feels native-quality on iPhone, Android and desktop.

### Non-goals (v1.0)
Native mobile apps, LMS/ERP integrations, blockchain anchoring, SSO/SAML, AI-generated certificate designs, multi-language UI (certificate *content* supports Indian scripts; the app UI is English first).

### Success metrics
| Metric | Target (first 90 days) |
|---|---|
| Activation: org issues first batch within 7 days of sign-up | ≥ 50% |
| Time from sign-up to first issued certificate (median) | ≤ 10 min |
| Batch success rate (certificates generated without error) | ≥ 99% |
| Email delivery rate | ≥ 97% |
| Verify page p95 load on 4G | ≤ 1.5 s |
| Free → paid conversion (orgs issuing > 50) | ≥ 8% |
| Paid colleges | 3 pilots → 10 |

---

## 4. Product principles (what "feels good" means)

1. **One obvious next step on every screen.** A single primary button; everything else is secondary.
2. **Instant feedback.** Every tap responds within 100 ms (press state, spring motion, optimistic UI).
3. **Phone first, desktop better.** Every flow except fine template editing is complete on a phone.
4. **Calm and trustworthy.** Neutral surfaces, one accent color, generous space, no clutter.
5. **Never lose work.** Autosave drafts, resumable batches, undo where possible.
6. **Say what will happen.** Buttons name the result ("Issue 412 certificates"), not the mechanism.

---

## 5. Scope by release

### v1.0 (MVP, about 8 weeks)
- Auth: email OTP/magic link, Google sign-in
- Organization onboarding, branding (logo, color, signatory)
- Template library (8 starter designs) and template editor (desktop/tablet-optimized; phone gets preset quick-edit)
- Import: CSV/XLSX, paste from sheet, manual add; column matching; validation
- Issue wizard with preview and credit check
- Background generation with live progress
- Email delivery with tracking (sent, delivered, bounced)
- Public verification page and QR; "Send me a test certificate"
- Certificates registry: search, filter, view, resend, revoke, reissue
- **Bulk export:** ZIP of PDFs, merged print-ready PDF, CSV report, share-links CSV
- Credits, plans and payments (Razorpay), GST invoices
- Team: owner, admin, issuer, viewer roles; invitations
- Internal admin console (grant credits, suspend, view payments)
- Legal pages: Terms, Privacy, Refund, Contact

### v1.1 (weeks 9-14)
Approval workflow, WhatsApp delivery (paid add-on), PDF attachment option, custom verify subdomain (Campus plan), "check a PDF's fingerprint" on verify page, Add-to-LinkedIn, scheduled sends, Smart Import (small-model, optional).

### v2
Public API + webhooks, student wallet, SSO, Open Badges / verifiable credentials, DigiLocker-style integration, white-label.

---

## 6. Information architecture and navigation

### Public
```
/                      Landing
/pricing               Plans, credit packs, FAQ
/verify                Enter a certificate ID or scan a QR
/c/[publicId]          Certificate verification page (no login)
/login  /signup        Auth
/terms /privacy /refunds /contact
```

### App (signed in)
```
/app                         Home (dashboard)
/app/issue                   Issue wizard (steps 1-5)
/app/templates               Template library
/app/templates/new           Choose preset or upload
/app/templates/[id]          Template editor
/app/certificates            Registry (segmented: Batches | All certificates)
/app/certificates/batch/[id] Batch detail + exports
/app/certificates/[id]       Certificate detail
/app/account                 Account hub (mobile "More")
/app/account/billing         Plan, credits, buy, invoices
/app/account/team            Members and invites
/app/account/organization    Branding, signatories, sender, domain
/app/account/profile         Personal settings
```

### Internal
```
/admin   Orgs, payments, credits, abuse reports (platform admins only)
```

### Navigation model
- **Mobile:** floating translucent **tab bar** with 5 items: Home, Templates, **Issue** (center, accent), Certificates, Account. Pushed screens slide in from the right with a large-title-to-inline-title collapse and a back chevron plus edge-swipe back. Pickers and forms open as **bottom sheets** with a drag handle.
- **Desktop:** left **sidebar** (same five destinations), top bar with search (⌘K command palette), org switcher, and credit balance chip. Detail pages open in a right-side panel or full page; sheets become centered dialogs.
- Active state persists across tabs (each tab keeps its own scroll position and sub-route).
- Browser/OS back always does the expected thing; wizard steps are real routes (`?step=3`), not hidden state.

---

## 7. Screen specifications

Format: **Purpose · Content · Primary action · States · Touch behavior**

### 7.1 Landing `/`
- **Purpose:** explain value in 10 seconds, get sign-ups.
- **Content:** headline, live demo (type a name, see a certificate update and a QR appear), 3-step "how it works", pricing teaser, trust row (verification, revocation, GST invoices), FAQ.
- **Primary action:** "Start free" (sign-up). Secondary: "Verify a certificate".
- **States:** loading skeleton for demo; reduced-motion fallback shows static image.

### 7.2 Sign up / Log in
- Email field → 6-digit code (autofill-friendly `autocomplete="one-time-code"`) or Google. No passwords in v1.
- Errors explain the fix ("That code expired. Send a new one.").

### 7.3 Onboarding (3 short steps, skippable details)
1. Organization name, type (Club / College / University / Other), city.
2. Logo upload and brand color (auto-extract suggested color from logo).
3. "Send yourself a test certificate" with a preset template. Success screen shows the email arriving and the verify page.
- Progress dots on top; each step is a full-height sheet-like card.

### 7.4 Home `/app`
- **Content:** greeting, **Issue certificates** hero card, credit balance with "Add credits", recent batches (progress rings, status), activity (verifications this week, bounced emails to fix), checklist for new orgs (add logo, add signatory, issue first batch).
- **Empty state:** one big card, "Issue your first certificate", with the test-certificate option.
- **Touch:** pull-to-refresh; cards press-scale 0.98.

### 7.5 Templates `/app/templates`
- Grid of thumbnails (2 columns phone, 3-4 desktop). Search, filter (mine / presets / archived).
- **Primary action:** "New template". Long-press (mobile) or ⋯ menu: Rename, Duplicate, Archive.
- **New template:** pick one of 8 presets, or upload a PNG/JPG/PDF background (A4 landscape/portrait, A3, custom).

### 7.6 Template editor `/app/templates/[id]`
- **Canvas** with pinch-zoom (touch) and trackpad/scroll zoom, snapping guides, safe-margin overlay.
- **Field palette:** Name, Course/Event, Date, Grade/Position, Certificate ID, QR code, Logo, Signature, Free text, Custom field.
- **Inspector:** font family (curated list including Telugu/Hindi-capable fonts), size, weight, color, alignment, auto-shrink to fit. On phones it is a bottom sheet with detents (peek / half / full).
- **Preview with sample data** toggle; "Preview with long name" stress test.
- **Autosave** with "Saved" indicator; undo/redo.
- **Phone behavior (v1):** presets and text/color quick-edit; full drag-positioning is tablet/desktop. A banner says so plainly: "Move fields on a tablet or computer for finer control."
- **Rules:** a QR field and an ID field are required before a template can be used for issuing (cannot ship unverifiable certificates).

### 7.7 Issue wizard `/app/issue`
A 5-step flow with a sticky bottom bar (Back / Continue). Each step validates before enabling Continue. State autosaves as a draft batch.

1. **Template:** choose template (recent first), tiny preview.
2. **Recipients:** drop or pick CSV/XLSX, paste rows, or add manually. Shows row count immediately.
3. **Match columns:** each template field ↔ file column, auto-matched by fuzzy name; unmatched fields highlighted; sample row preview.
4. **Review:** swipeable preview of first, middle and last certificate; validation list (missing name, bad email, duplicate email) with "Fix" or "Skip these rows"; **cost summary** ("412 certificates · 412 credits · you have 600"). If short on credits: inline "Add credits" sheet that returns to this step.
5. **Delivery & issue:** options: *Email recipients now* (editable subject and message, sender name) or *Generate only*. Primary button: **"Issue 412 certificates."** Confirmation sheet states credits to be used.

- **Progress screen:** large ring, "Generating 218 of 412", live via realtime; user may leave. Completion triggers a notification email and in-app banner.
- **Done screen:** summary, **Export** button, "View batch", "Issue another".
- **Test mode:** "Send me a test certificate" at step 4, free, 5 per day.

### 7.8 Certificates `/app/certificates`
- **Segmented control:** *Batches* | *All certificates*.
- **Batches:** cards with name, date, template thumbnail, counts (issued, delivered, failed), status chip.
- **All certificates:** search by name, email, or ID; filters (status, batch, date, email status); infinite scroll; multi-select mode (long-press on touch) with bulk actions (Export, Resend, Revoke).

### 7.9 Batch detail `/app/certificates/batch/[id]`
- Header stats (issued, delivered, bounced, verified-views, downloads).
- Table/list of certificates with status. Failed rows grouped with the reason and a "Retry failed" action.
- **Export menu (primary on this screen):**
  - Download all PDFs (ZIP)
  - Print-ready merged PDF
  - Report (CSV): ID, name, email, status, issue date, verify URL
  - Share links (CSV): name + link, for custom mail merges
  - Options: all / selected / failed only; file-name pattern (`{name}_{id}`)
- Large exports run in the background; a toast says "We'll email you when it's ready", and the file appears in an **Exports** drawer for 7 days.
- Secondary: Resend undelivered, Revoke batch (with reason).

### 7.10 Certificate detail `/app/certificates/[id]`
- Large PDF preview, recipient info, status timeline (generated → emailed → delivered → opened link → verified N times), buttons: Download, Copy link, Resend, **Correct details** (reissues with same ID and an audit note), **Revoke** (sheet with required reason).

### 7.11 Public verification `/c/[publicId]`
- **Valid:** green seal animation (single, subtle), "Verified", recipient name, title (course/event), issuing organization with verified badge, issue date, certificate ID, certificate preview, "Download PDF", "Report a problem".
- **Revoked:** neutral red state: "This certificate was revoked on {date}." Reason shown only if the issuer chose to show it.
- **Not found:** "We couldn't find that ID. Check for typos (0 vs O, 1 vs I)." Search field retained.
- Never shows email or private fields. Fast, cacheable shell, no login, works well on slow networks.
- `/verify` offers ID entry and camera QR scan (via `BarcodeDetector` when available, with a library fallback).

### 7.12 Billing `/app/account/billing`
- Current plan card, credit balance, expiry of oldest credits, **Buy credits** (3 packs) and **Upgrade to Campus** actions, invoices list with PDF download, GST details form (GSTIN, billing address, state).
- **Checkout:** Razorpay checkout sheet (UPI first on mobile). Success state animates the new balance. Failure explains cause and offers retry.

### 7.13 Team `/app/account/team`
- Member list with roles, invite by email, change role, remove. Roles: Owner, Admin, Issuer, Viewer.

### 7.14 Organization `/app/account/organization`
- Name, logo, brand color, signatories (name, title, signature image), email sender name and reply-to, verification page branding, (Campus) custom subdomain, data retention setting, "Request verified-issuer badge".

### 7.15 Admin `/admin` (internal)
- Orgs table, org detail (usage, payments, members), grant/adjust credits, suspend org, review "verified issuer" requests, abuse reports queue, payments list.

---

## 8. Key flows

1. **Issue a batch:** Template → Recipients → Match → Review → Issue → Progress → Done → Export.
2. **Verify:** scan QR / open link → verification page (no login).
3. **Revoke:** Certificate → Revoke → reason → confirm → verify page updates within 30 seconds → optional notification email.
4. **Buy credits:** Billing → pick pack → Razorpay → webhook credits account → invoice emailed.
5. **Recover failures:** Batch → failed rows → Retry failed (no extra credits charged for retries; failed items refund credits automatically).
6. **Invite teammate:** Team → Invite → email → accept → role applied.

---

## 9. Functional requirements

Priority: **P0** must ship in v1.0 · **P1** v1.1

| ID | Requirement | Pri |
|---|---|---|
| A-1 | Sign in with email code and Google | P0 |
| A-2 | Multiple organizations per user, org switcher | P0 |
| A-3 | Roles and permissions enforced server-side and via RLS | P0 |
| T-1 | 8 preset templates across A4 landscape/portrait | P0 |
| T-2 | Upload background (PNG/JPG, PDF first page) up to 5 MB | P0 |
| T-3 | Drag/position/style fields; save as JSON; autosave | P0 |
| T-4 | Required QR + ID fields before use | P0 |
| T-5 | Fonts supporting English, Hindi (Devanagari) and Telugu | P0 |
| T-6 | Auto-shrink text to fit; long-name warning | P0 |
| I-1 | Import CSV/XLSX up to 5,000 rows (10,000 on Campus) | P0 |
| I-2 | Header auto-matching; manual override | P0 |
| I-3 | Validation: required fields, email format, duplicates, name length | P0 |
| I-4 | Preview before issue; test certificate | P0 |
| I-5 | Reserve credits atomically; refund failed certificates | P0 |
| G-1 | Background generation with progress and retries | P0 |
| G-2 | Unique, unguessable public ID; QR encoding verify URL | P0 |
| G-3 | Store SHA-256 of each PDF | P0 |
| D-1 | Email delivery with sender name/reply-to and tracking | P0 |
| D-2 | Resend; bounce/complaint handling | P0 |
| D-3 | WhatsApp delivery | P1 |
| V-1 | Public verification page with valid/revoked/not-found | P0 |
| V-2 | Rate limiting and abuse reporting on verification | P0 |
| V-3 | PDF fingerprint check | P1 |
| R-1 | Search/filter registry by name, email, ID, batch, status | P0 |
| R-2 | Revoke, correct (reissue), with audit trail | P0 |
| E-1 | Export ZIP of PDFs (all / selected / failed) | P0 |
| E-2 | Export merged print-ready PDF | P0 |
| E-3 | Export CSV report and share-links CSV (CSV-injection safe) | P0 |
| E-4 | Background exports with email + in-app notice; 7-day expiry | P0 |
| B-1 | Credit packs and annual plan purchase via Razorpay | P0 |
| B-2 | Idempotent fulfillment from webhook and client confirmation | P0 |
| B-3 | GST invoices with sequential numbering | P0 |
| B-4 | Low-credit warning at 10% and at zero | P0 |
| B-5 | Approval workflow | P1 |
| O-1 | Audit log of issue, revoke, role, billing actions | P0 |
| O-2 | Internal admin console | P0 |
| X-1 | Smart Import (small model, capped) | P1 |

---

## 10. Pricing and packaging

All prices in INR, **exclusive of 18% GST**, shown with and without GST at checkout. **1 credit = 1 issued certificate.** Re-sending an email or downloading never costs credits. Corrections (reissue of the same certificate) cost 0 credits. Failed generations are refunded automatically.

| Plan | Price | Includes | Best for |
|---|---|---|---|
| **Free** | ₹0 | 50 credits (one time), watermark footer "Issued with CertiVault", 3 templates, CSV up to 50 rows, test sends | Trying it out |
| **Event pack** | ₹999 | 500 credits (₹2.00 each), no watermark, valid 12 months | A single event or fest |
| **Club pack** | ₹2,999 | 2,000 credits (₹1.50 each), valid 12 months | Active clubs |
| **Bulk pack** | ₹5,999 | 5,000 credits (₹1.20 each), valid 12 months | Busy clubs, departments |
| **Campus** (annual) | ₹24,999 / year | 10,000 credits per year, 5 seats, approvals, custom verify subdomain, no branding, priority support; overage ₹1.50 per credit | Colleges |
| **University** | From ₹1,25,000 / year | 50,000+ credits, unlimited departments, API, security review support, SLA, contract/PO billing | Universities |

**Add-ons (v1.1):** WhatsApp delivery ₹1 per message; extra seat ₹999 per year; custom domain outside Campus ₹1,499 per year.

**Rules**
- Unused credits expire 12 months after purchase (oldest used first). Campus credits reset yearly; overage billed from a prepaid top-up, never post-paid in v1.
- Refunds: unused credit packs refundable within 7 days of purchase; annual plans pro-rated within 14 days if fewer than 5% of credits used. Stated on the Refund page (required for payment gateway approval).
- Payment methods: UPI, cards, netbanking, wallets via Razorpay. Institutions can request a quotation/PI and pay by bank transfer (manual credit grant in admin).
- **Unit economics:** variable cost about ₹0.10-0.15 per certificate (storage, email, bandwidth, gateway fee), so gross margin above 90% at all paid tiers.

---

## 11. Design system (Apple-style feel)

Goal: it should feel like a well-made iOS app that happens to run in the browser.

### 11.1 Color
| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | `#F5F5F7` | `#000000` | App background |
| `surface` | `#FFFFFF` | `#1C1C1E` | Cards, sheets |
| `surface-raised` | `#FFFFFF` | `#2C2C2E` | Popovers |
| `ink` | `#1D1D1F` | `#F5F5F7` | Primary text |
| `ink-secondary` | `#6E6E73` | `#98989D` | Secondary text |
| `hairline` | `rgba(60,60,67,.12)` | `rgba(84,84,88,.45)` | Dividers (use sparingly) |
| `accent` (Ultramarine) | `#3355FF` | `#6B85FF` | Primary actions, links, focus |
| `seal` (Verified) | `#1FA971` | `#34C98B` | Verified states only |
| `warning` | `#E08A00` | `#FF9F0A` | Needs attention |
| `danger` | `#D92D20` | `#FF453A` | Revoke, errors |

One accent color. Green is reserved exclusively for "verified" so it keeps its meaning.

### 11.2 Typography
- Family: system stack `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display"`, with self-hosted **Inter** as the fallback for Android/Windows. Tabular numerals for amounts and IDs.
- Scale (px / line-height): Large title 34/41 bold · Title 28/34 bold · Headline 17/22 semibold · Body 17/24 · Subhead 15/20 · Footnote 13/18 · Caption 12/16.
- Inputs are at least 16 px so iOS Safari never zooms. Sizes use `rem` so system text scaling works. Line length stays under about 70 characters.

### 11.3 Layout, shape, depth
- 4-pt spacing grid (4, 8, 12, 16, 24, 32, 48). Page gutters 16 px phone, 24 px tablet, 32 px desktop. Max content width 1120 px.
- Radii: controls 12, cards 16, sheets 24 (top corners), pills full. Use `corner-shape: squircle` where supported.
- Depth comes from background contrast first, shadow second: `0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06)`. Few borders.
- **Materials:** tab bar, top bars and sheets use translucency: `backdrop-filter: saturate(180%) blur(20px)` at about 72% surface opacity, with a solid fallback.
- Safe areas respected everywhere (`env(safe-area-inset-*)`, `viewport-fit=cover`, `100dvh`).

### 11.4 Motion and touch
- **Springs, not tweens:** default spring stiffness 380, damping 32. Durations 180-320 ms.
- **Press feedback:** scale to 0.97 and slight dim within 100 ms on every tappable element; `touch-action: manipulation`; no tap highlight.
- **Sheets:** draggable with detents; velocity-based dismiss; background scales back slightly; scroll locks correctly (`overscroll-behavior: contain`).
- **Navigation:** shared-axis slide on push/pop using the View Transitions API where supported, cross-fade otherwise. Edge-swipe back on touch.
- **Lists:** swipe actions on rows (Resend, Revoke), pull-to-refresh, momentum scrolling, skeletons instead of spinners.
- **Haptics:** `navigator.vibrate(8-12 ms)` on Android for selection and success. iOS Safari does not support web haptics, so the interface relies on motion and sound-free visual confirmation.
- **Moments of delight (only these):** the verified seal on `/c/[id]`, the progress ring completing, the credit balance counting up after payment.
- **Respect `prefers-reduced-motion`:** replace springs with fades.

### 11.5 Components (built once, reused)
Button (primary, secondary, tinted, destructive), Segmented control, Tab bar, Sidebar, Large-title header, List row (with swipe actions), Card, Sheet/Dialog, Field + Select + Combobox, File drop zone, Stepper, Progress ring/bar, Toast, Empty state, Skeleton, Badge/Chip, Avatar, Command palette, Data table (desktop) / List (mobile).

### 11.6 Accessibility
WCAG 2.2 AA contrast; 44×44 px minimum targets; visible 2-px focus ring with offset; full keyboard support on desktop; semantic labels and live regions for progress; no information by color alone; works with iOS VoiceOver and Android TalkBack.

### 11.7 Voice and microcopy
Sentence case, plain verbs, specific results. "Issue 412 certificates," not "Submit." The same action keeps the same name everywhere (Issue → "Issued" toast). Errors say what happened and how to fix it, and never apologize. Empty screens invite action ("No batches yet. Issue your first certificates.").

---

## 12. Emails and notifications

| Email | To | Trigger |
|---|---|---|
| Your certificate from {Org} | Recipient | Issue/resend (button "View certificate", link only in v1.0) |
| Batch complete | Issuer | Generation finished (counts + Export link) |
| Export ready | Issuer | Large export finished |
| Payment receipt + GST invoice | Billing contact | Payment captured |
| Credits running low | Owner/admin | ≤ 10% remaining, and at 0 |
| Team invite | Invitee | Invite sent |
| Certificate revoked (optional) | Recipient | Revoke with "notify" checked |
| Sign-in code | User | Login |

Email design: single column, large button, org logo, plain text alternative, SPF/DKIM/DMARC-aligned sending domain.

---

## 13. Analytics (privacy-respecting, no recipient PII)

`signup_completed`, `onboarding_step`, `template_created`, `import_started/completed`, `issue_reviewed`, `batch_issued`, `batch_completed`, `export_requested/ready`, `checkout_started/succeeded/failed`, `certificate_verified`, `revoke_completed`, `invite_sent`. Funnels: signup → first batch; review → issue; checkout started → succeeded.

---

## 14. Non-functional requirements (summary; details in TRD)

- 1,000-certificate batch completes in about 10 minutes or less; 5,000 within about an hour.
- Verify page p95 ≤ 1.5 s on 4G; availability target 99.5% in v1.0.
- Mumbai region hosting for Indian latency and data residency preference.
- Compliance posture: aligned to India's DPDP Act principles (consent, minimization, deletion on request); organization is the data fiduciary, CertiVault the processor. Have a lawyer review Terms/Privacy.

---

## 15. Risks and open questions

| Risk | Mitigation |
|---|---|
| Free tools undercut us | Compete on verification, lifecycle, Indian payments/invoices, trust features |
| Slow college procurement | Clubs fund growth while pilots run; Campus plan priced under typical discretionary limits |
| Fake or abusive issuers (impersonating a college) | Email verification, "Verified issuer" manual review, report button, suspend tools |
| Template editor on phones is hard | Be honest in v1.0: presets + quick-edit on phones, full editor on tablet/desktop |
| PDF generation speed | Benchmark in week 2; fall back to `pdf-lib`; parallelize workers |
| Razorpay onboarding delays | Start KYC and legal pages in week 1 |
| GST/legal obligations | Confirm registration needs with a CA before charging |

**Open questions:** final product name and domain; whether to default to link-only emails or attach PDFs; exact free-tier credits (50 vs 100); first three pilot colleges.

# CertiVault — Verifiable Certificates at Scale

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%7C%20Auth%20%7C%20Storage-emerald?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2-yellow?logo=vitest)](https://vitest.dev/)

CertiVault is an institutional-grade, multi-tenant SaaS platform built for Indian higher education institutions, hackathons, examination cells, and training providers. It automates high-volume verifiable certificate generation, digital delivery, and instant cryptographic public verification.

---

## Key Capabilities

- **Bulk Certificate Generation:** Upload spreadsheets (CSV/XLSX) with automatic column mapping and issue up to 10,000 certificates with asynchronous background chunk processing.
- **Instant Public Verification (`/c/[publicId]`):** Fast cryptographic verification in <5 seconds using Crockford Base32 unguessable IDs (`CV-YY-XXXXXXXX`) and high-resolution QR codes.
- **Apple-Grade Interactive Live Studio:** Real-time WYSIWYG certificate template designer with vector QR codes, dynamic font rendering, bilingual support (Hindi, Telugu, English), and live preview.
- **Automated Delivery Engine:** Link-first email dispatch, delivery tracking, and self-serve recipient certificate portal.
- **Enterprise Ledger & Credits:** Pre-paid credit engine, Razorpay checkout with statutory Indian GST invoices (CGST/SGST itemization per CGST Act §31).
- **Security & Privacy:** 100% Row-Level Security (RLS) across all 19 PostgreSQL tables, private S3 storage buckets, and zero leakage of recipient emails on public verification endpoints.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router, Server Actions, React 19)
- **Database & Auth:** Supabase (PostgreSQL 15, GoTrue Auth, Realtime, Storage)
- **PDF Engine:** `@pdfme/generator` + `pdf-lib` + canvas rendering
- **Styling & Tokens:** Tailwind CSS, Radix UI Primitives, Lucide Icons, Inter Typography
- **Payments:** Razorpay Orders, Webhooks & Tax Invoicing
- **Email:** Resend API & Custom SMTP
- **Testing:** Vitest (81/81 unit & integration tests) + Playwright

---

## Getting Started

### 1. Prerequisites
- Node.js >= 20.0.0
- Supabase project or local Supabase CLI

### 2. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase, Razorpay, and Resend credentials.

### 3. Installation
```bash
npm install
```

### 4. Database Migrations
Apply migrations located in `supabase/migrations/` to your Supabase instance:
```bash
npx supabase db push
```

### 5. Run Local Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Verification & Architecture Guards

CertiVault enforces 4 non-negotiable architectural guards:
```bash
npm run guard       # Validates RLS everywhere, secrets isolation, tokens, allowlist
npm run typecheck   # Strict TypeScript compilation check (0 errors)
npm run lint        # ESLint static code analysis
npm test            # Runs all 11 Vitest test suites (81 tests)
npm run verify:prod # Production launch verification gate
```

---

## License
Proprietary & Confidential. All rights reserved.

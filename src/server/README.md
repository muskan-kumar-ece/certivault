# src/server

## Purpose
Server-only domain logic and background tasks:
- `pdf`: PDF generation, font embedding, public ID generator
- `jobs`: background job runners, worker handler, queue claims
- `email`: Resend/SES provider integration, email chunk processing
- `payments`: Razorpay integration, GST calculations, webhook verification, fulfillment
- `export`: bulk ZIP streaming, merged PDF builder, CSV export
- `auth`: server action authorization helpers (`requireUser`, `requireRole`, `audit`)
- `admin`: Supabase admin service-role client (`src/server/admin.ts`)

## Rules
- Every module MUST begin with `import 'server-only';`.
- NEVER import any module from `src/server` into client components or client bundles.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or secrets to client code or logs.

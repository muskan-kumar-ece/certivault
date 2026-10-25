# src/lib

## Purpose
Shared utilities, constants, Zod schemas, and Supabase client factories.
- `supabase/browser.ts`: Browser Supabase client (anon key + JWT)
- `supabase/server.ts`: Server Supabase client for Server Components & Server Actions (cookies)
- `schemas/`: Shared Zod schemas (client & server)
- `tokens.ts`: Typed design tokens
- `utils.ts`: General helper functions (cn, formatters)

## Rules
- `src/lib` modules must be self-contained and general-purpose.
- `src/lib` must NEVER import from `src/features`, `src/server`, or `src/app`.

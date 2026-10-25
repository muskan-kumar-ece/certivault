# supabase

## Purpose
Postgres schema, append-only migrations, pgTAP security tests, and seed data.
- `migrations/`: Append-only SQL migration files (`YYYYMMDDHHMMSS_name.sql`)
- `tests/`: pgTAP test files testing RLS policies, role access, and ledger integrity
- `seed.sql`: Seed data for development and initial presets

## Rules
- Every table created MUST have `ENABLE ROW LEVEL SECURITY` in the same migration.
- Never edit an already-applied migration; add a new migration instead.
- Credit balances are modified ONLY via `apply_credit_delta`.

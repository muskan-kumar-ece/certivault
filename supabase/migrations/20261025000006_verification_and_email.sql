-- Migration: 20261025000006_verification_and_email.sql
-- Work 8: Public Verification Narrow RPC, Verification Events, Abuse Reports, and Email Suppressions
-- Hardened per db-security-reviewer audit recommendations

-- 1. Create verification_events table
create table if not exists verification_events (
  id bigserial primary key,
  certificate_id uuid references certificates(id) on delete cascade,
  public_id text not null,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists verification_events_public_id_idx on verification_events (public_id);
create index if not exists verification_events_certificate_id_idx on verification_events (certificate_id);
create index if not exists verification_events_created_at_idx on verification_events (created_at desc);

-- 2. Create abuse_reports table
create table if not exists abuse_reports (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid references certificates(id) on delete set null,
  public_id text not null,
  reason text not null check (reason in ('fraudulent', 'incorrect_info', 'impersonation', 'offensive', 'other')),
  details text,
  contact_email text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists abuse_reports_public_id_idx on abuse_reports (public_id);
create index if not exists abuse_reports_certificate_id_idx on abuse_reports (certificate_id);
create index if not exists abuse_reports_status_idx on abuse_reports (status);

-- 3. Create email_suppressions table (Case-insensitive uniqueness invariant)
create table if not exists email_suppressions (
  id bigserial primary key,
  email text not null check (email = lower(email)),
  reason text not null check (reason in ('bounce', 'complaint', 'unsubscribe', 'manual')),
  created_at timestamptz not null default now()
);

create unique index if not exists email_suppressions_lower_email_idx on email_suppressions (lower(email));

-- 4. Public Verification Narrow RPC: get_public_certificate
-- Security Definer function returning strictly public certificate metadata without PII or internal IDs.
create or replace function get_public_certificate(_public_id text)
returns table (
  public_id text,
  recipient_name text,
  title text,
  issued_at timestamptz,
  status text,
  revoked_at timestamptz,
  revoked_reason text,
  org_name text,
  org_verified boolean,
  org_logo text,
  brand_color text,
  pdf_sha256 text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.public_id,
    c.recipient_name,
    coalesce(c.data->>'title', c.data->>'course', 'Certificate of Completion'),
    c.issued_at,
    c.status,
    c.revoked_at,
    case when c.show_revoked_reason then c.revoked_reason else null end,
    o.name,
    o.verified,
    o.logo_path,
    o.brand_color,
    c.pdf_sha256
  from certificates c
  join orgs o on o.id = c.org_id
  where c.public_id = _public_id
    and c.status in ('issued', 'revoked');
$$;

revoke all on function get_public_certificate from public;
grant execute on function get_public_certificate to anon, authenticated, service_role;

-- 5. Helper Function: increment_certificate_download
-- Strictly restricted to service_role to ensure all downloads are gated by rate-limiting route handlers.
create or replace function increment_certificate_download(_public_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update certificates
     set download_count = download_count + 1
   where public_id = _public_id;
$$;

revoke all on function increment_certificate_download from public, anon, authenticated;
grant execute on function increment_certificate_download to service_role;

-- 6. Row Level Security Policies

-- verification_events
alter table verification_events enable row level security;

drop policy if exists verification_events_insert on verification_events;
create policy verification_events_insert on verification_events
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from certificates c
      where c.public_id = verification_events.public_id
        and c.status in ('issued', 'revoked')
    )
  );

drop policy if exists verification_events_select on verification_events;
create policy verification_events_select on verification_events
  for select
  to authenticated
  using (
    exists (
      select 1 from certificates c
      where c.public_id = verification_events.public_id
        and is_member(c.org_id)
    )
  );

-- abuse_reports
alter table abuse_reports enable row level security;

drop policy if exists abuse_reports_insert on abuse_reports;
create policy abuse_reports_insert on abuse_reports
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and exists (
      select 1 from certificates c
      where c.public_id = abuse_reports.public_id
        and c.status in ('issued', 'revoked')
    )
  );

drop policy if exists abuse_reports_select on abuse_reports;
create policy abuse_reports_select on abuse_reports
  for select
  to authenticated
  using (
    exists (
      select 1 from certificates c
      where c.public_id = abuse_reports.public_id
        and has_role(c.org_id, '{owner,admin}')
    )
  );

-- email_suppressions (Service Role Only)
alter table email_suppressions enable row level security;
-- No user policies: managed exclusively via background workers & webhooks using service role

-- Migration: 20261025000005_batches_certificates_jobs_ledger.sql
-- Work 7: Batches, Certificates, Background Jobs, and Credit Ledger
-- Audited & approved with security hardening by db-security-reviewer

-- 1. Create batches table
create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  template_id uuid not null references templates(id),
  name text not null,
  status text not null default 'draft' check (status in
    ('draft','queued','generating','delivering','completed','completed_with_errors','failed','canceled')),
  total int not null default 0 check (total >= 0),
  generated int not null default 0 check (generated >= 0),
  failed int not null default 0 check (failed >= 0),
  delivered int not null default 0 check (delivered >= 0),
  delivery_mode text not null default 'email' check (delivery_mode in ('email','none')),
  email_subject text,
  email_body text,
  credits_reserved int not null default 0 check (credits_reserved >= 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists batches_org_created_idx on batches (org_id, created_at desc);
create index if not exists batches_status_idx on batches (status);

-- 2. Create certificates table
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,                        -- e.g. CV-26-7K3M9QXT
  org_id uuid not null references orgs(id) on delete cascade,
  batch_id uuid references batches(id) on delete set null,
  template_id uuid references templates(id),
  recipient_name text not null,
  recipient_email text,
  data jsonb not null default '{}'::jsonb,               -- custom fields (course, date, grade, etc.)
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

create index if not exists certificates_org_created_idx on certificates (org_id, created_at desc);
create index if not exists certificates_batch_status_idx on certificates (batch_id, status);
create index if not exists certificates_email_idx on certificates (org_id, lower(recipient_email));
create index if not exists certificates_name_trgm on certificates using gin (recipient_name gin_trgm_ops);

-- 3. Create jobs table (table-backed queue)
create table if not exists jobs (
  id bigserial primary key,
  type text not null check (type in ('generate_chunk','send_email_chunk','export','invoice','cleanup')),
  payload jsonb not null,
  status text not null default 'queued' check (status in ('queued','running','done','failed')),
  run_at timestamptz not null default now(),
  attempts int not null default 0,
  max_attempts int not null default 5,
  locked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create index if not exists jobs_status_run_at_idx on jobs (status, run_at);

-- 4. Create credit_ledger table (append-only)
create table if not exists credit_ledger (
  id bigserial primary key,
  org_id uuid not null references orgs(id) on delete cascade,
  delta int not null,
  reason text not null check (reason in
    ('grant_free','purchase','plan_grant','issue_reserve','issue_refund','adjustment','expiry')),
  ref_type text,
  ref_id text,
  created_at timestamptz not null default now()
);

create index if not exists credit_ledger_org_idx on credit_ledger (org_id, created_at desc);

-- 5. Money & Credit Function: apply_credit_delta
-- Atomic update of org credit_balance with immutable ledger record.
-- DB CHECK (credit_balance >= 0) on orgs ensures balances never drop below zero.
create or replace function apply_credit_delta(
  _org uuid,
  _delta int,
  _reason text,
  _ref_type text default null,
  _ref_id text default null
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  new_bal int;
begin
  update orgs
     set credit_balance = credit_balance + _delta
   where id = _org
  returning credit_balance into new_bal;

  if not found then
    raise exception 'Organization % not found', _org;
  end if;

  insert into credit_ledger (org_id, delta, reason, ref_type, ref_id)
  values (_org, _delta, _reason, _ref_type, _ref_id);

  return new_bal;
end $$;

revoke all on function apply_credit_delta from public, anon, authenticated;
grant execute on function apply_credit_delta to service_role;

-- 6. Job Claiming Function: claim_jobs
-- Uses FOR UPDATE SKIP LOCKED to prevent double-claiming under concurrent workers.
create or replace function claim_jobs(_limit int default 4)
returns setof jobs
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Fail stale jobs that exceeded max_attempts
  update jobs
     set status = 'failed',
         locked_at = null,
         last_error = coalesce(last_error, 'Terminated: exceeded max attempts after timeout')
   where status = 'running'
     and locked_at < now() - interval '5 minutes'
     and attempts >= max_attempts;

  -- Recover recoverable stale jobs
  update jobs
     set status = 'queued',
         locked_at = null
   where status = 'running'
     and locked_at < now() - interval '5 minutes'
     and attempts < max_attempts;

  -- Atomically claim queued jobs ready for execution
  return query
  update jobs
     set status = 'running',
         locked_at = now(),
         attempts = attempts + 1
   where id in (
     select id from jobs
      where status = 'queued'
        and run_at <= now()
      order by run_at asc
      for update skip locked
      limit _limit
   )
  returning *;
end $$;

revoke all on function claim_jobs from public, anon, authenticated;
grant execute on function claim_jobs to service_role;

-- 7. Storage Bucket: private 'certificates' bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'certificates',
  'certificates',
  false,
  10485760, -- 10MB limit per PDF
  array['application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['application/pdf'];

-- 8. Row Level Security Policies

-- Batches RLS
alter table batches enable row level security;

drop policy if exists batches_select on batches;
create policy batches_select on batches
  for select
  to authenticated
  using (is_member(org_id));

drop policy if exists batches_insert on batches;
create policy batches_insert on batches
  for insert
  to authenticated
  with check (has_role(org_id, '{owner,admin,issuer}'));

drop policy if exists batches_update on batches;
create policy batches_update on batches
  for update
  to authenticated
  using (has_role(org_id, '{owner,admin,issuer}'))
  with check (has_role(org_id, '{owner,admin,issuer}'));

drop policy if exists batches_delete on batches;
create policy batches_delete on batches
  for delete
  to authenticated
  using (has_role(org_id, '{owner,admin}'));

-- Certificates RLS
alter table certificates enable row level security;

drop policy if exists cert_select on certificates;
create policy cert_select on certificates
  for select
  to authenticated
  using (is_member(org_id));

drop policy if exists cert_insert on certificates;
create policy cert_insert on certificates
  for insert
  to authenticated
  with check (has_role(org_id, '{owner,admin,issuer}'));

drop policy if exists cert_update on certificates;
create policy cert_update on certificates
  for update
  to authenticated
  using (has_role(org_id, '{owner,admin}'))
  with check (has_role(org_id, '{owner,admin}'));

-- Certificates are never hard deleted by users

-- Jobs (Service Role Only)
alter table jobs enable row level security;
-- No user policies on jobs table: accessible exclusively via service role

-- Credit Ledger (Read-only for org members, append-only via apply_credit_delta)
alter table credit_ledger enable row level security;

drop policy if exists credit_ledger_select on credit_ledger;
create policy credit_ledger_select on credit_ledger
  for select
  to authenticated
  using (is_member(org_id));

-- Storage: private certificates bucket RLS
drop policy if exists "certificates_storage_select" on storage.objects;
create policy "certificates_storage_select" on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'certificates'
    and exists (
      select 1 from public.org_members
      where org_members.org_id::text = (storage.foldername(name))[1]
        and org_members.user_id = auth.uid()
    )
  );

drop policy if exists "certificates_storage_insert" on storage.objects;
create policy "certificates_storage_insert" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'certificates'
    and exists (
      select 1 from public.org_members
      where org_members.org_id::text = (storage.foldername(name))[1]
        and org_members.user_id = auth.uid()
        and org_members.role in ('owner', 'admin', 'issuer')
    )
  );

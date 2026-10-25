-- Migration: 20261025000007_exports_and_revocation.sql
-- Work 9: Exports Table, Private Exports Storage Bucket, and Certificate Correction / Archive Support

-- 1. Add archived_pdfs to certificates table for non-destructive reissue/corrections
alter table certificates add column if not exists archived_pdfs jsonb not null default '[]'::jsonb;

-- 2. Create exports table
create table if not exists exports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  batch_id uuid references batches(id) on delete set null,
  kind text not null check (kind in ('zip', 'merged_pdf', 'report_csv', 'links_csv')),
  filter jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued', 'running', 'ready', 'failed', 'expired')),
  parts jsonb not null default '[]'::jsonb,
  expires_at timestamptz not null default (now() + interval '7 days'),
  requested_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Indexes on foreign keys and queries
create index if not exists exports_org_created_idx on exports (org_id, created_at desc);
create index if not exists exports_batch_id_idx on exports (batch_id);
create index if not exists exports_requested_by_idx on exports (requested_by);
create index if not exists exports_status_expires_idx on exports (status, expires_at);

-- 3. Row Level Security Policies for exports
alter table exports enable row level security;

drop policy if exists exports_select on exports;
create policy exports_select on exports
  for select
  to authenticated
  using (is_member(org_id));

drop policy if exists exports_insert on exports;
create policy exports_insert on exports
  for insert
  to authenticated
  with check (has_role(org_id, '{owner,admin,issuer}'));

drop policy if exists exports_update on exports;
create policy exports_update on exports
  for update
  to authenticated
  using (has_role(org_id, '{owner,admin}'))
  with check (has_role(org_id, '{owner,admin}'));

drop policy if exists exports_delete on exports;
create policy exports_delete on exports
  for delete
  to authenticated
  using (has_role(org_id, '{owner,admin}'));

-- 4. Storage Bucket: private 'exports' bucket (500MB per file limit)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exports',
  'exports',
  false,
  524288000, -- 500MB limit per export part
  array['application/zip', 'application/x-zip-compressed', 'application/pdf', 'text/csv']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 524288000,
  allowed_mime_types = array['application/zip', 'application/x-zip-compressed', 'application/pdf', 'text/csv'];

-- 5. Storage RLS Policies for 'exports' bucket
-- Export parts stored as: {org_id}/{export_id}/part-N.*
drop policy if exists "exports_storage_select" on storage.objects;
create policy "exports_storage_select" on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'exports'
    and exists (
      select 1 from public.org_members
      where org_members.org_id::text = (storage.foldername(name))[1]
        and org_members.user_id = auth.uid()
    )
  );

drop policy if exists "exports_storage_delete" on storage.objects;
create policy "exports_storage_delete" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'exports'
    and exists (
      select 1 from public.org_members
      where org_members.org_id::text = (storage.foldername(name))[1]
        and org_members.user_id = auth.uid()
        and org_members.role in ('owner', 'admin')
    )
  );

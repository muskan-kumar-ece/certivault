-- ==============================================================================
-- CertiVault Migration: Templates Table & Storage (Work 6)
-- Table: templates
-- Storage Bucket: templates (private)
-- RLS: Strict multi-tenant access + global read-only platform presets (org_id is null)
-- ==============================================================================

-- 1. Create templates table
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.orgs(id) on delete cascade, -- null = platform preset
  name text not null,
  page_size text not null default 'A4-landscape' check (page_size in ('A4-landscape', 'A4-portrait', 'A3-landscape', 'custom')),
  schema jsonb not null,                                    -- pdfme template definition
  background_path text,
  thumbnail_path text,
  field_keys text[] not null default '{}',                  -- e.g. {name, course, date, id, qr}
  archived_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists templates_org_idx on public.templates (org_id);
create index if not exists templates_created_at_idx on public.templates (created_at desc);

-- 2. Enable RLS
alter table public.templates enable row level security;

-- 3. Row Level Security Policies for templates

-- 3.1 SELECT: Members can read their organization's templates OR platform presets (org_id is null)
drop policy if exists "templates_select" on public.templates;
create policy "templates_select"
on public.templates for select
to authenticated
using (
  org_id is null
  or exists (
    select 1 from public.org_members
    where org_members.org_id = templates.org_id
      and org_members.user_id = auth.uid()
  )
);

-- 3.2 INSERT: Owners, admins, and issuers can create templates for their organization
-- Users can never create platform presets (org_id must not be null)
drop policy if exists "templates_insert" on public.templates;
create policy "templates_insert"
on public.templates for insert
to authenticated
with check (
  org_id is not null
  and exists (
    select 1 from public.org_members
    where org_members.org_id = templates.org_id
      and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'admin', 'issuer')
  )
);

-- 3.3 UPDATE: Owners, admins, and issuers can update their organization's templates
-- Presets (org_id is null) can never be updated by standard users
drop policy if exists "templates_update" on public.templates;
create policy "templates_update"
on public.templates for update
to authenticated
using (
  org_id is not null
  and exists (
    select 1 from public.org_members
    where org_members.org_id = templates.org_id
      and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'admin', 'issuer')
  )
)
with check (
  org_id is not null
  and exists (
    select 1 from public.org_members
    where org_members.org_id = templates.org_id
      and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'admin', 'issuer')
  )
);

-- 3.4 DELETE: Only owners and admins can delete organization templates
-- Presets can never be deleted
drop policy if exists "templates_delete" on public.templates;
create policy "templates_delete"
on public.templates for delete
to authenticated
using (
  org_id is not null
  and exists (
    select 1 from public.org_members
    where org_members.org_id = templates.org_id
      and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'admin')
  )
);

-- 4. Storage Bucket: templates (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'templates',
  'templates',
  false,
  5242880, -- 5 MB limit (PRD §14)
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

-- 5. Storage RLS Policies for 'templates' bucket
-- Files are organized by path prefix: {org_id}/{template_id}/bg.* or presets/...

-- 5.1 Storage Select: Org members can view their template assets; presets are viewable by all authenticated
drop policy if exists "templates_storage_select" on storage.objects;
create policy "templates_storage_select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'templates'
  and (
    (storage.foldername(name))[1] = 'presets'
    or exists (
      select 1 from public.org_members
      where org_members.org_id::text = (storage.foldername(name))[1]
        and org_members.user_id = auth.uid()
    )
  )
);

-- 5.2 Storage Insert: Owners, admins, and issuers can upload template assets to their org folder
drop policy if exists "templates_storage_insert" on storage.objects;
create policy "templates_storage_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'templates'
  and exists (
    select 1 from public.org_members
    where org_members.org_id::text = (storage.foldername(name))[1]
      and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'admin', 'issuer')
  )
);

-- 5.3 Storage Update: Owners, admins, and issuers can update template assets in their org folder
drop policy if exists "templates_storage_update" on storage.objects;
create policy "templates_storage_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'templates'
  and exists (
    select 1 from public.org_members
    where org_members.org_id::text = (storage.foldername(name))[1]
      and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'admin', 'issuer')
  )
)
with check (
  bucket_id = 'templates'
  and exists (
    select 1 from public.org_members
    where org_members.org_id::text = (storage.foldername(name))[1]
      and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'admin', 'issuer')
  )
);

-- 5.4 Storage Delete: Only owners and admins can delete template assets
drop policy if exists "templates_storage_delete" on storage.objects;
create policy "templates_storage_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'templates'
  and exists (
    select 1 from public.org_members
    where org_members.org_id::text = (storage.foldername(name))[1]
      and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'admin')
  )
);

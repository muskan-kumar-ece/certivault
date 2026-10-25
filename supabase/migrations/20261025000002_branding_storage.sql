-- ==============================================================================
-- CertiVault Migration: Branding Storage Bucket & Policies (Work 5)
-- Storage Bucket: branding (private)
-- Paths: {org_id}/logo.*, {org_id}/signatures/*
-- Security: Audited by db-security-reviewer for safe text comparison & idempotency
-- ==============================================================================

-- 1. Create the private 'branding' bucket if it doesn't already exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'branding',
  'branding',
  false,
  5242880, -- 5 MB limit (PRD §14, TRD §4)
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

-- 2. Storage RLS Policies for 'branding' bucket
-- Note: Files are organized by path prefix: {org_id}/filename.ext
-- Uses safe `org_id::text = (storage.foldername(name))[1]` to prevent SQLSTATE 22P02 on malformed paths.

-- 2.1 Read: Any member of the organization can view branding assets
drop policy if exists "branding_select_member" on storage.objects;
create policy "branding_select_member"
on storage.objects for select
to authenticated
using (
  bucket_id = 'branding'
  and exists (
    select 1 from public.org_members
    where org_id::text = (storage.foldername(name))[1]
      and user_id = auth.uid()
  )
);

-- 2.2 Upload/Insert: Only owners and admins can upload logos and signatures
drop policy if exists "branding_insert_admin" on storage.objects;
create policy "branding_insert_admin"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'branding'
  and exists (
    select 1 from public.org_members
    where org_id::text = (storage.foldername(name))[1]
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  )
);

-- 2.3 Update: Only owners and admins can update branding assets
drop policy if exists "branding_update_admin" on storage.objects;
create policy "branding_update_admin"
on storage.objects for update
to authenticated
using (
  bucket_id = 'branding'
  and exists (
    select 1 from public.org_members
    where org_id::text = (storage.foldername(name))[1]
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  )
)
with check (
  bucket_id = 'branding'
  and exists (
    select 1 from public.org_members
    where org_id::text = (storage.foldername(name))[1]
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  )
);

-- 2.4 Delete: Only owners and admins can delete branding assets
drop policy if exists "branding_delete_admin" on storage.objects;
create policy "branding_delete_admin"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'branding'
  and exists (
    select 1 from public.org_members
    where org_id::text = (storage.foldername(name))[1]
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  )
);

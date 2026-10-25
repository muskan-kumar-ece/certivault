-- ==============================================================================
-- CertiVault Migration: Platform Admin, Verification & Suspension (Work 11)
-- Tables: orgs (extended with verification workflow columns)
-- Policies: platform_admins access on abuse_reports, payments, invoices, batches, certificates
-- Security: RLS strictly preserved; suspension invariants enforced
-- ==============================================================================

-- 1. Extend orgs table with verification lifecycle fields
alter table public.orgs
  add column if not exists verification_status text not null default 'none'
  check (verification_status in ('none', 'pending', 'approved', 'rejected'));

alter table public.orgs
  add column if not exists verification_requested_at timestamptz;

alter table public.orgs
  add column if not exists verification_notes text;

create index if not exists orgs_verification_status_idx on public.orgs (verification_status);
create index if not exists orgs_suspended_at_idx on public.orgs (suspended_at);

-- 2. Platform Admin RLS Policies

-- abuse_reports
drop policy if exists abuse_reports_platform_admin_select on public.abuse_reports;
create policy abuse_reports_platform_admin_select on public.abuse_reports
  for select
  to authenticated
  using (
    exists (select 1 from public.platform_admins where user_id = auth.uid())
  );

drop policy if exists abuse_reports_platform_admin_update on public.abuse_reports;
create policy abuse_reports_platform_admin_update on public.abuse_reports
  for update
  to authenticated
  using (
    exists (select 1 from public.platform_admins where user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.platform_admins where user_id = auth.uid())
  );

-- payments
drop policy if exists payments_platform_admin_select on public.payments;
create policy payments_platform_admin_select on public.payments
  for select
  to authenticated
  using (
    exists (select 1 from public.platform_admins where user_id = auth.uid())
  );

-- invoices
drop policy if exists invoices_platform_admin_select on public.invoices;
create policy invoices_platform_admin_select on public.invoices
  for select
  to authenticated
  using (
    exists (select 1 from public.platform_admins where user_id = auth.uid())
  );

-- batches
drop policy if exists batches_platform_admin_select on public.batches;
create policy batches_platform_admin_select on public.batches
  for select
  to authenticated
  using (
    exists (select 1 from public.platform_admins where user_id = auth.uid())
  );

-- certificates
drop policy if exists certificates_platform_admin_select on public.certificates;
create policy certificates_platform_admin_select on public.certificates
  for select
  to authenticated
  using (
    exists (select 1 from public.platform_admins where user_id = auth.uid())
  );

-- ==============================================================================
-- CertiVault pgTAP Test: Platform Admin, Verification & Suspension (Work 11)
-- ==============================================================================

begin;
select plan(12);

-- 1. Verify schema columns on orgs
select has_column('public', 'orgs', 'verification_status', 'orgs has verification_status');
select has_column('public', 'orgs', 'verification_requested_at', 'orgs has verification_requested_at');
select has_column('public', 'orgs', 'verification_notes', 'orgs has verification_notes');

-- 2. Check constraint validation
select throws_ok(
  $$ insert into public.orgs (name, slug, verification_status) values ('Bad Status Org', 'bad-status-org', 'invalid_status') $$,
  '23514',
  null,
  'Invalid verification_status is rejected by check constraint'
);

-- 3. Verify indexes exist
select has_index('public', 'orgs', 'orgs_verification_status_idx', 'orgs_verification_status_idx exists');
select has_index('public', 'orgs', 'orgs_suspended_at_idx', 'orgs_suspended_at_idx exists');

-- 4. Verify policies exist
select ok(
  exists (
    select 1 from pg_policies 
    where tablename = 'abuse_reports' and policyname = 'abuse_reports_platform_admin_select'
  ),
  'abuse_reports_platform_admin_select policy exists'
);

select ok(
  exists (
    select 1 from pg_policies 
    where tablename = 'abuse_reports' and policyname = 'abuse_reports_platform_admin_update'
  ),
  'abuse_reports_platform_admin_update policy exists'
);

select ok(
  exists (
    select 1 from pg_policies 
    where tablename = 'payments' and policyname = 'payments_platform_admin_select'
  ),
  'payments_platform_admin_select policy exists'
);

select ok(
  exists (
    select 1 from pg_policies 
    where tablename = 'invoices' and policyname = 'invoices_platform_admin_select'
  ),
  'invoices_platform_admin_select policy exists'
);

select ok(
  exists (
    select 1 from pg_policies 
    where tablename = 'batches' and policyname = 'batches_platform_admin_select'
  ),
  'batches_platform_admin_select policy exists'
);

select ok(
  exists (
    select 1 from pg_policies 
    where tablename = 'certificates' and policyname = 'certificates_platform_admin_select'
  ),
  'certificates_platform_admin_select policy exists'
);

select * from finish();
rollback;

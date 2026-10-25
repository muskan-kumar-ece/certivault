-- pgTAP Test Suite for Work 8: Verification & Email
begin;
select plan(7);

-- 1. Verify tables exist
select has_table('verification_events', 'verification_events table exists');
select has_table('abuse_reports', 'abuse_reports table exists');
select has_table('email_suppressions', 'email_suppressions table exists');

-- 2. Verify functions exist
select has_function('get_public_certificate', array['text'], 'get_public_certificate RPC exists');
select has_function('increment_certificate_download', array['text'], 'increment_certificate_download exists');

-- 3. Verify RLS is enabled on new tables
select row_eq(
  $$ select relrowsecurity from pg_class where relname = 'verification_events' $$,
  $$ values (true) $$,
  'RLS is enabled on verification_events'
);

select row_eq(
  $$ select relrowsecurity from pg_class where relname = 'abuse_reports' $$,
  $$ values (true) $$,
  'RLS is enabled on abuse_reports'
);

select * from finish();
rollback;

-- pgTAP Test Suite for Work 7: Batches, Certificates, Jobs, and Credit Ledger
begin;
select plan(8);

-- 1. Verify tables exist
select has_table('batches', 'batches table exists');
select has_table('certificates', 'certificates table exists');
select has_table('jobs', 'jobs table exists');
select has_table('credit_ledger', 'credit_ledger table exists');

-- 2. Verify RLS is enabled on all tables
select row_eq(
  $$ select relrowsecurity from pg_class where relname = 'batches' $$,
  $$ values (true) $$,
  'RLS is enabled on batches'
);

select row_eq(
  $$ select relrowsecurity from pg_class where relname = 'certificates' $$,
  $$ values (true) $$,
  'RLS is enabled on certificates'
);

select row_eq(
  $$ select relrowsecurity from pg_class where relname = 'jobs' $$,
  $$ values (true) $$,
  'RLS is enabled on jobs'
);

select row_eq(
  $$ select relrowsecurity from pg_class where relname = 'credit_ledger' $$,
  $$ values (true) $$,
  'RLS is enabled on credit_ledger'
);

select * from finish();
rollback;

-- pgTAP Test Suite for Work 9: Exports & Revocation
begin;
select plan(7);

-- 1. Verify exports table exists
select has_table('exports', 'exports table exists');

-- 2. Verify archived_pdfs column exists on certificates
select has_column('certificates', 'archived_pdfs', 'certificates.archived_pdfs column exists');

-- 3. Verify RLS is enabled on exports
select row_eq(
  $$ select relrowsecurity from pg_class where relname = 'exports' $$,
  $$ values (true) $$,
  'RLS is enabled on exports'
);

-- 4. Verify indexes exist
select has_index('exports', 'exports_org_created_idx', 'exports_org_created_idx exists');
select has_index('exports', 'exports_batch_id_idx', 'exports_batch_id_idx exists');

-- 5. Verify exports bucket exists
select row_eq(
  $$ select count(*)::int from storage.buckets where id = 'exports' and public = false $$,
  $$ values (1) $$,
  'exports bucket is private'
);

-- 6. Verify export kinds
select col_type_is('exports', 'kind', 'text', 'exports.kind is text');

select * from finish();
rollback;

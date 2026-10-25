-- pgTAP Test Suite for Work 10: Payments & Invoices
begin;
select plan(7);

-- 1. Verify tables exist
select has_table('payments', 'payments table exists');
select has_table('invoices', 'invoices table exists');
select has_table('webhook_events', 'webhook_events table exists');

-- 2. Verify functions exist
select has_function('generate_invoice_number', array['text'], 'generate_invoice_number function exists');

-- 3. Test generate_invoice_number produces sequential numbers
select is(
  generate_invoice_number('2026-27'),
  'CV/2026-27/000001',
  'First invoice number is CV/2026-27/000001'
);

select is(
  generate_invoice_number('2026-27'),
  'CV/2026-27/000002',
  'Second invoice number is CV/2026-27/000002'
);

-- 4. Verify RLS is enabled on payments
select row_eq(
  $$ select relrowsecurity from pg_class where relname = 'payments' $$,
  $$ values (true) $$,
  'RLS is enabled on payments'
);

select * from finish();
rollback;

-- Migration: 20261025000008_payments_and_invoices.sql
-- Work 10: Payments, Invoices, Webhook Deduplication, and Private Invoices Storage Bucket
-- Hardened per db-security-reviewer audit recommendations

-- 1. Create payments table
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  order_id text unique not null,
  payment_id text,
  product_code text not null check (product_code in ('pack_event', 'pack_club', 'pack_bulk', 'plan_campus')),
  amount_paise int not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  status text not null default 'created' check (status in ('created', 'paid', 'failed', 'refunded')),
  gst_breakdown jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  fulfilled_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists payments_org_created_idx on payments (org_id, created_at desc);
create index if not exists payments_order_id_idx on payments (order_id);
create unique index if not exists payments_payment_id_idx on payments (payment_id) where payment_id is not null;
create index if not exists payments_status_idx on payments (status);

-- 2. Create invoice_counters table for atomic gapless invoice numbers per FY
create table if not exists invoice_counters (
  financial_year text primary key,
  last_number int not null default 0
);

-- RLS enabled on invoice_counters (no user policies; service-role only)
alter table invoice_counters enable row level security;

-- Function: generate_invoice_number (returns e.g. 'CV/2026-27/000001')
create or replace function generate_invoice_number(_fy text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_num int;
begin
  insert into invoice_counters (financial_year, last_number)
  values (_fy, 1)
  on conflict (financial_year)
  do update set last_number = invoice_counters.last_number + 1
  returning last_number into next_num;

  return 'CV/' || _fy || '/' || lpad(next_num::text, 6, '0');
end;
$$;

revoke all on function generate_invoice_number from public, anon, authenticated;
grant execute on function generate_invoice_number to service_role;

-- 3. Create invoices table
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  payment_id uuid not null references payments(id) on delete cascade,
  invoice_number text unique not null,
  financial_year text not null,
  pdf_path text,
  amount_paise int not null check (amount_paise > 0),
  tax_paise int not null default 0 check (tax_paise >= 0),
  recipient_gstin text,
  created_at timestamptz not null default now()
);

create index if not exists invoices_org_created_idx on invoices (org_id, created_at desc);
create index if not exists invoices_payment_id_idx on invoices (payment_id);
create index if not exists invoices_number_idx on invoices (invoice_number);

-- 4. Create webhook_events table for idempotent event deduplication
create table if not exists webhook_events (
  id bigserial primary key,
  provider text not null check (provider in ('razorpay', 'resend')),
  event_id text unique not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now()
);

create index if not exists webhook_events_provider_idx on webhook_events (provider, event_id);
create index if not exists webhook_events_processed_idx on webhook_events (processed_at desc);

-- 5. Row Level Security Policies

-- payments
alter table payments enable row level security;

drop policy if exists payments_select on payments;
create policy payments_select on payments
  for select
  to authenticated
  using (has_role(org_id, '{owner,admin}'));

drop policy if exists payments_insert on payments;
create policy payments_insert on payments
  for insert
  to authenticated
  with check (has_role(org_id, '{owner,admin}'));

-- Explicitly no payments_update: status mutations restricted strictly to service_role
drop policy if exists payments_update on payments;

-- invoices
alter table invoices enable row level security;

drop policy if exists invoices_select on invoices;
create policy invoices_select on invoices
  for select
  to authenticated
  using (has_role(org_id, '{owner,admin}'));

-- webhook_events (Service Role Only)
alter table webhook_events enable row level security;
-- No user policies: accessible strictly via service role for background webhook processing

-- 6. Storage Bucket: private 'invoices' bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invoices',
  'invoices',
  false,
  10485760, -- 10MB limit per PDF invoice
  array['application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['application/pdf'];

-- 7. Storage RLS Policies for 'invoices' bucket
-- Invoices stored as: {org_id}/{FY}/{number}.pdf
-- Strictly confined to owner and admin per architecture.md §5
drop policy if exists "invoices_storage_select" on storage.objects;
create policy "invoices_storage_select" on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'invoices'
    and exists (
      select 1 from public.org_members
      where org_members.org_id::text = (storage.foldername(name))[1]
        and org_members.user_id = auth.uid()
        and org_members.role in ('owner', 'admin')
    )
  );

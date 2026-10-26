-- Migration: 20261026000001_security_and_pipeline_fixes.sql
-- Description: Security hardening, atomic batch counters, credit update protection, and invoice uniqueness

-- 1. Atomic batch counter increment function for background worker
create or replace function public.increment_batch_counter(
  _batch_id uuid,
  _is_generated boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if _is_generated then
    update public.batches
    set generated = generated + 1,
        updated_at = now()
    where id = _batch_id;
  else
    update public.batches
    set failed = failed + 1,
        updated_at = now()
    where id = _batch_id;
  end if;
end;
$$;

revoke all on function public.increment_batch_counter(uuid, boolean) from public, anon, authenticated;
grant execute on function public.increment_batch_counter(uuid, boolean) to service_role;

-- 2. Prevent direct mutation of credit_balance, plan, verified, and suspended_at by client roles
create or replace function public.protect_org_sensitive_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only service_role is allowed to alter credit_balance, plan, verified, and suspended_at
  if auth.role() <> 'service_role' then
    if old.credit_balance is distinct from new.credit_balance then
      raise exception 'Direct modification of credit_balance is forbidden. Use apply_credit_delta.'
        using errcode = '42501';
    end if;

    if old.plan is distinct from new.plan then
      raise exception 'Direct modification of plan is forbidden. Complete upgrade checkout.'
        using errcode = '42501';
    end if;

    if old.verified is distinct from new.verified then
      raise exception 'Direct modification of verified status is forbidden. Submit verification review.'
        using errcode = '42501';
    end if;

    if old.suspended_at is distinct from new.suspended_at then
      raise exception 'Direct modification of suspended_at is forbidden.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_org_sensitive_columns on public.orgs;
create trigger trg_protect_org_sensitive_columns
  before update on public.orgs
  for each row
  execute function public.protect_org_sensitive_columns();

-- 3. Idempotent Invoices: Ensure one invoice per payment
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'invoices_payment_id_key'
  ) then
    alter table public.invoices add constraint invoices_payment_id_key unique (payment_id);
  end if;
end $$;

-- 4. Enforce Organization Active status in has_role
create or replace function public.has_role(_org_id uuid, _roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.org_members m
    join public.orgs o on o.id = m.org_id
    where m.org_id = _org_id
      and m.user_id = auth.uid()
      and m.role = any(_roles)
      and o.suspended_at is null
  );
$$;

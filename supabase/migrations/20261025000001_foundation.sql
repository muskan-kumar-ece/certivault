-- ==============================================================================
-- CertiVault Migration: Foundation (Work 2)
-- Tables: orgs, org_members, invitations, signatories, platform_admins, audit_logs
-- Functions: is_member, has_role
-- Security: RLS enabled on all tables with explicit role-based policies
-- ==============================================================================

-- 1. Extensions
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- 2. Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'org_role') then
    create type org_role as enum ('owner', 'admin', 'issuer', 'viewer');
  end if;
end $$;

-- 3. Tables

-- 3.1 Organization Table
create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  kind text not null default 'other' check (kind in ('club', 'college', 'university', 'other')),
  logo_path text,
  brand_color text default '#3355FF',
  verified boolean not null default false,
  plan text not null default 'free' check (plan in ('free', 'campus', 'university')),
  plan_expires_at timestamptz,
  credit_balance int not null default 0 check (credit_balance >= 0),
  verify_subdomain text unique,
  gstin text,
  billing jsonb not null default '{}',
  suspended_at timestamptz,
  created_at timestamptz not null default now()
);

-- 3.2 Organization Members Table
create table if not exists public.org_members (
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role org_role not null,
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index if not exists org_members_user_idx on public.org_members (user_id);

-- 3.3 Invitations Table
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  email text not null,
  role org_role not null,
  token_hash text not null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists invitations_org_idx on public.invitations (org_id);
create index if not exists invitations_email_idx on public.invitations (lower(email));
create unique index if not exists invitations_token_hash_idx on public.invitations (token_hash);

-- 3.4 Signatories Table
create table if not exists public.signatories (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  title text,
  signature_path text,
  created_at timestamptz not null default now()
);
create index if not exists signatories_org_idx on public.signatories (org_id);

-- 3.5 Platform Admins Table
create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- 3.6 Audit Logs Table
create table if not exists public.audit_logs (
  id bigserial primary key,
  org_id uuid references public.orgs(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_org_idx on public.audit_logs (org_id, created_at desc);

-- 4. RLS Helper Functions (Security Definer with restricted search_path)

create or replace function public.is_member(_org uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.org_members
    where org_id = _org and user_id = auth.uid()
  );
$$;

create or replace function public.has_role(_org uuid, _roles org_role[])
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.org_members
    where org_id = _org and user_id = auth.uid() and role = any(_roles)
  );
$$;

grant execute on function public.is_member(uuid) to anon, authenticated;
grant execute on function public.has_role(uuid, org_role[]) to anon, authenticated;

-- 5. Row Level Security Policies

-- 5.1 orgs RLS
alter table public.orgs enable row level security;

create policy orgs_select on public.orgs
  for select using (
    public.is_member(id) or exists (select 1 from public.platform_admins where user_id = auth.uid())
  );

create policy orgs_insert on public.orgs
  for insert with check (
    auth.uid() is not null
  );

create policy orgs_update on public.orgs
  for update using (
    public.has_role(id, '{owner,admin}')
  );

-- 5.2 org_members RLS
alter table public.org_members enable row level security;

create policy org_members_select on public.org_members
  for select using (
    public.is_member(org_id) or exists (select 1 from public.platform_admins where user_id = auth.uid())
  );

create policy org_members_insert on public.org_members
  for insert with check (
    public.has_role(org_id, '{owner,admin}') or
    (user_id = auth.uid() and not exists (select 1 from public.org_members m where m.org_id = org_members.org_id))
  );

create policy org_members_update on public.org_members
  for update using (
    public.has_role(org_id, '{owner}')
  ) with check (
    public.has_role(org_id, '{owner}') and
    -- Prevent demoting the sole owner of an organization
    (role = 'owner' or (select count(*) from public.org_members m where m.org_id = org_members.org_id and m.role = 'owner') > 1)
  );

create policy org_members_delete on public.org_members
  for delete using (
    public.has_role(org_id, '{owner}') and
    -- Protect last owner from deletion while allowing non-owners to be deleted freely
    (role != 'owner' or (select count(*) from public.org_members m where m.org_id = org_members.org_id and m.role = 'owner') > 1)
  );

-- 5.3 invitations RLS
alter table public.invitations enable row level security;

create policy invitations_select on public.invitations
  for select using (
    public.is_member(org_id) or lower(email) = lower(auth.jwt()->>'email')
  );

create policy invitations_insert on public.invitations
  for insert with check (
    public.has_role(org_id, '{owner,admin}')
  );

create policy invitations_update on public.invitations
  for update using (
    public.has_role(org_id, '{owner,admin}')
  );

create policy invitations_delete on public.invitations
  for delete using (
    public.has_role(org_id, '{owner,admin}')
  );

-- 5.4 signatories RLS
alter table public.signatories enable row level security;

create policy signatories_select on public.signatories
  for select using (
    public.is_member(org_id)
  );

create policy signatories_insert on public.signatories
  for insert with check (
    public.has_role(org_id, '{owner,admin}')
  );

create policy signatories_update on public.signatories
  for update using (
    public.has_role(org_id, '{owner,admin}')
  );

create policy signatories_delete on public.signatories
  for delete using (
    public.has_role(org_id, '{owner,admin}')
  );

-- 5.5 platform_admins RLS
alter table public.platform_admins enable row level security;

create policy platform_admins_select on public.platform_admins
  for select using (
    user_id = auth.uid()
  );

-- 5.6 audit_logs RLS
alter table public.audit_logs enable row level security;

create policy audit_logs_select on public.audit_logs
  for select using (
    public.is_member(org_id) or exists (select 1 from public.platform_admins where user_id = auth.uid())
  );

create policy audit_logs_insert on public.audit_logs
  for insert with check (
    actor_id = auth.uid() and (org_id is null or public.is_member(org_id))
  );

-- E-CIRA Supabase schema
-- Run in the Supabase SQL editor.
-- Idempotent: safe to re-run.

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.org_members (
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create table if not exists public.org_invites (
  token uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  scores jsonb not null default '{}'::jsonb,
  diagnostics jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  unique (org_id, user_id)
);

create index if not exists assessments_org_idx on public.assessments(org_id);
create index if not exists org_members_user_idx on public.org_members(user_id);

-- ============================================================
-- Trigger: keep assessments.updated_at fresh
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_assessments_touch on public.assessments;
create trigger trg_assessments_touch
  before update on public.assessments
  for each row execute procedure public.touch_updated_at();

-- ============================================================
-- Trigger: create a profile row on sign-up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Helper: is the current user a member of this org?
-- SECURITY DEFINER so it can read org_members without recursive RLS.
-- ============================================================
create or replace function public.is_org_member(p_org_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.org_members
    where org_id = p_org_id and user_id = auth.uid()
  );
$$;

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.orgs          enable row level security;
alter table public.org_members   enable row level security;
alter table public.org_invites   enable row level security;
alter table public.assessments   enable row level security;

-- profiles
drop policy if exists "profiles: self read"   on public.profiles;
drop policy if exists "profiles: self update" on public.profiles;
create policy "profiles: self read"   on public.profiles for select using (id = auth.uid());
create policy "profiles: self update" on public.profiles for update using (id = auth.uid());

-- orgs: members can read; any authed user can create
drop policy if exists "orgs: member read"    on public.orgs;
drop policy if exists "orgs: authed insert"  on public.orgs;
drop policy if exists "orgs: creator update" on public.orgs;
create policy "orgs: member read"
  on public.orgs for select
  using (public.is_org_member(id));
create policy "orgs: authed insert"
  on public.orgs for insert
  with check (auth.uid() is not null and created_by = auth.uid());
create policy "orgs: creator update"
  on public.orgs for update
  using (created_by = auth.uid());

-- org_members
drop policy if exists "members: read own"    on public.org_members;
drop policy if exists "members: self insert" on public.org_members;
drop policy if exists "members: self delete" on public.org_members;
create policy "members: read own"
  on public.org_members for select
  using (user_id = auth.uid() or public.is_org_member(org_id));
-- Each user may add themselves to an org (used by invite-redemption flow + org-creator bootstrap).
-- For a tighter policy, route invites through an RPC.
create policy "members: self insert"
  on public.org_members for insert
  with check (user_id = auth.uid());
create policy "members: self delete"
  on public.org_members for delete
  using (user_id = auth.uid());

-- org_invites
drop policy if exists "invites: member read" on public.org_invites;
drop policy if exists "invites: member insert" on public.org_invites;
drop policy if exists "invites: member revoke" on public.org_invites;
create policy "invites: member read"
  on public.org_invites for select
  using (public.is_org_member(org_id));
create policy "invites: member insert"
  on public.org_invites for insert
  with check (public.is_org_member(org_id) and created_by = auth.uid());
create policy "invites: member revoke"
  on public.org_invites for update
  using (public.is_org_member(org_id));

-- assessments
drop policy if exists "assessments: org read"   on public.assessments;
drop policy if exists "assessments: self write" on public.assessments;
drop policy if exists "assessments: self update" on public.assessments;
drop policy if exists "assessments: self delete" on public.assessments;
create policy "assessments: org read"
  on public.assessments for select
  using (public.is_org_member(org_id));
create policy "assessments: self write"
  on public.assessments for insert
  with check (user_id = auth.uid() and public.is_org_member(org_id));
create policy "assessments: self update"
  on public.assessments for update
  using (user_id = auth.uid() and status = 'draft');
create policy "assessments: self delete"
  on public.assessments for delete
  using (user_id = auth.uid() and status = 'draft');

-- ============================================================
-- RPC: redeem an invite token (joins the caller to the org)
-- ============================================================
create or replace function public.redeem_invite(p_token uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_org uuid;
  v_revoked timestamptz;
begin
  if auth.uid() is null then
    raise exception 'must be signed in';
  end if;

  select org_id, revoked_at into v_org, v_revoked
  from public.org_invites
  where token = p_token;

  if v_org is null then
    raise exception 'invite not found';
  end if;
  if v_revoked is not null then
    raise exception 'invite revoked';
  end if;

  insert into public.org_members (org_id, user_id, role)
  values (v_org, auth.uid(), 'member')
  on conflict (org_id, user_id) do nothing;

  return v_org;
end $$;

grant execute on function public.redeem_invite(uuid) to authenticated;

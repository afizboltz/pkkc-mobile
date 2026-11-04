-- Baseline snapshot, reconstructed from the live stg project (gxyedsgrlacvmzvsivyi)
-- on 2026-11-03, for documentation/history purposes only.
--
-- The 6 migrations that actually created this schema (schema_core,
-- functions_and_triggers, rls_policies, storage_receipts_bucket,
-- rls_cleanup_and_hardening, seed_pkkc_id_seq_after_csv_import) were applied
-- directly via the Supabase dashboard/SQL editor and were never committed to
-- git. This file documents the resulting state as closely as possible so the
-- migration history in this repo starts from an accurate baseline going
-- forward. It is NOT meant to be (re-)applied to the stg project — every
-- object below already exists there. Treat this as a readable snapshot, not
-- an executable migration.

-- ============================================================
-- Enums
-- ============================================================
create type public.user_status as enum ('pending', 'active', 'inactive', 'rejected');
create type public.user_role as enum ('member', 'admin', 'ajk', 'user');
create type public.renewal_kind as enum ('payment', 'certificate');
create type public.renewal_status as enum ('pending', 'approved', 'rejected');

-- ============================================================
-- Tables
-- ============================================================

create table public.users (
  id uuid primary key references auth.users (id),
  email text unique,
  ic_no text unique check (ic_no is null or ic_no ~ '^[0-9]+$'),
  full_name text not null default '',
  phone_no text not null default '',
  birth_date date,
  gender text,
  marital_status text,
  kita_resident text,
  address text,
  number_of_family_members int,
  occupation text,
  status public.user_status not null default 'pending',
  role public.user_role not null default 'member',
  pkkc_id text unique,
  slip_bayaran_url text,
  ack boolean not null default false,
  membership_expiry date,
  approved_at timestamptz,
  approved_remark text,
  approved_by text,
  rejected_at timestamptz,
  rejected_remark text,
  rejected_by text,
  verified_at timestamptz,
  migrated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.renewals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id),
  kind public.renewal_kind not null,
  amount numeric not null default 0,
  status public.renewal_status not null default 'pending',
  payment_method text,
  screenshot_url text,
  certificate_url text,
  submitted_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_remark text,
  approved_by text,
  rejected_at timestamptz,
  rejected_remark text,
  rejected_by text
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text,
  message text,
  description text,
  images text[],
  date date,
  created_at timestamptz not null default now()
);

create table public.error_logs (
  id uuid primary key default gen_random_uuid(),
  "timestamp" timestamptz not null default now(),
  level text not null,
  category text,
  message text,
  data jsonb,
  user_id uuid references public.users (id),
  session_id text,
  device_info jsonb,
  stack_trace text,
  synced_at timestamptz default now()
);

create table public.error_reports (
  id uuid primary key default gen_random_uuid(),
  error_id text,
  "timestamp" timestamptz not null default now(),
  error_message text,
  error_stack text,
  user_id uuid references public.users (id),
  user_email text,
  action text,
  context jsonb,
  device_info jsonb,
  reproduction_steps text,
  user_feedback text,
  synced_at timestamptz default now()
);

create sequence public.pkkc_id_seq;

-- ============================================================
-- Functions / triggers
-- ============================================================

create or replace function private.is_staff()
returns boolean
language sql stable security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role in ('admin', 'ajk')
  );
$$;

create or replace function private.protect_privileged_user_columns()
returns trigger
language plpgsql security definer
set search_path to 'public'
as $$
begin
  if not private.is_staff() then
    new.status := old.status;
    new.role := old.role;
    new.pkkc_id := old.pkkc_id;
    new.membership_expiry := old.membership_expiry;
    new.approved_at := old.approved_at;
    new.approved_remark := old.approved_remark;
    new.approved_by := old.approved_by;
    new.rejected_at := old.rejected_at;
    new.rejected_remark := old.rejected_remark;
    new.rejected_by := old.rejected_by;
    new.verified_at := old.verified_at;
  end if;
  return new;
end;
$$;

create or replace function public.assign_pkkc_id()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if new.pkkc_id is null then
    new.pkkc_id := 'PKKC-' || lpad(nextval('public.pkkc_id_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create or replace function public.resolve_ic_to_email(p_ic_no text)
returns text
language sql stable security definer
set search_path to 'public'
as $$
  select email from public.users
  where ic_no = regexp_replace(p_ic_no, '\D', '', 'g')
  limit 1;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_assign_pkkc_id
  before insert on public.users
  for each row execute function public.assign_pkkc_id();

create trigger users_protect_privileged_columns
  before update on public.users
  for each row execute function private.protect_privileged_user_columns();

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

grant execute on function public.resolve_ic_to_email(text) to anon, authenticated;

-- ============================================================
-- RLS
-- ============================================================

alter table public.users enable row level security;
alter table public.renewals enable row level security;
alter table public.announcements enable row level security;
alter table public.error_logs enable row level security;
alter table public.error_reports enable row level security;

create policy users_insert_own on public.users for insert
  with check (auth.uid() = id);
create policy users_select on public.users for select
  using (auth.uid() = id or private.is_staff());
create policy users_update on public.users for update
  using (auth.uid() = id or private.is_staff())
  with check (auth.uid() = id or private.is_staff());

create policy renewals_insert_own on public.renewals for insert
  with check (user_id = auth.uid());
create policy renewals_select on public.renewals for select
  using (user_id = auth.uid() or private.is_staff());
create policy renewals_update_staff on public.renewals for update
  using (private.is_staff()) with check (private.is_staff());

create policy announcements_select_authenticated on public.announcements for select
  using (auth.role() = 'authenticated');
create policy announcements_insert_staff on public.announcements for insert
  with check (private.is_staff());
create policy announcements_update_staff on public.announcements for update
  using (private.is_staff()) with check (private.is_staff());
create policy announcements_delete_staff on public.announcements for delete
  using (private.is_staff());

create policy error_logs_insert on public.error_logs for insert
  with check (user_id = auth.uid() or user_id is null);
create policy error_logs_select on public.error_logs for select
  using (user_id = auth.uid() or private.is_staff());

create policy error_reports_insert on public.error_reports for insert
  with check (user_id = auth.uid() or user_id is null);
create policy error_reports_select on public.error_reports for select
  using (user_id = auth.uid() or private.is_staff());

-- Storage: private "receipts" bucket
insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false);

create policy receipts_insert_own on storage.objects for insert
  with check (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);
create policy receipts_select_own_or_staff on storage.objects for select
  using (bucket_id = 'receipts' and (auth.uid()::text = (storage.foldername(name))[1] or private.is_staff()));

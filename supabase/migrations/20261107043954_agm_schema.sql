-- AGM feature: event, codes, documents, resolutions, votes (schema only — no RLS yet).

-- ============================================================
-- Enums
-- ============================================================
create type public.agm_event_status as enum ('draft', 'active', 'closed');
create type public.agm_code_status as enum ('unused', 'claimed');
create type public.agm_resolution_status as enum ('pending', 'open', 'closed');
create type public.agm_vote_choice as enum ('yes', 'no', 'abstain');

-- ============================================================
-- Tables
-- ============================================================

create table public.agm_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date not null,
  status public.agm_event_status not null default 'draft',
  quorum_threshold int,
  is_test boolean not null default false,
  created_by uuid references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Only one real (non-test) event may be active at a time.
create unique index agm_events_one_active
  on public.agm_events (status)
  where status = 'active' and not is_test;

create table public.agm_codes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.agm_events (id) on delete cascade,
  code text not null,
  status public.agm_code_status not null default 'unused',
  claimed_by uuid references public.users (id),
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, code)
);

-- One claimed code per member per event — the 1:1 attendance/eligibility guarantee.
create unique index agm_codes_one_claim_per_member
  on public.agm_codes (event_id, claimed_by)
  where claimed_by is not null;

create table public.agm_documents (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.agm_events (id) on delete cascade,
  title text not null,
  category text not null default 'other'
    check (category in ('agenda', 'financial_statement', 'resolution', 'minutes', 'other')),
  file_path text not null,
  uploaded_by uuid references public.users (id),
  uploaded_at timestamptz not null default now()
);

create table public.agm_resolutions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.agm_events (id) on delete cascade,
  sequence_no int not null,
  title text not null,
  description text,
  status public.agm_resolution_status not null default 'pending',
  opened_at timestamptz,
  opened_by uuid references public.users (id),
  closed_at timestamptz,
  closed_by uuid references public.users (id),
  created_at timestamptz not null default now(),
  unique (event_id, sequence_no)
);

-- Only one resolution per event may be open at a time.
create unique index agm_resolutions_one_open_per_event
  on public.agm_resolutions (event_id)
  where status = 'open';

create table public.agm_votes (
  id uuid primary key default gen_random_uuid(),
  resolution_id uuid not null references public.agm_resolutions (id) on delete cascade,
  user_id uuid not null references public.users (id),
  choice public.agm_vote_choice not null,
  cast_at timestamptz not null default now(),
  unique (resolution_id, user_id)
);

create trigger agm_events_set_updated_at
  before update on public.agm_events
  for each row execute function public.set_updated_at();

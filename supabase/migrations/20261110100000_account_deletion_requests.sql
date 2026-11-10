-- Google Play requires an in-app way to request account deletion for any app
-- that supports account creation. This is the request-based version: a member
-- submits a request here, staff (admin/ajk) action it manually and delete the
-- underlying data/account out of band. Not a self-service cascading delete.

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  email text not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.users(id)
);

alter table public.account_deletion_requests enable row level security;

create policy account_deletion_requests_select_own on public.account_deletion_requests
  for select to authenticated using (user_id = auth.uid() or private.is_staff());
create policy account_deletion_requests_insert_own on public.account_deletion_requests
  for insert to authenticated with check (user_id = auth.uid());
create policy account_deletion_requests_update_staff on public.account_deletion_requests
  for update to authenticated using (private.is_staff()) with check (private.is_staff());

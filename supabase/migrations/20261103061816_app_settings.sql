create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.users(id)
);

alter table public.app_settings enable row level security;

create policy app_settings_select_all
  on public.app_settings for select
  to anon, authenticated
  using (true);

create policy app_settings_insert_staff
  on public.app_settings for insert
  to authenticated
  with check (private.is_staff());

create policy app_settings_update_staff
  on public.app_settings for update
  to authenticated
  using (private.is_staff())
  with check (private.is_staff());

create policy app_settings_delete_staff
  on public.app_settings for delete
  to authenticated
  using (private.is_staff());

-- Controls whether the login screen prominently surfaces the migrated-user
-- bootstrap CTA. Flip to 'false' once the renewal season closes; the
-- "Forgot password?" link keeps working regardless (see app/login.tsx).
insert into public.app_settings (key, value)
values ('bootstrap_verify_enabled', 'true'::jsonb)
on conflict (key) do nothing;

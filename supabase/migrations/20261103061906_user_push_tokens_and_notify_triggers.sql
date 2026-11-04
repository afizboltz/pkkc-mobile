-- Notify members by push when their new-registration or renewal request is
-- approved/rejected. Fires server-side via a DB trigger + pg_net, not a
-- client-side send after the admin's action, so it isn't lost if the
-- admin's device loses network right after approving/rejecting.
-- app/pending.tsx's "Check Status" button remains the fallback if a member
-- never grants push permission or push otherwise fails.

create extension if not exists pg_net schema extensions;

create table if not exists public.user_push_tokens (
  user_id uuid not null references public.users(id) on delete cascade,
  token text not null,
  platform text,
  updated_at timestamptz not null default now(),
  primary key (user_id, token)
);

alter table public.user_push_tokens enable row level security;

create policy user_push_tokens_select_own on public.user_push_tokens
  for select to authenticated using (user_id = auth.uid());
create policy user_push_tokens_insert_own on public.user_push_tokens
  for insert to authenticated with check (user_id = auth.uid());
create policy user_push_tokens_update_own on public.user_push_tokens
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy user_push_tokens_delete_own on public.user_push_tokens
  for delete to authenticated using (user_id = auth.uid());

create or replace function private.send_expo_push(p_user_id uuid, p_title text, p_body text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  for r in select token from public.user_push_tokens where user_id = p_user_id loop
    perform net.http_post(
      url := 'https://exp.host/--/api/v2/push/send',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('to', r.token, 'title', p_title, 'body', p_body)
    );
  end loop;
end;
$$;

create or replace function private.notify_user_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'pending' and new.status = 'active' then
    perform private.send_expo_push(new.id, 'Pendaftaran Diluluskan', 'Permohonan keahlian anda telah diluluskan.');
  elsif old.status = 'pending' and new.status = 'rejected' then
    perform private.send_expo_push(new.id, 'Pendaftaran Ditolak', 'Permohonan keahlian anda telah ditolak. Sila hubungi admin.');
  end if;
  return new;
end;
$$;

create trigger users_notify_status_change
  after update on public.users
  for each row
  when (old.status is distinct from new.status)
  execute function private.notify_user_status_change();

create or replace function private.notify_renewal_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'pending' and new.status = 'approved' then
    perform private.send_expo_push(new.user_id, 'Pembaharuan Diluluskan', 'Pembaharuan keahlian anda telah diluluskan.');
  elsif old.status = 'pending' and new.status = 'rejected' then
    perform private.send_expo_push(new.user_id, 'Pembaharuan Ditolak', 'Pembaharuan keahlian anda telah ditolak. Sila hubungi admin.');
  end if;
  return new;
end;
$$;

create trigger renewals_notify_status_change
  after update on public.renewals
  for each row
  when (old.status is distinct from new.status)
  execute function private.notify_renewal_status_change();

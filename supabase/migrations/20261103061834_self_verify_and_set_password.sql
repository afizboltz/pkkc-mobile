-- Unified "Verify & Set Password" mechanism: used both as the temporary
-- bootstrap path for migrated users (who have an auth.users row but no
-- usable password) and as the permanent "Forgot password?" flow for
-- everyone, forever. IC number + email only (no DOB/phone/OTP/deep-link).
--
-- Verified compatible with GoTrue by hand on 2026-11-03: a password set via
-- crypt(..., gen_salt('bf', 10)) authenticates correctly via
-- POST /auth/v1/token?grant_type=password, and the previous password is
-- correctly rejected afterward.

create table if not exists private.verify_attempts (
  id bigint generated always as identity primary key,
  ic_no text not null,
  attempted_at timestamptz not null default now(),
  success boolean not null
);

create index if not exists verify_attempts_ic_time_idx
  on private.verify_attempts (ic_no, attempted_at desc);

create or replace function public.self_verify_and_set_password(
  p_ic_no text,
  p_email text,
  p_new_password text
) returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_ic text := regexp_replace(p_ic_no, '\D', '', 'g');
  v_email text := lower(trim(p_email));
  v_user_id uuid;
  v_recent_attempts int;
begin
  if v_ic = '' or v_email = '' or p_new_password is null or length(p_new_password) < 6 then
    return 'invalid';
  end if;

  select count(*) into v_recent_attempts
  from private.verify_attempts
  where ic_no = v_ic and attempted_at > now() - interval '15 minutes';

  if v_recent_attempts >= 5 then
    return 'throttled';
  end if;

  select id into v_user_id
  from public.users
  where ic_no = v_ic and lower(email) = v_email
  limit 1;

  insert into private.verify_attempts (ic_no, success)
  values (v_ic, v_user_id is not null);

  -- Deliberately collapse "wrong IC" and "wrong email" into the same
  -- 'invalid' result so the caller can never learn which field was wrong.
  if v_user_id is null then
    return 'invalid';
  end if;

  update auth.users
  set encrypted_password = crypt(p_new_password, gen_salt('bf', 10)),
      updated_at = now()
  where id = v_user_id;

  return 'ok';
end;
$$;

grant execute on function public.self_verify_and_set_password(text, text, text) to anon, authenticated;

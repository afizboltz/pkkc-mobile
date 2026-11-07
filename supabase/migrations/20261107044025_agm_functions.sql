-- AGM feature: helper functions and RPCs.

create or replace function private.has_claimed_agm_code(p_event_id uuid)
returns boolean
language sql stable security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from public.agm_codes
    where event_id = p_event_id
      and claimed_by = auth.uid()
      and status = 'claimed'
  );
$$;

create or replace function private.is_eligible_voter(p_resolution_id uuid)
returns boolean
language sql stable security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from public.agm_resolutions r
    where r.id = p_resolution_id
      and r.status = 'open'
      and private.has_claimed_agm_code(r.event_id)
  );
$$;

-- Atomically claims an unused code for the caller against the currently active event.
-- Distinguishes: invalid_code (no such code), already_claimed (someone else got there
-- first), already_registered (caller already holds a different code for this event).
create or replace function public.claim_agm_code(p_code text)
returns public.agm_codes
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_event_id uuid;
  v_code text := upper(trim(p_code));
  v_row public.agm_codes;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select id into v_event_id from public.agm_events
  where status = 'active' and not is_test
  limit 1;

  if v_event_id is null then
    raise exception 'no_active_event';
  end if;

  if exists (
    select 1 from public.agm_codes
    where event_id = v_event_id and claimed_by = auth.uid()
  ) then
    raise exception 'already_registered';
  end if;

  update public.agm_codes
  set status = 'claimed', claimed_by = auth.uid(), claimed_at = now()
  where event_id = v_event_id and code = v_code and status = 'unused'
  returning * into v_row;

  if v_row.id is null then
    if exists (select 1 from public.agm_codes where event_id = v_event_id and code = v_code) then
      raise exception 'already_claimed';
    else
      raise exception 'invalid_code';
    end if;
  end if;

  return v_row;
end;
$$;

grant execute on function public.claim_agm_code(text) to authenticated;

-- Generates p_count unique random codes (safe alphabet: no 0/O or 1/I) for an event.
create or replace function public.generate_agm_codes(p_event_id uuid, p_count int)
returns setof public.agm_codes
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code text;
  v_attempt int;
begin
  if not private.is_staff() then
    raise exception 'not_authorized';
  end if;

  if p_count is null or p_count <= 0 then
    raise exception 'invalid_count';
  end if;

  for v_i in 1..p_count loop
    v_attempt := 0;
    loop
      v_code := '';
      for v_j in 1..6 loop
        v_code := v_code || substr(v_alphabet, (floor(random() * length(v_alphabet)) + 1)::int, 1);
      end loop;

      begin
        insert into public.agm_codes (event_id, code) values (p_event_id, v_code);
        exit;
      exception when unique_violation then
        v_attempt := v_attempt + 1;
        if v_attempt > 20 then
          raise exception 'code_generation_failed';
        end if;
      end;
    end loop;
  end loop;

  return query
    select * from public.agm_codes
    where event_id = p_event_id
    order by created_at desc
    limit p_count;
end;
$$;

grant execute on function public.generate_agm_codes(uuid, int) to authenticated;

create or replace function public.open_agm_resolution(p_resolution_id uuid)
returns public.agm_resolutions
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_event_id uuid;
  v_row public.agm_resolutions;
begin
  if not private.is_staff() then
    raise exception 'not_authorized';
  end if;

  select event_id into v_event_id from public.agm_resolutions where id = p_resolution_id;
  if v_event_id is null then
    raise exception 'resolution_not_found';
  end if;

  if exists (
    select 1 from public.agm_resolutions
    where event_id = v_event_id and status = 'open' and id <> p_resolution_id
  ) then
    raise exception 'another_resolution_open';
  end if;

  update public.agm_resolutions
  set status = 'open', opened_at = now(), opened_by = auth.uid()
  where id = p_resolution_id and status = 'pending'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'resolution_not_pending';
  end if;

  return v_row;
end;
$$;

grant execute on function public.open_agm_resolution(uuid) to authenticated;

create or replace function public.close_agm_resolution(p_resolution_id uuid)
returns public.agm_resolutions
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_row public.agm_resolutions;
begin
  if not private.is_staff() then
    raise exception 'not_authorized';
  end if;

  update public.agm_resolutions
  set status = 'closed', closed_at = now(), closed_by = auth.uid()
  where id = p_resolution_id and status = 'open'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'resolution_not_open';
  end if;

  return v_row;
end;
$$;

grant execute on function public.close_agm_resolution(uuid) to authenticated;

-- Real counts once closed, to anyone; real counts while open only to staff, else zeros
-- with visible=false so the client can tell "no votes yet" apart from "hidden while open".
create or replace function public.get_agm_resolution_tally(p_resolution_id uuid)
returns table(yes_count int, no_count int, abstain_count int, total int, visible boolean)
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_status public.agm_resolution_status;
begin
  select status into v_status from public.agm_resolutions where id = p_resolution_id;

  if v_status is null then
    raise exception 'resolution_not_found';
  end if;

  if v_status = 'open' and not private.is_staff() then
    return query select 0, 0, 0, 0, false;
    return;
  end if;

  return query
    select
      count(*) filter (where choice = 'yes')::int,
      count(*) filter (where choice = 'no')::int,
      count(*) filter (where choice = 'abstain')::int,
      count(*)::int,
      true
    from public.agm_votes
    where resolution_id = p_resolution_id;
end;
$$;

grant execute on function public.get_agm_resolution_tally(uuid) to authenticated;

-- Allow a rejected applicant to self-reset their own row back to "pending"
-- (clearing the rejection fields) so they can be reviewed again, without
-- opening up the other privileged columns this trigger protects. Staff
-- continue to go through the existing admin approve/reject path unchanged.
-- A simple 24h cooldown (based on rejected_at) prevents resubmit-spamming.
create or replace function private.protect_privileged_user_columns()
returns trigger
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_self_resubmit boolean;
begin
  v_self_resubmit :=
    not private.is_staff()
    and auth.uid() = old.id
    and old.status = 'rejected'
    and new.status = 'pending'
    and new.rejected_at is null
    and new.rejected_remark is null
    and new.rejected_by is null;

  if v_self_resubmit and old.rejected_at is not null and now() - old.rejected_at < interval '24 hours' then
    raise exception 'resubmit_too_soon';
  end if;

  if not private.is_staff() then
    if not v_self_resubmit then
      new.status := old.status;
      new.rejected_at := old.rejected_at;
      new.rejected_remark := old.rejected_remark;
      new.rejected_by := old.rejected_by;
    end if;
    new.role := old.role;
    new.pkkc_id := old.pkkc_id;
    new.membership_expiry := old.membership_expiry;
    new.approved_at := old.approved_at;
    new.approved_remark := old.approved_remark;
    new.approved_by := old.approved_by;
    new.verified_at := old.verified_at;
  end if;
  return new;
end;
$$;

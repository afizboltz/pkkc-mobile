-- AGM feature: RLS policies + storage bucket (depends on functions from the prior migration).

alter table public.agm_events enable row level security;
alter table public.agm_codes enable row level security;
alter table public.agm_documents enable row level security;
alter table public.agm_resolutions enable row level security;
alter table public.agm_votes enable row level security;

-- agm_events
create policy agm_events_select on public.agm_events for select
  using (auth.role() = 'authenticated');
create policy agm_events_insert_staff on public.agm_events for insert
  with check (private.is_staff());
create policy agm_events_update_staff on public.agm_events for update
  using (private.is_staff()) with check (private.is_staff());

-- agm_codes: members only ever see their own claimed row; the unused pool stays staff-only.
create policy agm_codes_select on public.agm_codes for select
  using (private.is_staff() or claimed_by = auth.uid());
create policy agm_codes_insert_staff on public.agm_codes for insert
  with check (private.is_staff());
create policy agm_codes_update_staff on public.agm_codes for update
  using (private.is_staff()) with check (private.is_staff());

-- agm_documents: visible once the caller has claimed a code for the document's event.
create policy agm_documents_select on public.agm_documents for select
  using (private.is_staff() or private.has_claimed_agm_code(event_id));
create policy agm_documents_insert_staff on public.agm_documents for insert
  with check (private.is_staff());
create policy agm_documents_update_staff on public.agm_documents for update
  using (private.is_staff()) with check (private.is_staff());
create policy agm_documents_delete_staff on public.agm_documents for delete
  using (private.is_staff());

-- agm_resolutions
create policy agm_resolutions_select on public.agm_resolutions for select
  using (private.is_staff() or private.has_claimed_agm_code(event_id));
create policy agm_resolutions_insert_staff on public.agm_resolutions for insert
  with check (private.is_staff());
create policy agm_resolutions_update_staff on public.agm_resolutions for update
  using (private.is_staff()) with check (private.is_staff());

-- agm_votes: members see only their own ballot; insert only while eligible; immutable by
-- omission (no update/delete policy for anyone, including staff).
create policy agm_votes_select on public.agm_votes for select
  using (user_id = auth.uid() or private.is_staff());
create policy agm_votes_insert on public.agm_votes for insert
  with check (user_id = auth.uid() and private.is_eligible_voter(resolution_id));

-- Storage: private "agm_documents" bucket (distinct from the "receipts" bucket).
insert into storage.buckets (id, name, public) values ('agm_documents', 'agm_documents', false);

create policy agm_documents_bucket_insert_staff on storage.objects for insert
  with check (bucket_id = 'agm_documents' and private.is_staff());
create policy agm_documents_bucket_select on storage.objects for select
  using (
    bucket_id = 'agm_documents'
    and (
      private.is_staff()
      or exists (
        select 1 from public.agm_codes
        where claimed_by = auth.uid() and status = 'claimed'
      )
    )
  );
create policy agm_documents_bucket_delete_staff on storage.objects for delete
  using (bucket_id = 'agm_documents' and private.is_staff());

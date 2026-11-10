-- The original agm_documents storage SELECT policy only checked "has claimed any code",
-- not "has claimed a code for *this document's* event" — letting a member who attended
-- one AGM pull another AGM's documents directly via signed URL, bypassing the (correctly
-- event-scoped) agm_documents table RLS. Re-derive the event id from the storage path
-- (convention: ${eventId}/${documentId}/${filename}) and match it against the claim.
drop policy agm_documents_bucket_select on storage.objects;

create policy agm_documents_bucket_select on storage.objects for select
  using (
    bucket_id = 'agm_documents'
    and (
      private.is_staff()
      or exists (
        select 1 from public.agm_codes
        where claimed_by = auth.uid()
          and status = 'claimed'
          and event_id::text = (storage.foldername(name))[1]
      )
    )
  );

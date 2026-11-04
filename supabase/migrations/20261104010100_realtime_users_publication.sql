-- Enables Supabase Realtime on public.users so a client can subscribe to
-- status changes on their own row (e.g. the Pending screen watching for
-- admin approval/rejection) without polling. RLS already restricts reads
-- to auth.uid() = id or staff, so this doesn't expose anything new.
-- Verified via pg_publication_tables that public.users was not already a
-- member of supabase_realtime before adding it (2026-11-04).
alter publication supabase_realtime add table public.users;

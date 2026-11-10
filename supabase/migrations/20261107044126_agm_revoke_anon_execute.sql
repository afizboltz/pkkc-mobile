-- Close the default PUBLIC-execute grant Postgres adds on function creation — these RPCs
-- are for authenticated members/staff only, not anonymous callers.
revoke execute on function public.claim_agm_code(text) from public;
revoke execute on function public.generate_agm_codes(uuid, int) from public;
revoke execute on function public.open_agm_resolution(uuid) from public;
revoke execute on function public.close_agm_resolution(uuid) from public;
revoke execute on function public.get_agm_resolution_tally(uuid) from public;

grant execute on function public.claim_agm_code(text) to authenticated;
grant execute on function public.generate_agm_codes(uuid, int) to authenticated;
grant execute on function public.open_agm_resolution(uuid) to authenticated;
grant execute on function public.close_agm_resolution(uuid) to authenticated;
grant execute on function public.get_agm_resolution_tally(uuid) to authenticated;

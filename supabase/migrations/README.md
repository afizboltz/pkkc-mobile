# Migrations

Applied via the `apply_migration`/`execute_sql` Supabase MCP tools (or `supabase db push` once the CLI can authenticate), not the dashboard SQL editor, so history stays in git going forward. `00000000000000_baseline_snapshot.sql` documents the 6 pre-existing migrations that were applied directly to remote before this folder existed — it is not meant to be re-run.

## Bootstrapping the first admin account

There is no in-app way to create the first `role='admin'` account — the approval screens (`approveNewUser`, `userList`, `approveRenew`, `renewUserList`) only appear for `role in ('admin', 'ajk')`, and nothing can grant that role except an existing staff account, which is circular for the very first one. Run this once, manually, against the target project:

```sql
update public.users set role = 'admin' where id = '<auth user id of the intended admin>';
```

Find the id via `select id, email, ic_no from public.users where email = '<their email>';`.

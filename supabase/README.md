# Supabase setup for the Operating Plan

The shared Operating Plan (`/dashboard/plan`) needs the tables and functions in
`migrations/20261022000000_operating_plan.sql`.

## 1. Apply the migration (once)

Supabase dashboard → SQL Editor → paste the whole migration file → Run.
It only adds new tables and functions; nothing existing is changed.

## 2. Make yourself the platform admin (once)

Sign in to the app at least once, then run in the SQL Editor (use your sign-in email):

```sql
insert into public.platform_admins (user_id)
select id from auth.users where email = 'you@example.com';
```

Platform admins can create companies and see every company's plan.

## How access works

- Platform admin: creates companies, sees and edits all of them.
- Owner: everything in their company, including roles and removing people.
- Admin: edits the plan and invites people.
- Member: reads the plan; updates only the goals, commitments and actions they own
  (matched by the sign-in email on their entry in Organise → Leadership team).

Invited people join automatically the next time they open `/dashboard/plan`
signed in with the invited, confirmed email.

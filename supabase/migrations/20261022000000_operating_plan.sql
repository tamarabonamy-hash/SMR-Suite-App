-- ─── OPERATING PLAN: companies, members, invitations, shared plans ──────────
-- What:  Moves the Operating Plan from each browser into Supabase so a whole
--        leadership team shares one live plan per company.
-- Who:   Platform admins (the consultant) create companies, invite leaders
--        and see every company. Inside a company:
--          owner  – everything, incl. changing roles and removing people
--          admin  – edits the plan and invites people
--          member – reads the plan, updates only their own goals/actions
-- Risk:  Additive only. New tables and functions; nothing existing changes.
--        Every table has row level security, so companies can't see each
--        other's data. Plans are only written through the functions below.

-- ─── TABLES ──────────────────────────────────────────────────────────────────
create table public.platform_admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.organisations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(btrim(name)) between 1 and 120),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.memberships (
  org_id     uuid not null references public.organisations (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index memberships_user_id_idx on public.memberships (user_id);

create table public.invitations (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organisations (id) on delete cascade,
  email       text not null check (email = lower(btrim(email)) and email like '%_@_%'),
  role        text not null check (role in ('owner', 'admin', 'member')),
  invited_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  accepted_at timestamptz,
  unique (org_id, email)
);
create index invitations_email_idx on public.invitations (email) where accepted_at is null;

create table public.plans (
  org_id     uuid primary key references public.organisations (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  version    integer not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

-- ─── ACCESS HELPERS ──────────────────────────────────────────────────────────
create function public.is_platform_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.platform_admins where user_id = auth.uid()) $$;

-- The caller's role in a company; platform admins count as owner everywhere.
create function public.org_role(p_org uuid) returns text
language sql stable security definer set search_path = ''
as $$
  select case
    when public.is_platform_admin() then 'owner'
    else (select role from public.memberships where org_id = p_org and user_id = auth.uid())
  end
$$;

create function public.can_edit_org(p_org uuid) returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(public.org_role(p_org) in ('owner', 'admin'), false) $$;

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
alter table public.platform_admins enable row level security;
alter table public.organisations   enable row level security;
alter table public.memberships     enable row level security;
alter table public.invitations     enable row level security;
alter table public.plans           enable row level security;

create policy "see own admin flag" on public.platform_admins
  for select to authenticated using (user_id = auth.uid());

create policy "members see their companies" on public.organisations
  for select to authenticated using (public.org_role(id) is not null);
create policy "editors rename their company" on public.organisations
  for update to authenticated using (public.can_edit_org(id)) with check (public.can_edit_org(id));
create policy "platform admins delete companies" on public.organisations
  for delete to authenticated using (public.is_platform_admin());

create policy "members see their team" on public.memberships
  for select to authenticated using (public.org_role(org_id) is not null);
create policy "owners change roles" on public.memberships
  for update to authenticated using (public.org_role(org_id) = 'owner') with check (public.org_role(org_id) = 'owner');
create policy "owners remove people" on public.memberships
  for delete to authenticated using (public.org_role(org_id) = 'owner');

create policy "editors see invitations" on public.invitations
  for select to authenticated using (public.can_edit_org(org_id));
create policy "editors invite" on public.invitations
  for insert to authenticated
  with check (public.can_edit_org(org_id) and invited_by = auth.uid()
              and (role <> 'owner' or public.org_role(org_id) = 'owner'));
create policy "editors cancel invitations" on public.invitations
  for delete to authenticated using (public.can_edit_org(org_id));

create policy "members read the plan" on public.plans
  for select to authenticated using (public.org_role(org_id) is not null);

revoke all on public.platform_admins, public.organisations, public.memberships, public.invitations, public.plans from anon;

-- ─── FUNCTIONS THE APP CALLS ─────────────────────────────────────────────────

-- Who am I, and which companies can I open (with each plan, for the overview).
create function public.my_workspaces()
returns table (org_id uuid, name text, role text, data jsonb, version integer, updated_at timestamptz)
language sql stable security invoker set search_path = ''
as $$
  select o.id, o.name, public.org_role(o.id), p.data, p.version, p.updated_at
  from public.organisations o
  left join public.plans p on p.org_id = o.id
  order by o.name
$$;

create function public.create_organisation(p_name text) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare v_id uuid;
begin
  if not public.is_platform_admin() then
    raise exception 'Only the platform admin can create companies' using errcode = '42501';
  end if;
  insert into public.organisations (name, created_by) values (btrim(p_name), auth.uid()) returning id into v_id;
  insert into public.plans (org_id, data) values (v_id, '{}'::jsonb);
  return v_id;
end $$;

-- Joins the caller to every company that invited their (confirmed) email.
create function public.accept_invitations() returns integer
language plpgsql security definer set search_path = ''
as $$
declare v_email text; v_count integer;
begin
  select lower(email) into v_email from auth.users
  where id = auth.uid() and email_confirmed_at is not null;
  if v_email is null then return 0; end if;

  insert into public.memberships (org_id, user_id, role)
  select i.org_id, auth.uid(), i.role from public.invitations i
  where i.email = v_email and i.accepted_at is null
  on conflict (org_id, user_id) do nothing;
  get diagnostics v_count = row_count;

  update public.invitations set accepted_at = now()
  where email = v_email and accepted_at is null;
  return v_count;
end $$;

-- Names and emails of a company's members (auth.users isn't readable directly).
create function public.org_team(p_org uuid)
returns table (user_id uuid, email text, role text, joined_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select m.user_id, u.email::text, m.role, m.created_at
  from public.memberships m join auth.users u on u.id = m.user_id
  where m.org_id = p_org and public.org_role(p_org) is not null
  order by m.created_at
$$;

-- Owners and admins save the whole plan. expected_version stops two people
-- silently overwriting each other: a stale save is rejected and the app reloads.
create function public.save_plan(p_org uuid, p_data jsonb, p_expected_version integer) returns integer
language plpgsql security definer set search_path = ''
as $$
declare v_version integer;
begin
  if not public.can_edit_org(p_org) then
    raise exception 'You can''t edit this plan' using errcode = '42501';
  end if;
  if jsonb_typeof(p_data) <> 'object' or pg_column_size(p_data) > 1000000 then
    raise exception 'Plan is not valid' using errcode = '22023';
  end if;
  update public.plans
     set data = p_data, version = version + 1, updated_at = now(), updated_by = auth.uid()
   where org_id = p_org and version = p_expected_version
  returning version into v_version;
  if v_version is null then
    raise exception 'Plan changed since you loaded it' using errcode = '40001';
  end if;
  return v_version;
end $$;

-- Members update their own goals, commitments and actions. Ownership comes from
-- the plan: the item's ownerId points at a person whose email is the caller's.
-- Owners and admins may use it for any item.
create function public.update_plan_item(p_org uuid, p_op text, p_payload jsonb)
returns table (data jsonb, version integer)
language plpgsql security definer set search_path = ''
as $$
#variable_conflict use_column
declare
  v_data   jsonb;
  v_email  text;
  v_list   text;
  v_id     text;
  v_idx    integer;
  v_item   jsonb;
  v_owner  text;
  v_status text;
begin
  if public.org_role(p_org) is null then
    raise exception 'You''re not part of this company' using errcode = '42501';
  end if;

  select p.data into v_data from public.plans p where p.org_id = p_org for update;
  select lower(email) into v_email from auth.users where id = auth.uid();

  v_list := case p_op when 'action_done' then 'actions' else 'goals' end;
  v_id   := coalesce(p_payload ->> 'goalId', p_payload ->> 'actionId');

  select ord - 1, item into v_idx, v_item
  from jsonb_array_elements(coalesce(v_data -> v_list, '[]'::jsonb)) with ordinality as t (item, ord)
  where item ->> 'id' = v_id;
  if v_idx is null then
    raise exception 'Item not found' using errcode = 'P0002';
  end if;

  if not public.can_edit_org(p_org) then
    select per ->> 'id' into v_owner
    from jsonb_array_elements(coalesce(v_data -> 'people', '[]'::jsonb)) per
    where lower(per ->> 'email') = v_email
      and per ->> 'id' = v_item ->> 'ownerId';
    if v_owner is null then
      raise exception 'You can only update items you own' using errcode = '42501';
    end if;
  end if;

  if p_op = 'goal_update' then
    v_status := p_payload ->> 'status';
    if v_status not in ('new', 'on', 'risk', 'off', 'done') then
      raise exception 'Unknown status' using errcode = '22023';
    end if;
    v_item := v_item
      || jsonb_build_object('status', v_status, 'current', left(coalesce(p_payload ->> 'current', ''), 100))
      || jsonb_build_object('updates', coalesce(v_item -> 'updates', '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
           'date', to_char(now() at time zone 'utc', 'YYYY-MM-DD'),
           'status', v_status,
           'current', left(coalesce(p_payload ->> 'current', ''), 100),
           'note', left(coalesce(p_payload ->> 'note', ''), 2000))));
  elsif p_op = 'commitment_done' then
    v_item := v_item || jsonb_build_object('status', case when (p_payload ->> 'done')::boolean then 'done' else 'new' end);
  elsif p_op = 'action_done' then
    v_item := v_item || jsonb_build_object('done', (p_payload ->> 'done')::boolean);
  else
    raise exception 'Unknown update' using errcode = '22023';
  end if;

  v_data := jsonb_set(v_data, array[v_list, v_idx::text], v_item);
  return query
    with saved as (
      update public.plans p
         set data = v_data, version = p.version + 1, updated_at = now(), updated_by = auth.uid()
       where p.org_id = p_org
      returning p.data, p.version
    )
    select saved.data, saved.version from saved;
end $$;

revoke execute on function
  public.is_platform_admin(), public.org_role(uuid), public.can_edit_org(uuid),
  public.my_workspaces(), public.create_organisation(text), public.accept_invitations(),
  public.org_team(uuid), public.save_plan(uuid, jsonb, integer), public.update_plan_item(uuid, text, jsonb)
from public, anon;
grant execute on function
  public.is_platform_admin(), public.org_role(uuid), public.can_edit_org(uuid),
  public.my_workspaces(), public.create_organisation(text), public.accept_invitations(),
  public.org_team(uuid), public.save_plan(uuid, jsonb, integer), public.update_plan_item(uuid, text, jsonb)
to authenticated;

-- Persistence Pack 001: identity, tenancy, reporting hierarchy, and RLS.
-- Candidate-owned domain tables intentionally begin in Persistence Pack 002.

create type public.organization_status as enum ('active', 'suspended', 'archived');
create type public.membership_status as enum ('invited', 'active', 'suspended');
create type public.membership_role as enum ('owner', 'admin', 'manager', 'consultant');
create type public.workspace_capability as enum (
  'organization:view',
  'organization:manage',
  'memberships:view_descendants',
  'memberships:manage',
  'hierarchy:view_descendants',
  'hierarchy:manage'
);

create table public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  locale text not null default 'en-US',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default ('org_' || replace(gen_random_uuid()::text, '-', '')),
  name text not null check (length(btrim(name)) between 1 and 200),
  status public.organization_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_public_id_key unique (public_id),
  constraint organizations_public_id_format check (public_id ~ '^org_[a-z0-9]{16,64}$')
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete restrict,
  role public.membership_role not null default 'consultant',
  status public.membership_status not null default 'invited',
  manager_membership_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_memberships_organization_user_key unique (organization_id, user_id),
  constraint organization_memberships_id_organization_key unique (id, organization_id),
  constraint organization_memberships_not_self_managed check (manager_membership_id is null or manager_membership_id <> id),
  constraint organization_memberships_manager_same_organization_fk
    foreign key (manager_membership_id, organization_id)
    references public.organization_memberships (id, organization_id)
    on delete restrict
    deferrable initially immediate
);

create index organization_memberships_user_status_idx
  on public.organization_memberships (user_id, status, organization_id);
create index organization_memberships_manager_idx
  on public.organization_memberships (organization_id, manager_membership_id)
  where status = 'active';

create table public.membership_reporting_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  membership_id uuid not null,
  previous_manager_membership_id uuid,
  new_manager_membership_id uuid,
  changed_by_membership_id uuid,
  changed_at timestamptz not null default now(),
  reason text,
  constraint membership_reporting_history_membership_fk
    foreign key (membership_id, organization_id)
    references public.organization_memberships (id, organization_id)
    on delete restrict,
  constraint membership_reporting_history_previous_manager_fk
    foreign key (previous_manager_membership_id, organization_id)
    references public.organization_memberships (id, organization_id)
    on delete restrict,
  constraint membership_reporting_history_new_manager_fk
    foreign key (new_manager_membership_id, organization_id)
    references public.organization_memberships (id, organization_id)
    on delete restrict,
  constraint membership_reporting_history_actor_fk
    foreign key (changed_by_membership_id, organization_id)
    references public.organization_memberships (id, organization_id)
    on delete restrict,
  constraint membership_reporting_history_meaningful_change
    check (previous_manager_membership_id is distinct from new_manager_membership_id)
);

create index membership_reporting_history_membership_time_idx
  on public.membership_reporting_history (organization_id, membership_id, changed_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger organization_memberships_set_updated_at
before update on public.organization_memberships
for each row execute function public.set_updated_at();

-- Runs as the function owner so hierarchy integrity cannot be bypassed by RLS.
-- No dynamic SQL or caller-controlled schema lookup is used.
create function public.enforce_membership_hierarchy()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  cycle_found boolean;
  active_manager_found boolean;
begin
  -- Serialize hierarchy writes per organization so concurrent updates cannot
  -- each validate against an old graph and commit a cycle together.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.organization_id::text, 0)
  );

  if tg_op = 'UPDATE' then
    if new.organization_id is distinct from old.organization_id
       or new.user_id is distinct from old.user_id then
      raise exception using
        errcode = '23514',
        message = 'Membership organization and user identity are immutable.';
    end if;
  end if;

  if new.manager_membership_id is null then
    if new.status <> 'active' and exists (
      select 1
      from public.organization_memberships as report
      where report.organization_id = new.organization_id
        and report.manager_membership_id = new.id
        and report.status = 'active'
    ) then
      raise exception using
        errcode = '23514',
        message = 'A membership with active reports cannot be suspended.';
    end if;
    return new;
  end if;

  if new.manager_membership_id = new.id then
    raise exception using errcode = '23514', message = 'A membership cannot manage itself.';
  end if;

  select exists (
    select 1
    from public.organization_memberships as manager
    where manager.id = new.manager_membership_id
      and manager.organization_id = new.organization_id
      and manager.status = 'active'
  ) into active_manager_found;

  if not active_manager_found then
    raise exception using
      errcode = '23514',
      message = 'An active same-organization manager is required.';
  end if;

  if new.status <> 'active' and exists (
    select 1
    from public.organization_memberships as report
    where report.organization_id = new.organization_id
      and report.manager_membership_id = new.id
      and report.status = 'active'
  ) then
    raise exception using
      errcode = '23514',
      message = 'A membership with active reports cannot be suspended.';
  end if;

  -- The composite foreign key independently enforces same-organization managers.
  with recursive manager_chain as (
    select membership.id, membership.manager_membership_id
    from public.organization_memberships as membership
    where membership.id = new.manager_membership_id
      and membership.organization_id = new.organization_id
    union all
    select parent.id, parent.manager_membership_id
    from public.organization_memberships as parent
    join manager_chain as child on parent.id = child.manager_membership_id
    where parent.organization_id = new.organization_id
  )
  select exists (
    select 1 from manager_chain where id = new.id
  ) into cycle_found;

  if cycle_found then
    raise exception using errcode = '23514', message = 'Reporting hierarchy cycles are not allowed.';
  end if;

  return new;
end;
$$;

create trigger organization_memberships_enforce_hierarchy
before insert or update on public.organization_memberships
for each row execute function public.enforce_membership_hierarchy();

-- Records only meaningful manager changes. An authorized mutation may set the
-- optional reason for its transaction with SET LOCAL app.reporting_change_reason.
create function public.record_membership_reporting_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_membership_id uuid;
  change_reason text;
begin
  if old.manager_membership_id is not distinct from new.manager_membership_id then
    return new;
  end if;

  select membership.id
  into actor_membership_id
  from public.organization_memberships as membership
  where membership.organization_id = new.organization_id
    and membership.user_id = auth.uid()
    and membership.status = 'active'
  limit 1;

  change_reason := nullif(current_setting('app.reporting_change_reason', true), '');

  insert into public.membership_reporting_history (
    organization_id,
    membership_id,
    previous_manager_membership_id,
    new_manager_membership_id,
    changed_by_membership_id,
    reason
  ) values (
    new.organization_id,
    new.id,
    old.manager_membership_id,
    new.manager_membership_id,
    actor_membership_id,
    change_reason
  );

  return new;
end;
$$;

create trigger organization_memberships_record_reporting_change
after update of manager_membership_id on public.organization_memberships
for each row execute function public.record_membership_reporting_change();

create function public.current_active_membership_id(target_organization_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select membership.id
  from public.organization_memberships as membership
  join public.organizations as organization on organization.id = membership.organization_id
  where membership.organization_id = target_organization_id
    and membership.user_id = auth.uid()
    and membership.status = 'active'
    and organization.status = 'active'
  limit 1
$$;

create function public.is_active_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_active_membership_id(target_organization_id) is not null
$$;

create function public.has_organization_role(
  target_organization_id uuid,
  allowed_roles public.membership_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships as membership
    join public.organizations as organization on organization.id = membership.organization_id
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
      and organization.status = 'active'
      and membership.role = any (allowed_roles)
  )
$$;

-- Internal primitive. Cross-organization IDs always return false.
create function public.is_membership_descendant(
  ancestor_membership_id uuid,
  possible_descendant_membership_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with recursive lineage as (
    select membership.id, membership.organization_id, membership.manager_membership_id
    from public.organization_memberships as membership
    where membership.id = possible_descendant_membership_id
      and membership.status = 'active'
    union all
    select parent.id, parent.organization_id, parent.manager_membership_id
    from public.organization_memberships as parent
    join lineage as child
      on parent.id = child.manager_membership_id
     and parent.organization_id = child.organization_id
    where parent.status = 'active'
  )
  select ancestor_membership_id <> possible_descendant_membership_id
    and exists (select 1 from lineage where id = ancestor_membership_id)
$$;

create function public.can_view_membership(target_membership_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  target_organization_id uuid;
  caller_membership_id uuid;
  caller_role public.membership_role;
begin
  select membership.organization_id
  into target_organization_id
  from public.organization_memberships as membership
  where membership.id = target_membership_id;

  if target_organization_id is null then
    return false;
  end if;

  select membership.id, membership.role
  into caller_membership_id, caller_role
  from public.organization_memberships as membership
  join public.organizations as organization on organization.id = membership.organization_id
  where membership.organization_id = target_organization_id
    and membership.user_id = auth.uid()
    and membership.status = 'active'
    and organization.status = 'active'
  limit 1;

  if caller_membership_id is null then
    return false;
  end if;

  return caller_role in ('owner', 'admin')
    or caller_membership_id = target_membership_id
    or (
      caller_role = 'manager'
      and public.is_membership_descendant(caller_membership_id, target_membership_id)
    );
end;
$$;

create function public.get_authorized_membership_ids(target_organization_id uuid)
returns table (membership_id uuid)
language sql
stable
security definer
set search_path = ''
as $$
  select membership.id
  from public.organization_memberships as membership
  where membership.organization_id = target_organization_id
    and membership.status = 'active'
    and public.can_view_membership(membership.id)
$$;

create function public.has_workspace_capability(
  target_organization_id uuid,
  capability public.workspace_capability
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships as membership
    join public.organizations as organization on organization.id = membership.organization_id
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
      and organization.status = 'active'
      and case membership.role
        when 'owner' then true
        when 'admin' then capability in (
          'organization:view', 'organization:manage', 'memberships:view_descendants',
          'memberships:manage', 'hierarchy:view_descendants', 'hierarchy:manage'
        )
        when 'manager' then capability in (
          'organization:view', 'memberships:view_descendants', 'hierarchy:view_descendants'
        )
        when 'consultant' then capability = 'organization:view'
      end
  )
$$;

alter table public.user_profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.membership_reporting_history enable row level security;

create policy user_profiles_select_self
on public.user_profiles for select to authenticated
using (user_id = auth.uid());

create policy user_profiles_insert_self
on public.user_profiles for insert to authenticated
with check (user_id = auth.uid());

create policy user_profiles_update_self
on public.user_profiles for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy organizations_select_active_member
on public.organizations for select to authenticated
using (public.is_active_organization_member(id));

create policy organizations_update_admin
on public.organizations for update to authenticated
using (public.has_organization_role(id, array['owner', 'admin']::public.membership_role[]))
with check (public.has_organization_role(id, array['owner', 'admin']::public.membership_role[]));

create policy organization_memberships_select_authorized
on public.organization_memberships for select to authenticated
using (public.can_view_membership(id));

create policy organization_memberships_insert_admin
on public.organization_memberships for insert to authenticated
with check (public.has_organization_role(organization_id, array['owner', 'admin']::public.membership_role[]));

create policy organization_memberships_update_admin
on public.organization_memberships for update to authenticated
using (public.has_organization_role(organization_id, array['owner', 'admin']::public.membership_role[]))
with check (public.has_organization_role(organization_id, array['owner', 'admin']::public.membership_role[]));

create policy membership_reporting_history_select_authorized
on public.membership_reporting_history for select to authenticated
using (public.can_view_membership(membership_id));

revoke all on table public.user_profiles from anon;
revoke all on table public.organizations from anon;
revoke all on table public.organization_memberships from anon;
revoke all on table public.membership_reporting_history from anon;

grant select, insert, update on table public.user_profiles to authenticated;
grant select, update on table public.organizations to authenticated;
grant select, insert, update on table public.organization_memberships to authenticated;
grant select on table public.membership_reporting_history to authenticated;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.enforce_membership_hierarchy() from public, anon, authenticated;
revoke all on function public.record_membership_reporting_change() from public, anon, authenticated;
revoke all on function public.current_active_membership_id(uuid) from public, anon, authenticated;
revoke all on function public.is_active_organization_member(uuid) from public, anon, authenticated;
revoke all on function public.has_organization_role(uuid, public.membership_role[]) from public, anon, authenticated;
revoke all on function public.is_membership_descendant(uuid, uuid) from public, anon, authenticated;
revoke all on function public.can_view_membership(uuid) from public, anon, authenticated;
revoke all on function public.get_authorized_membership_ids(uuid) from public, anon, authenticated;
revoke all on function public.has_workspace_capability(uuid, public.workspace_capability) from public, anon, authenticated;

grant execute on function public.current_active_membership_id(uuid) to authenticated;
grant execute on function public.is_active_organization_member(uuid) to authenticated;
grant execute on function public.has_organization_role(uuid, public.membership_role[]) to authenticated;
grant execute on function public.can_view_membership(uuid) to authenticated;
grant execute on function public.get_authorized_membership_ids(uuid) to authenticated;
grant execute on function public.has_workspace_capability(uuid, public.workspace_capability) to authenticated;

comment on function public.enforce_membership_hierarchy() is
  'SECURITY DEFINER is required so cycle and tenant integrity checks see the complete hierarchy despite caller RLS.';
comment on function public.record_membership_reporting_change() is
  'SECURITY DEFINER is required so append-only hierarchy history is recorded independently of caller table privileges.';
comment on function public.can_view_membership(uuid) is
  'RLS helper: self, active descendants for managers, and organization-wide owner/admin scope; always organization-bound.';
comment on function public.get_authorized_membership_ids(uuid) is
  'Returns only the caller membership IDs authorized in the requested active organization.';

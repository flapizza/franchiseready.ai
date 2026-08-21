-- Persistence Pack 002: durable candidate root, assignment, and candidate RLS.

create type public.candidate_status as enum ('active', 'on-hold', 'inactive', 'won', 'lost');

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  public_id text not null default ('cand_' || replace(gen_random_uuid()::text, '-', '')),
  assigned_membership_id uuid not null,
  created_by_membership_id uuid not null,
  first_name text not null check (length(btrim(first_name)) between 1 and 100),
  last_name text not null check (length(btrim(last_name)) between 1 and 100),
  preferred_name text check (preferred_name is null or length(btrim(preferred_name)) between 1 and 100),
  email text not null check (length(btrim(email)) between 3 and 320),
  phone text,
  status public.candidate_status not null default 'active',
  pipeline_stage_id text not null default 'lead' check (length(btrim(pipeline_stage_id)) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint candidates_organization_public_id_key unique (organization_id, public_id),
  constraint candidates_public_id_key unique (public_id),
  constraint candidates_public_id_format check (public_id ~ '^cand_[a-z0-9]{16,64}$'),
  constraint candidates_id_organization_key unique (id, organization_id),
  constraint candidates_assignee_same_organization_fk foreign key (assigned_membership_id, organization_id)
    references public.organization_memberships (id, organization_id) on delete restrict,
  constraint candidates_creator_same_organization_fk foreign key (created_by_membership_id, organization_id)
    references public.organization_memberships (id, organization_id) on delete restrict
);

create index candidates_assignment_idx on public.candidates (organization_id, assigned_membership_id, updated_at desc);
create index candidates_normalized_email_idx on public.candidates (organization_id, lower(btrim(email)));

create table public.candidate_assignment_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  candidate_id uuid not null,
  previous_membership_id uuid not null,
  new_membership_id uuid not null,
  changed_by_membership_id uuid not null,
  reason text,
  changed_at timestamptz not null default now(),
  constraint candidate_assignment_history_candidate_fk foreign key (candidate_id, organization_id)
    references public.candidates (id, organization_id) on delete restrict,
  constraint candidate_assignment_history_previous_fk foreign key (previous_membership_id, organization_id)
    references public.organization_memberships (id, organization_id) on delete restrict,
  constraint candidate_assignment_history_new_fk foreign key (new_membership_id, organization_id)
    references public.organization_memberships (id, organization_id) on delete restrict,
  constraint candidate_assignment_history_actor_fk foreign key (changed_by_membership_id, organization_id)
    references public.organization_memberships (id, organization_id) on delete restrict,
  constraint candidate_assignment_history_meaningful check (previous_membership_id <> new_membership_id)
);

create index candidate_assignment_history_candidate_time_idx
  on public.candidate_assignment_history (organization_id, candidate_id, changed_at desc);

create function public.can_access_candidate(target_candidate_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.candidates as candidate
    where candidate.id = target_candidate_id
      and public.can_view_membership(candidate.assigned_membership_id)
  )
$$;

create function public.enforce_candidate_memberships()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and (new.id is distinct from old.id
      or new.organization_id is distinct from old.organization_id
      or new.created_by_membership_id is distinct from old.created_by_membership_id
      or new.public_id is distinct from old.public_id) then
    raise exception using errcode = '23514', message = 'Candidate internal identity, organization, creator, and public identity are immutable.';
  end if;
  if not exists (select 1 from public.organization_memberships m where m.id = new.assigned_membership_id
      and m.organization_id = new.organization_id and m.status = 'active') then
    raise exception using errcode = '23514', message = 'An active same-organization assignee is required.';
  end if;
  if not exists (select 1 from public.organization_memberships m where m.id = new.created_by_membership_id
      and m.organization_id = new.organization_id and m.status = 'active') then
    raise exception using errcode = '23514', message = 'An active same-organization creator is required.';
  end if;
  return new;
end;
$$;

create trigger candidates_enforce_memberships before insert or update on public.candidates
for each row execute function public.enforce_candidate_memberships();
create trigger candidates_set_updated_at before update on public.candidates
for each row execute function public.set_updated_at();

create function public.record_candidate_assignment_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare actor_id uuid; change_reason text;
begin
  if old.assigned_membership_id is not distinct from new.assigned_membership_id then return new; end if;
  actor_id := public.current_active_membership_id(new.organization_id);
  if actor_id is null then raise exception using errcode = '42501', message = 'An active actor is required for reassignment.'; end if;
  change_reason := nullif(current_setting('app.candidate_assignment_reason', true), '');
  insert into public.candidate_assignment_history (organization_id, candidate_id, previous_membership_id,
    new_membership_id, changed_by_membership_id, reason)
  values (new.organization_id, new.id, old.assigned_membership_id, new.assigned_membership_id, actor_id, change_reason);
  return new;
end;
$$;

create trigger candidates_record_assignment after update of assigned_membership_id on public.candidates
for each row execute function public.record_candidate_assignment_change();

alter table public.candidates enable row level security;
alter table public.candidate_assignment_history enable row level security;

create policy candidates_select_authorized on public.candidates for select to authenticated
using (public.can_access_candidate(id));
create policy candidates_insert_self on public.candidates for insert to authenticated
with check (organization_id is not null
  and created_by_membership_id = public.current_active_membership_id(organization_id)
  and assigned_membership_id = public.current_active_membership_id(organization_id));
create policy candidates_update_authorized on public.candidates for update to authenticated
using (public.can_access_candidate(id))
with check (public.can_view_membership(assigned_membership_id));
create policy candidate_assignment_history_select_authorized on public.candidate_assignment_history for select to authenticated
using (public.can_access_candidate(candidate_id));

revoke all on table public.candidates, public.candidate_assignment_history from anon;
grant select, insert, update on table public.candidates to authenticated;
grant select on table public.candidate_assignment_history to authenticated;
revoke all on function public.can_access_candidate(uuid), public.enforce_candidate_memberships(), public.record_candidate_assignment_change() from public, anon, authenticated;
grant execute on function public.can_access_candidate(uuid) to authenticated;

comment on function public.can_access_candidate(uuid) is 'Reusable fail-closed candidate authorization for self, manager descendants, and owner/admin organization scope.';

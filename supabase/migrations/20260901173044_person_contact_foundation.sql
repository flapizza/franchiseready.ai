-- Pack 2: permanent organization-owned human identity and candidate bridge.

create extension if not exists pg_trgm with schema extensions;

create type public.contact_lifecycle_status as enum (
  'prospect', 'engaged', 'active-candidate', 'nurture', 'closed-placed', 'historical'
);
create type public.marketing_permission_status as enum (
  'unknown', 'opted-in', 'opted-out', 'suppressed'
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  public_id text not null default ('contact_' || replace(gen_random_uuid()::text, '-', '')),
  created_by_membership_id uuid not null,
  assigned_membership_id uuid not null,
  first_name text not null check (length(btrim(first_name)) between 1 and 100),
  last_name text not null check (length(btrim(last_name)) between 1 and 100),
  preferred_name text check (preferred_name is null or length(btrim(preferred_name)) between 1 and 100),
  primary_email text check (primary_email is null or length(btrim(primary_email)) between 3 and 320),
  normalized_primary_email text generated always as (nullif(lower(btrim(primary_email)), '')) stored,
  primary_phone text,
  normalized_primary_phone text generated always as (nullif(regexp_replace(coalesce(primary_phone, ''), '[^0-9]+', '', 'g'), '')) stored,
  address_line_1 text,
  address_line_2 text,
  city text,
  state_province text,
  postal_code text,
  country text not null default 'US' check (country in ('US', 'CA')),
  source text not null default 'Manual' check (length(btrim(source)) between 1 and 100),
  company text,
  title_occupation text,
  lifecycle_status public.contact_lifecycle_status not null default 'prospect',
  marketing_email_status public.marketing_permission_status not null default 'unknown',
  marketing_sms_status public.marketing_permission_status not null default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint contacts_public_id_key unique (public_id),
  constraint contacts_id_organization_key unique (id, organization_id),
  constraint contacts_public_id_format check (public_id ~ '^contact_[a-z0-9]{16,64}$'),
  constraint contacts_creator_same_organization_fk
    foreign key (created_by_membership_id, organization_id)
    references public.organization_memberships (id, organization_id) on delete restrict,
  constraint contacts_assignee_same_organization_fk
    foreign key (assigned_membership_id, organization_id)
    references public.organization_memberships (id, organization_id) on delete restrict
);

create unique index contacts_organization_email_key
  on public.contacts (organization_id, normalized_primary_email)
  where normalized_primary_email is not null and archived_at is null;
create index contacts_assignment_updated_idx
  on public.contacts (organization_id, assigned_membership_id, updated_at desc, id desc)
  where archived_at is null;
create index contacts_lifecycle_updated_idx
  on public.contacts (organization_id, lifecycle_status, updated_at desc, id desc)
  where archived_at is null;
create index contacts_search_trgm_idx on public.contacts using gin (
  (lower(first_name || ' ' || last_name || ' ' || coalesce(primary_email, '') || ' ' || coalesce(primary_phone, '') || ' ' || coalesce(company, ''))) extensions.gin_trgm_ops
);

create function public.enforce_contact_memberships()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and (
    new.id is distinct from old.id or
    new.organization_id is distinct from old.organization_id or
    new.created_by_membership_id is distinct from old.created_by_membership_id or
    new.public_id is distinct from old.public_id
  ) then
    raise exception using errcode = '23514', message = 'Contact identity, organization, creator, and public identity are immutable.';
  end if;
  if not exists (
    select 1 from public.organization_memberships membership
    where membership.id = new.assigned_membership_id
      and membership.organization_id = new.organization_id
      and membership.status = 'active'
  ) then
    raise exception using errcode = '23514', message = 'An active same-organization assignee is required.';
  end if;
  if not exists (
    select 1 from public.organization_memberships membership
    where membership.id = new.created_by_membership_id
      and membership.organization_id = new.organization_id
      and membership.status = 'active'
  ) then
    raise exception using errcode = '23514', message = 'An active same-organization creator is required.';
  end if;
  return new;
end;
$$;

create trigger contacts_enforce_memberships
before insert or update on public.contacts
for each row execute function public.enforce_contact_memberships();
create trigger contacts_set_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

alter table public.candidates add column contact_id uuid;
alter table public.candidates add constraint candidates_contact_same_organization_fk
  foreign key (contact_id, organization_id)
  references public.contacts (id, organization_id) on delete restrict;
create unique index candidates_contact_key on public.candidates (organization_id, contact_id)
  where contact_id is not null;

create function public.enforce_candidate_contact_identity()
returns trigger language plpgsql security definer set search_path = '' as $$
declare linked public.contacts%rowtype;
begin
  if tg_op = 'UPDATE' and old.contact_id is not null and new.contact_id is distinct from old.contact_id then
    raise exception using errcode = '23514', message = 'A candidate contact identity cannot be replaced.';
  end if;
  if new.contact_id is null then return new; end if;
  select * into linked from public.contacts contact
  where contact.id = new.contact_id and contact.organization_id = new.organization_id;
  if linked.id is null then
    raise exception using errcode = '23514', message = 'A same-organization contact is required.';
  end if;
  if linked.primary_email is null then
    raise exception using errcode = '23514', message = 'A candidate contact requires an email address.';
  end if;
  if new.first_name is distinct from linked.first_name
    or new.last_name is distinct from linked.last_name
    or new.preferred_name is distinct from linked.preferred_name
    or lower(btrim(new.email)) is distinct from linked.normalized_primary_email
    or coalesce(new.phone, '') is distinct from coalesce(linked.primary_phone, '') then
    raise exception using errcode = '23514', message = 'Linked candidate identity must match its contact source of truth.';
  end if;
  return new;
end;
$$;

create trigger candidates_enforce_contact_identity
before insert or update on public.candidates
for each row execute function public.enforce_candidate_contact_identity();

create function public.sync_linked_candidate_identity()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.primary_email is null and exists (
    select 1 from public.candidates candidate where candidate.contact_id = new.id
  ) then
    raise exception using errcode = '23514', message = 'Email cannot be removed from a contact linked to a candidate.';
  end if;
  update public.candidates
  set first_name = new.first_name,
      last_name = new.last_name,
      preferred_name = new.preferred_name,
      email = new.primary_email,
      phone = new.primary_phone,
      assigned_membership_id = new.assigned_membership_id
  where contact_id = new.id;
  return new;
end;
$$;

create trigger contacts_sync_linked_candidate_identity
after update of first_name, last_name, preferred_name, primary_email, primary_phone, assigned_membership_id
on public.contacts for each row execute function public.sync_linked_candidate_identity();

alter table public.contacts enable row level security;
create policy contacts_select_authorized on public.contacts for select to authenticated
using (public.can_view_membership(assigned_membership_id));
create policy contacts_insert_authorized on public.contacts for insert to authenticated
with check (
  created_by_membership_id = public.current_active_membership_id(organization_id)
  and public.can_view_membership(assigned_membership_id)
  and (
    assigned_membership_id = public.current_active_membership_id(organization_id)
    or public.has_organization_role(organization_id, array['owner', 'admin', 'manager']::public.membership_role[])
  )
);
create policy contacts_update_authorized on public.contacts for update to authenticated
using (public.can_view_membership(assigned_membership_id))
with check (
  public.can_view_membership(assigned_membership_id)
  and (
    assigned_membership_id = public.current_active_membership_id(organization_id)
    or public.has_organization_role(organization_id, array['owner', 'admin', 'manager']::public.membership_role[])
  )
);

revoke all on table public.contacts from anon;
grant select, insert, update on table public.contacts to authenticated;
revoke all on function public.enforce_contact_memberships(), public.enforce_candidate_contact_identity(), public.sync_linked_candidate_identity() from public, anon, authenticated;

create function public.promote_contact_to_candidate(target_contact_public_id text)
returns table (candidate_public_id text)
language plpgsql security definer set search_path = '' as $$
declare
  contact_record public.contacts%rowtype;
  actor_membership_id uuid;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'Authentication is required.';
  end if;
  select contact.* into contact_record
  from public.contacts contact
  where contact.public_id = target_contact_public_id
    and contact.archived_at is null
    and public.can_view_membership(contact.assigned_membership_id);
  if contact_record.id is null then
    raise exception using errcode = '42501', message = 'Contact access is required.';
  end if;
  actor_membership_id := public.current_active_membership_id(contact_record.organization_id);
  if actor_membership_id is null then
    raise exception using errcode = '42501', message = 'An active membership is required.';
  end if;
  if contact_record.primary_email is null then
    raise exception using errcode = '23514', message = 'Add an email address before promoting this contact.';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(contact_record.id::text, 0));
  if exists (select 1 from public.candidates candidate where candidate.contact_id = contact_record.id) then
    raise exception using errcode = '23505', message = 'This contact already has a candidate profile.';
  end if;
  insert into public.candidates (
    organization_id, contact_id, assigned_membership_id, created_by_membership_id,
    first_name, last_name, preferred_name, email, phone, status, pipeline_stage_id
  ) values (
    contact_record.organization_id, contact_record.id, contact_record.assigned_membership_id, actor_membership_id,
    contact_record.first_name, contact_record.last_name, contact_record.preferred_name,
    contact_record.primary_email, contact_record.primary_phone, 'active', 'lead'
  ) returning public_id into candidate_public_id;
  update public.contacts set lifecycle_status = 'active-candidate' where id = contact_record.id;
  return next;
end;
$$;

revoke all on function public.promote_contact_to_candidate(text) from public, anon;
grant execute on function public.promote_contact_to_candidate(text) to authenticated;

comment on table public.contacts is 'Permanent organization-owned human identity; candidate participation is an optional linked lifecycle context.';
comment on column public.candidates.contact_id is 'Compatibility bridge to the permanent contact source of truth. Existing candidates may remain unlinked during additive adoption.';
comment on function public.promote_contact_to_candidate(text) is 'Atomically creates one candidate profile for an authorized contact while preserving the permanent contact identity.';

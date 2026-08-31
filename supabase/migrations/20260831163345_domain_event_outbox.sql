-- Private, append-only transactional domain-event foundation.
create schema if not exists private;

create table private.domain_event_outbox (
  event_id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete restrict,
  actor_membership_id uuid,
  actor_user_id uuid references auth.users (id) on delete restrict,
  aggregate_type text not null check (length(btrim(aggregate_type)) between 1 and 100),
  aggregate_id text check (aggregate_id is null or length(btrim(aggregate_id)) between 1 and 200),
  event_type text not null check (event_type ~ '^[a-z][a-z0-9_-]*(\.[a-z][a-z0-9_-]*)+$'),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  schema_version integer not null default 1 check (schema_version > 0),
  occurred_at timestamptz not null,
  persisted_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  constraint domain_event_outbox_actor_context_check check (
    actor_membership_id is null or organization_id is not null
  ),
  constraint domain_event_outbox_actor_membership_fk
    foreign key (actor_membership_id, organization_id)
    references public.organization_memberships (id, organization_id)
    on delete restrict
);

create index domain_event_outbox_organization_time_idx
  on private.domain_event_outbox (organization_id, occurred_at, event_id)
  where organization_id is not null;
create index domain_event_outbox_event_type_time_idx
  on private.domain_event_outbox (event_type, occurred_at, event_id);
create index domain_event_outbox_aggregate_idx
  on private.domain_event_outbox (aggregate_type, aggregate_id, occurred_at)
  where aggregate_id is not null;

alter table private.domain_event_outbox enable row level security;

create function private.prevent_domain_event_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception using errcode = '55000', message = 'Domain events are append-only.';
end;
$$;

create trigger domain_event_outbox_append_only
before update or delete on private.domain_event_outbox
for each row execute function private.prevent_domain_event_mutation();

revoke all on schema private from public, anon, authenticated;
revoke all on table private.domain_event_outbox from public, anon, authenticated;
revoke all on function private.prevent_domain_event_mutation() from public, anon, authenticated;
grant usage on schema private to service_role;
grant select, insert on table private.domain_event_outbox to service_role;

comment on table private.domain_event_outbox is
  'Private append-only transactional domain events. Not a user-facing audit log and not directly accessible to application roles.';

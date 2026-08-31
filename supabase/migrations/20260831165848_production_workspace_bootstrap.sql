-- Atomic, self-service creation of an authenticated user's first workspace.
create function public.bootstrap_first_workspace(
  proposed_organization_name text,
  proposed_consultant_display_name text
) returns table (
  organization_id uuid,
  organization_public_id text,
  organization_name text,
  membership_id uuid,
  created boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_user_id uuid := auth.uid();
  normalized_organization_name text := nullif(btrim(proposed_organization_name), '');
  normalized_display_name text := nullif(btrim(proposed_consultant_display_name), '');
  existing_active_count integer;
  existing_membership_count integer;
  selected_organization public.organizations;
  selected_membership public.organization_memberships;
  event_time timestamptz := now();
begin
  if actor_user_id is null then
    raise exception using errcode = '42501', message = 'Authenticated user required.';
  end if;
  if normalized_organization_name is null or length(normalized_organization_name) > 200 then
    raise exception using errcode = '22023', message = 'Organization name must be between 1 and 200 characters.';
  end if;
  if normalized_display_name is null or length(normalized_display_name) > 120 then
    raise exception using errcode = '22023', message = 'Consultant display name must be between 1 and 120 characters.';
  end if;

  -- Retry and concurrent-submit safety is scoped to the authenticated identity.
  perform pg_advisory_xact_lock(hashtextextended(actor_user_id::text, 61706));

  select count(*), count(*) filter (where om.status = 'active')
    into existing_membership_count, existing_active_count
  from public.organization_memberships om
  where om.user_id = actor_user_id;

  if existing_active_count > 1 then
    raise exception using errcode = 'P0001', message = 'Workspace selection is required.';
  end if;

  if existing_active_count = 1 then
    select om.* into selected_membership
    from public.organization_memberships om
    where om.user_id = actor_user_id and om.status = 'active';
    select o.* into selected_organization
    from public.organizations o where o.id = selected_membership.organization_id;
    return query select selected_organization.id, selected_organization.public_id,
      selected_organization.name, selected_membership.id, false;
    return;
  end if;

  if existing_membership_count > 0 then
    raise exception using errcode = '42501', message = 'Existing membership state prevents workspace bootstrap.';
  end if;

  insert into public.organizations (name)
  values (normalized_organization_name)
  returning * into selected_organization;

  insert into public.organization_memberships (organization_id, user_id, role, status)
  values (selected_organization.id, actor_user_id, 'owner', 'active')
  returning * into selected_membership;

  insert into public.consultant_profiles (membership_id, organization_id, display_name)
  values (selected_membership.id, selected_organization.id, normalized_display_name);

  insert into public.organization_settings (organization_id, display_name)
  values (selected_organization.id, selected_organization.name);

  insert into public.membership_onboarding (membership_id, organization_id, status)
  values (selected_membership.id, selected_organization.id, 'not-started');

  insert into private.domain_event_outbox (
    organization_id, actor_membership_id, actor_user_id, aggregate_type,
    aggregate_id, event_type, payload, occurred_at
  ) values
  (selected_organization.id, selected_membership.id, actor_user_id, 'organization',
    selected_organization.id::text, 'organization.created',
    jsonb_build_object('organizationId', selected_organization.id, 'publicId', selected_organization.public_id), event_time),
  (selected_organization.id, selected_membership.id, actor_user_id, 'organization-membership',
    selected_membership.id::text, 'organization-membership.established',
    jsonb_build_object('membershipId', selected_membership.id, 'role', 'owner', 'status', 'active'), event_time);

  return query select selected_organization.id, selected_organization.public_id,
    selected_organization.name, selected_membership.id, true;
end;
$$;

revoke all on function public.bootstrap_first_workspace(text, text) from public, anon, authenticated;
grant execute on function public.bootstrap_first_workspace(text, text) to authenticated;

comment on function public.bootstrap_first_workspace(text, text) is
  'Atomically creates or returns the authenticated user''s first active production workspace.';

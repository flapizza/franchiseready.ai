-- Membership profile, organization settings, and membership onboarding.
create type public.membership_onboarding_status as enum ('not-started', 'in-progress', 'completed');

create table public.consultant_profiles (
  membership_id uuid primary key,
  organization_id uuid not null,
  display_name text check (display_name is null or length(btrim(display_name)) between 1 and 120),
  professional_title text check (professional_title is null or length(btrim(professional_title)) <= 160),
  professional_email text check (professional_email is null or professional_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  professional_phone text check (professional_phone is null or length(btrim(professional_phone)) between 7 and 40),
  linkedin_url text check (linkedin_url is null or linkedin_url ~ '^https://'),
  scheduling_url text check (scheduling_url is null or scheduling_url ~ '^https://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consultant_profiles_membership_organization_fk
    foreign key (membership_id, organization_id)
    references public.organization_memberships (id, organization_id)
    on delete cascade
);

create index consultant_profiles_organization_idx on public.consultant_profiles (organization_id, membership_id);

create table public.organization_settings (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  display_name text check (display_name is null or length(btrim(display_name)) between 1 and 200),
  website_url text check (website_url is null or website_url ~ '^https://'),
  branding_version integer not null default 1 check (branding_version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.membership_onboarding (
  membership_id uuid primary key,
  organization_id uuid not null,
  status public.membership_onboarding_status not null default 'not-started',
  current_step text check (current_step is null or length(btrim(current_step)) between 1 and 100),
  completed_steps text[] not null default '{}'::text[],
  onboarding_version integer not null default 1 check (onboarding_version > 0),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_onboarding_membership_organization_fk
    foreign key (membership_id, organization_id)
    references public.organization_memberships (id, organization_id)
    on delete cascade,
  constraint membership_onboarding_timestamp_state_check check (
    (status = 'not-started' and started_at is null and completed_at is null)
    or (status = 'in-progress' and started_at is not null and completed_at is null)
    or (status = 'completed' and started_at is not null and completed_at is not null)
  )
);

create index membership_onboarding_organization_idx on public.membership_onboarding (organization_id, membership_id);

create trigger consultant_profiles_set_updated_at before update on public.consultant_profiles
for each row execute function public.set_updated_at();
create trigger organization_settings_set_updated_at before update on public.organization_settings
for each row execute function public.set_updated_at();
create trigger membership_onboarding_set_updated_at before update on public.membership_onboarding
for each row execute function public.set_updated_at();

alter table public.consultant_profiles enable row level security;
alter table public.organization_settings enable row level security;
alter table public.membership_onboarding enable row level security;

create policy consultant_profiles_select_authorized on public.consultant_profiles
for select to authenticated using (public.can_view_membership(membership_id));
create policy organization_settings_select_active_member on public.organization_settings
for select to authenticated using (public.is_active_organization_member(organization_id));
create policy membership_onboarding_select_self on public.membership_onboarding
for select to authenticated using (membership_id = public.current_active_membership_id(organization_id));

revoke all on table public.consultant_profiles, public.organization_settings, public.membership_onboarding from anon;
revoke all on table public.consultant_profiles, public.organization_settings, public.membership_onboarding from authenticated;
grant select on table public.consultant_profiles, public.organization_settings, public.membership_onboarding to authenticated;

create function public.save_consultant_profile(
  target_organization_id uuid,
  proposed_display_name text,
  proposed_professional_title text,
  proposed_professional_email text,
  proposed_professional_phone text,
  proposed_linkedin_url text,
  proposed_scheduling_url text
) returns public.consultant_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_membership uuid;
  saved public.consultant_profiles;
  event_time timestamptz := now();
begin
  actor_membership := public.current_active_membership_id(target_organization_id);
  if actor_membership is null then raise exception using errcode = '42501', message = 'Active membership required.'; end if;
  insert into public.consultant_profiles (membership_id, organization_id, display_name, professional_title, professional_email, professional_phone, linkedin_url, scheduling_url)
  values (actor_membership, target_organization_id, nullif(btrim(proposed_display_name), ''), nullif(btrim(proposed_professional_title), ''), nullif(btrim(proposed_professional_email), ''), nullif(btrim(proposed_professional_phone), ''), nullif(btrim(proposed_linkedin_url), ''), nullif(btrim(proposed_scheduling_url), ''))
  on conflict (membership_id) do update set display_name=excluded.display_name, professional_title=excluded.professional_title, professional_email=excluded.professional_email, professional_phone=excluded.professional_phone, linkedin_url=excluded.linkedin_url, scheduling_url=excluded.scheduling_url
  returning * into saved;
  insert into private.domain_event_outbox (organization_id, actor_membership_id, actor_user_id, aggregate_type, aggregate_id, event_type, payload, occurred_at)
  values (target_organization_id, actor_membership, auth.uid(), 'consultant-profile', actor_membership::text, 'consultant-profile.saved', jsonb_build_object('membershipId', actor_membership, 'displayName', saved.display_name), event_time);
  return saved;
end;
$$;

create function public.save_organization_settings(target_organization_id uuid, proposed_display_name text, proposed_website_url text)
returns public.organization_settings language plpgsql security definer set search_path = '' as $$
declare saved public.organization_settings; actor_membership uuid; event_time timestamptz := now();
begin
  if not public.has_organization_role(target_organization_id, array['owner','admin']::public.membership_role[]) then raise exception using errcode='42501', message='Organization administration required.'; end if;
  actor_membership := public.current_active_membership_id(target_organization_id);
  insert into public.organization_settings (organization_id, display_name, website_url)
  values (target_organization_id, nullif(btrim(proposed_display_name),''), nullif(btrim(proposed_website_url),''))
  on conflict (organization_id) do update set display_name=excluded.display_name, website_url=excluded.website_url returning * into saved;
  insert into private.domain_event_outbox (organization_id,actor_membership_id,actor_user_id,aggregate_type,aggregate_id,event_type,payload,occurred_at)
  values(target_organization_id,actor_membership,auth.uid(),'organization-settings',target_organization_id::text,'organization-settings.saved',jsonb_build_object('organizationId',target_organization_id,'displayName',saved.display_name),event_time);
  return saved;
end;$$;

create function public.set_membership_onboarding_state(target_organization_id uuid, proposed_status public.membership_onboarding_status, proposed_current_step text, proposed_completed_steps text[])
returns public.membership_onboarding language plpgsql security definer set search_path = '' as $$
declare saved public.membership_onboarding; actor_membership uuid; event_time timestamptz := now(); prior_started timestamptz;
begin
  actor_membership := public.current_active_membership_id(target_organization_id);
  if actor_membership is null then raise exception using errcode='42501', message='Active membership required.'; end if;
  select started_at into prior_started from public.membership_onboarding where membership_id=actor_membership;
  insert into public.membership_onboarding (membership_id,organization_id,status,current_step,completed_steps,started_at,completed_at)
  values(actor_membership,target_organization_id,proposed_status,nullif(btrim(proposed_current_step),''),coalesce(proposed_completed_steps,'{}'::text[]),case when proposed_status='not-started' then null else coalesce(prior_started,event_time) end,case when proposed_status='completed' then event_time else null end)
  on conflict (membership_id) do update set status=excluded.status,current_step=excluded.current_step,completed_steps=excluded.completed_steps,started_at=excluded.started_at,completed_at=excluded.completed_at returning * into saved;
  insert into private.domain_event_outbox (organization_id,actor_membership_id,actor_user_id,aggregate_type,aggregate_id,event_type,payload,occurred_at)
  values(target_organization_id,actor_membership,auth.uid(),'membership-onboarding',actor_membership::text,'membership-onboarding.state-changed',jsonb_build_object('membershipId',actor_membership,'status',saved.status,'currentStep',saved.current_step),event_time);
  return saved;
end;$$;

revoke all on function public.save_consultant_profile(uuid,text,text,text,text,text,text), public.save_organization_settings(uuid,text,text), public.set_membership_onboarding_state(uuid,public.membership_onboarding_status,text,text[]) from public, anon, authenticated;
grant execute on function public.save_consultant_profile(uuid,text,text,text,text,text,text), public.save_organization_settings(uuid,text,text), public.set_membership_onboarding_state(uuid,public.membership_onboarding_status,text,text[]) to authenticated;

comment on function public.save_consultant_profile(uuid,text,text,text,text,text,text) is 'Atomic self-membership consultant profile upsert with domain event.';
comment on function public.save_organization_settings(uuid,text,text) is 'Atomic owner/admin organization settings upsert with domain event.';
comment on function public.set_membership_onboarding_state(uuid,public.membership_onboarding_status,text,text[]) is 'Atomic self-membership onboarding state upsert with domain event.';

create type public.membership_invitation_status as enum ('pending', 'accepted', 'revoked');

create table public.membership_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  inviter_membership_id uuid not null,
  invited_email text not null check (invited_email = lower(btrim(invited_email)) and invited_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  intended_role public.membership_role not null check (intended_role in ('consultant','admin')),
  token_hash bytea not null unique check (octet_length(token_hash) = 32),
  status public.membership_invitation_status not null default 'pending',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  revoked_at timestamptz,
  accepted_membership_id uuid,
  constraint membership_invitations_inviter_fk foreign key (inviter_membership_id,organization_id) references public.organization_memberships(id,organization_id) on delete restrict,
  constraint membership_invitations_accepted_membership_fk foreign key (accepted_membership_id,organization_id) references public.organization_memberships(id,organization_id) on delete restrict,
  constraint membership_invitations_state_check check (
    (status='pending' and accepted_at is null and revoked_at is null and accepted_membership_id is null)
    or (status='accepted' and accepted_at is not null and revoked_at is null and accepted_membership_id is not null)
    or (status='revoked' and accepted_at is null and revoked_at is not null and accepted_membership_id is null)
  )
);
create unique index membership_invitations_pending_email_idx on public.membership_invitations(organization_id,invited_email) where status='pending';
create index membership_invitations_organization_created_idx on public.membership_invitations(organization_id,created_at desc);
alter table public.membership_invitations enable row level security;
revoke all on table public.membership_invitations from public,anon,authenticated;

create function public.create_membership_invitation(target_organization_id uuid, proposed_email text, proposed_role public.membership_role, presented_token text)
returns table(invitation_id uuid, created boolean)
language plpgsql security definer set search_path='' as $$
declare
  actor_membership uuid;
  actor_role public.membership_role;
  normalized_email text := lower(btrim(proposed_email));
  existing_id uuid;
  resulting_id uuid;
  was_created boolean := false;
  event_time timestamptz := now();
begin
  if auth.uid() is null then raise exception using errcode='42501',message='Authenticated user required.'; end if;
  if normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(normalized_email)>254 then raise exception using errcode='22023',message='A valid invited email is required.'; end if;
  if presented_token !~ '^[A-Za-z0-9_-]{43,200}$' then raise exception using errcode='22023',message='A strong invitation token is required.'; end if;
  if proposed_role not in ('consultant','admin') then raise exception using errcode='42501',message='Invitation role is not allowed.'; end if;
  select om.id,om.role into actor_membership,actor_role from public.organization_memberships om where om.organization_id=target_organization_id and om.user_id=auth.uid() and om.status='active';
  if actor_membership is null or actor_role not in ('owner','admin') then raise exception using errcode='42501',message='Organization leadership required.'; end if;
  if proposed_role='admin' and actor_role<>'owner' then raise exception using errcode='42501',message='Only an owner may invite an administrator.'; end if;
  if exists(select 1 from public.organization_memberships om join auth.users u on u.id=om.user_id where om.organization_id=target_organization_id and om.status='active' and lower(u.email)=normalized_email) then raise exception using errcode='23505',message='This email already has an active membership.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(target_organization_id::text||':'||normalized_email,71049));
  select mi.id into existing_id from public.membership_invitations mi where mi.organization_id=target_organization_id and mi.invited_email=normalized_email and mi.status='pending' for update;
  if existing_id is not null then
    update public.membership_invitations set token_hash=extensions.digest(presented_token,'sha256'),intended_role=proposed_role,expires_at=event_time+interval '7 days' where id=existing_id returning id into resulting_id;
  else
    insert into public.membership_invitations(organization_id,inviter_membership_id,invited_email,intended_role,token_hash,expires_at)
    values(target_organization_id,actor_membership,normalized_email,proposed_role,extensions.digest(presented_token,'sha256'),event_time+interval '7 days') returning id into resulting_id;
    was_created:=true;
    insert into private.domain_event_outbox(organization_id,actor_membership_id,actor_user_id,aggregate_type,aggregate_id,event_type,payload,occurred_at)
    values(target_organization_id,actor_membership,auth.uid(),'membership-invitation',resulting_id::text,'membership-invitation.created',jsonb_build_object('invitationId',resulting_id,'intendedRole',proposed_role),event_time);
  end if;
  return query select resulting_id,was_created;
end;$$;

create function public.resolve_membership_invitation(presented_token text)
returns table(resolution text, organization_name text, intended_role public.membership_role)
language plpgsql security definer set search_path='' as $$
declare found_invitation public.membership_invitations; found_organization_name text;
begin
  if presented_token !~ '^[A-Za-z0-9_-]{43,200}$' then return query select 'invalid'::text,null::text,null::public.membership_role; return; end if;
  select mi.* into found_invitation from public.membership_invitations mi where mi.token_hash=extensions.digest(presented_token,'sha256');
  if not found then return query select 'invalid'::text,null::text,null::public.membership_role; return; end if;
  select o.name into found_organization_name from public.organizations o where o.id=found_invitation.organization_id;
  if found_invitation.status='revoked' then return query select 'revoked',found_organization_name,found_invitation.intended_role; return; end if;
  if found_invitation.status='accepted' then return query select 'accepted',found_organization_name,found_invitation.intended_role; return; end if;
  if found_invitation.expires_at<=now() then return query select 'expired',found_organization_name,found_invitation.intended_role; return; end if;
  return query select 'available',found_organization_name,found_invitation.intended_role;
end;$$;

create function public.accept_membership_invitation(presented_token text)
returns table(organization_id uuid,membership_id uuid,accepted boolean)
language plpgsql security definer set search_path='' as $$
declare invitation public.membership_invitations; recipient auth.users; established public.organization_memberships; event_time timestamptz:=now();
begin
  if auth.uid() is null then raise exception using errcode='42501',message='Authenticated user required.'; end if;
  select u.* into recipient from auth.users u where u.id=auth.uid();
  if recipient.email is null or recipient.email_confirmed_at is null then raise exception using errcode='42501',message='A verified email is required.'; end if;
  select mi.* into invitation from public.membership_invitations mi where mi.token_hash=extensions.digest(presented_token,'sha256') for update;
  if not found then raise exception using errcode='22023',message='Invitation is invalid.'; end if;
  if lower(btrim(recipient.email))<>invitation.invited_email then raise exception using errcode='42501',message='Invitation email does not match authenticated user.'; end if;
  if invitation.status='accepted' then return query select invitation.organization_id,invitation.accepted_membership_id,false; return; end if;
  if invitation.status='revoked' then raise exception using errcode='42501',message='Invitation is revoked.'; end if;
  if invitation.expires_at<=event_time then raise exception using errcode='22023',message='Invitation is expired.'; end if;
  insert into public.organization_memberships(organization_id,user_id,role,status)
  values(invitation.organization_id,auth.uid(),invitation.intended_role,'active')
  on conflict on constraint organization_memberships_organization_user_key do nothing returning * into established;
  if established.id is null then
    select om.* into established from public.organization_memberships om where om.organization_id=invitation.organization_id and om.user_id=auth.uid();
    if established.status<>'active' or established.role<>invitation.intended_role then raise exception using errcode='23505',message='An incompatible membership already exists.'; end if;
  end if;
  insert into public.consultant_profiles(membership_id,organization_id,display_name) values(established.id,established.organization_id,split_part(recipient.email,'@',1)) on conflict on constraint consultant_profiles_pkey do nothing;
  insert into public.membership_onboarding(membership_id,organization_id,status) values(established.id,established.organization_id,'not-started') on conflict on constraint membership_onboarding_pkey do nothing;
  update public.membership_invitations set status='accepted',accepted_at=event_time,accepted_membership_id=established.id where id=invitation.id;
  insert into private.domain_event_outbox(organization_id,actor_membership_id,actor_user_id,aggregate_type,aggregate_id,event_type,payload,occurred_at) values
  (established.organization_id,established.id,auth.uid(),'membership-invitation',invitation.id::text,'membership-invitation.accepted',jsonb_build_object('invitationId',invitation.id,'membershipId',established.id),event_time),
  (established.organization_id,established.id,auth.uid(),'organization-membership',established.id::text,'organization-membership.established',jsonb_build_object('membershipId',established.id,'role',established.role,'status','active'),event_time);
  return query select established.organization_id,established.id,true;
end;$$;

create function public.revoke_membership_invitation(target_invitation_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare invitation public.membership_invitations; actor_membership uuid; event_time timestamptz:=now();
begin
  if auth.uid() is null then raise exception using errcode='42501',message='Authenticated user required.'; end if;
  select mi.* into invitation from public.membership_invitations mi where mi.id=target_invitation_id for update;
  if not found then raise exception using errcode='22023',message='Invitation not found.'; end if;
  select om.id into actor_membership from public.organization_memberships om where om.organization_id=invitation.organization_id and om.user_id=auth.uid() and om.status='active' and om.role in('owner','admin');
  if actor_membership is null then raise exception using errcode='42501',message='Organization leadership required.'; end if;
  if invitation.status<>'pending' then raise exception using errcode='55000',message='Only pending invitations may be revoked.'; end if;
  update public.membership_invitations set status='revoked',revoked_at=event_time where id=invitation.id;
  insert into private.domain_event_outbox(organization_id,actor_membership_id,actor_user_id,aggregate_type,aggregate_id,event_type,payload,occurred_at)
  values(invitation.organization_id,actor_membership,auth.uid(),'membership-invitation',invitation.id::text,'membership-invitation.revoked',jsonb_build_object('invitationId',invitation.id),event_time);
end;$$;

revoke all on function public.create_membership_invitation(uuid,text,public.membership_role,text),public.resolve_membership_invitation(text),public.accept_membership_invitation(text),public.revoke_membership_invitation(uuid) from public,anon,authenticated;
grant execute on function public.create_membership_invitation(uuid,text,public.membership_role,text),public.accept_membership_invitation(text),public.revoke_membership_invitation(uuid) to authenticated;
grant execute on function public.resolve_membership_invitation(text) to anon,authenticated;

create or replace function public.accept_membership_invitation(presented_token text)
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
  insert into public.organization_memberships(organization_id,user_id,role,status) values(invitation.organization_id,auth.uid(),invitation.intended_role,'active')
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

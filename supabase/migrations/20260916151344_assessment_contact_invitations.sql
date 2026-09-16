-- Contact invitations reuse the production assessment and immutable evidence tables.
alter table public.assessment_sessions alter column candidate_id drop not null;
alter table public.assessment_sessions add column contact_id uuid;
alter table public.assessment_sessions add constraint assessment_sessions_contact_org_fk
  foreign key (contact_id, organization_id) references public.contacts(id, organization_id);
alter table public.assessment_sessions add constraint assessment_sessions_identity_required
  check (candidate_id is not null or contact_id is not null);
alter table public.assessment_sessions add constraint assessment_sessions_completion_candidate
  check (status not in ('submitted','analyzed') or candidate_id is not null);
create index assessment_sessions_contact_idx on public.assessment_sessions(contact_id, created_at desc);

-- Short identity-changing transactions serialize within one tenant. Lock before
-- session/contact rows everywhere so replacement and completion cannot deadlock.
create function private.lock_assessment_identity(org uuid) returns void
language sql set search_path='' as $$
  select pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(org::text, 16151344))
$$;

create function private.enforce_assessment_identity() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_op='UPDATE' and (
    new.organization_id is distinct from old.organization_id
    or new.contact_id is distinct from old.contact_id
    or (old.candidate_id is not null and new.candidate_id is distinct from old.candidate_id)
    or new.token_hash is distinct from old.token_hash
  ) then raise exception 'assessment identity is immutable' using errcode='23514'; end if;
  if new.contact_id is not null and new.candidate_id is not null and not exists (
    select 1 from public.candidates c where c.id=new.candidate_id
      and c.organization_id=new.organization_id and c.contact_id=new.contact_id
  ) then raise exception 'inconsistent assessment identity' using errcode='23514'; end if;
  return new;
end $$;
create trigger assessment_sessions_identity before insert or update on public.assessment_sessions
for each row execute function private.enforce_assessment_identity();

-- Private helper: caller authorizes the explicit contact, never participant input.
create function private.assessment_candidate_for_contact(target_contact uuid, actor uuid)
returns public.candidates language plpgsql security definer set search_path='' as $$
declare p public.contacts; c public.candidates;
begin
  select * into p from public.contacts where id=target_contact;
  if p.id is null then raise exception 'contact unavailable' using errcode='42501'; end if;
  perform private.lock_assessment_identity(p.organization_id);
  select * into p from public.contacts where id=target_contact for update;
  if p.archived_at is not null or p.primary_email is null or not exists (
    select 1 from public.organization_memberships m where m.id=actor
      and m.organization_id=p.organization_id and m.status='active'
  ) or not exists (
    select 1 from public.organization_memberships m where m.id=p.assigned_membership_id
      and m.organization_id=p.organization_id and m.status='active'
  ) then raise exception 'contact unavailable for candidate promotion' using errcode='42501'; end if;
  -- Share normal candidate intake's email lock so intake cannot create an
  -- unlinked same-email candidate between our conflict check and insertion.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    p.organization_id::text||':'||p.normalized_primary_email,190607));
  select * into c from public.candidates where contact_id=p.id and organization_id=p.organization_id for update;
  if c.id is not null then
    if c.archived_at is not null or c.assigned_membership_id<>p.assigned_membership_id then
      raise exception 'candidate identity requires review' using errcode='P0001'; end if;
    return c;
  end if;
  -- Inspect the entire tenant, including identities the caller cannot read.
  -- Return no person details and never infer an association from these matches.
  if exists (select 1 from public.candidates x where x.organization_id=p.organization_id
    and (lower(btrim(x.email))=p.normalized_primary_email
      or (p.normalized_primary_phone is not null
        and nullif(regexp_replace(coalesce(x.phone,''),'[^0-9]+','','g'),'')=p.normalized_primary_phone)))
  then raise exception 'candidate identity requires review' using errcode='P0001'; end if;
  insert into public.candidates(organization_id,contact_id,assigned_membership_id,created_by_membership_id,
    first_name,last_name,preferred_name,email,phone,status,pipeline_stage_id)
  values(p.organization_id,p.id,p.assigned_membership_id,actor,p.first_name,p.last_name,p.preferred_name,
    p.primary_email,p.primary_phone,'active','lead') returning * into c;
  update public.contacts set lifecycle_status='active-candidate' where id=p.id;
  return c;
end $$;

-- Normal intake shares the existing tenant identity lock with promotion. This
-- protects BOTH email and phone conflict predicates, including absent rows.
-- Lock order is tenant first, then the legacy email lock; no field-order cycle.
-- SECURITY DEFINER is restricted to an active actor's own candidate creation;
-- tenant-wide conflicts fail without disclosing inaccessible candidate data.
create or replace function public.create_assessment_candidate(target_organization_id uuid,
  proposed_first_name text,proposed_last_name text,proposed_email text,proposed_phone text)
returns setof public.candidates language plpgsql security definer set search_path='' as $$
declare actor uuid; normalized text:=lower(btrim(proposed_email));
  normalized_phone text:=nullif(regexp_replace(coalesce(proposed_phone,''),'[^0-9]+','','g'),'');
  matches integer; existing public.candidates;
begin
  actor:=public.current_active_membership_id(target_organization_id);
  if auth.uid() is null or actor is null then raise exception 'workspace unavailable' using errcode='42501'; end if;
  if coalesce(btrim(proposed_first_name),'')='' or coalesce(btrim(proposed_last_name),'')=''
    or coalesce(normalized,'') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'invalid candidate' using errcode='22023'; end if;
  perform private.lock_assessment_identity(target_organization_id);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target_organization_id::text||':'||normalized,190607));
  select count(*) into matches from public.candidates x where x.organization_id=target_organization_id
    and lower(btrim(x.email))=normalized and x.archived_at is null;
  if matches>1 then raise exception 'candidate identity requires review' using errcode='22023'; end if;
  if matches=1 then
    select * into existing from public.candidates x where x.organization_id=target_organization_id
      and lower(btrim(x.email))=normalized and x.archived_at is null;
    if not public.can_access_candidate(existing.id) then
      raise exception 'candidate identity requires review' using errcode='22023'; end if;
    -- Preserve the existing authorized exact-email intake retry, not a new merge.
    return next existing; return;
  end if;
  if normalized_phone is not null and exists(select 1 from public.candidates x
    where x.organization_id=target_organization_id
      and nullif(regexp_replace(coalesce(x.phone,''),'[^0-9]+','','g'),'')=normalized_phone) then
    raise exception 'candidate identity requires review' using errcode='22023'; end if;
  return query insert into public.candidates(organization_id,assigned_membership_id,created_by_membership_id,
    first_name,last_name,email,phone,status,pipeline_stage_id)
  values(target_organization_id,actor,actor,btrim(proposed_first_name),btrim(proposed_last_name),normalized,
    nullif(btrim(proposed_phone),''),'active','lead') returning *;
end $$;
revoke all on function public.create_assessment_candidate(uuid,text,text,text,text) from public,anon,authenticated,service_role;
grant execute on function public.create_assessment_candidate(uuid,text,text,text,text) to authenticated;

create or replace function public.promote_contact_to_candidate(target_contact_public_id text)
returns table(candidate_public_id text) language plpgsql security definer set search_path='' as $$
declare p public.contacts; c public.candidates; actor uuid;
begin
  select * into p from public.contacts where public_id=target_contact_public_id
    and archived_at is null and public.can_view_membership(assigned_membership_id);
  actor:=public.current_active_membership_id(p.organization_id);
  if auth.uid() is null or p.id is null or actor is null then
    raise exception 'contact access required' using errcode='42501'; end if;
  perform private.lock_assessment_identity(p.organization_id);
  -- Recheck authorization after acquiring the identity lock.
  select * into p from public.contacts where id=p.id and archived_at is null
    and public.can_view_membership(assigned_membership_id) for update;
  if p.id is null then raise exception 'contact access required' using errcode='42501'; end if;
  c:=private.assessment_candidate_for_contact(p.id,actor);
  candidate_public_id:=c.public_id; return next;
end $$;

create function private.replace_assessment_invitation(org uuid, candidate uuid, contact uuid,
  owner_id uuid, actor uuid, token_digest text, expires timestamptz, expected uuid)
returns public.assessment_sessions language plpgsql security definer set search_path='' as $$
declare previous public.assessment_sessions; result public.assessment_sessions;
begin
  perform private.lock_assessment_identity(org);
  if token_digest is null or token_digest!~'^[0-9a-f]{64}$' or expires is null or expires<=now() then
    raise exception 'invalid invitation' using errcode='22023'; end if;
  if exists(select 1 from public.assessment_sessions s where s.organization_id=org
    and (s.candidate_id=candidate or s.contact_id=contact)
    and s.instrument_version='franchise-ownership-assessment-v1' and s.status in ('submitted','analyzed')) then
    raise exception 'completed assessment history must be preserved' using errcode='55000'; end if;
  select * into previous from public.assessment_sessions s where s.organization_id=org
    and (s.candidate_id=candidate or s.contact_id=contact)
    and s.instrument_version='franchise-ownership-assessment-v1'
    order by s.created_at desc,s.id desc limit 1 for update;
  if previous.id is distinct from expected then
    raise exception 'assessment invitation changed; refresh before replacement' using errcode='40001'; end if;
  update public.assessment_sessions s set status='cancelled',revoked_at=now(),updated_at=now()
    where s.organization_id=org and (s.candidate_id=candidate or s.contact_id=contact)
      and s.instrument_version='franchise-ownership-assessment-v1' and s.status in('created','invited','in-progress');
  insert into public.assessment_sessions(organization_id,candidate_id,contact_id,owning_membership_id,
    created_by_membership_id,token_hash,expires_at,created_at,updated_at)
    values(org,candidate,contact,owner_id,actor,token_digest,expires,clock_timestamp(),clock_timestamp()) returning * into result;
  return result;
end $$;

drop function public.create_assessment_invitation(text,text,timestamptz);
create function public.create_assessment_invitation(target_candidate_public_id text,presented_token_hash text,
  invitation_expires_at timestamptz, expected_replacement_id uuid default null)
returns setof public.assessment_sessions language plpgsql security definer set search_path='' as $$
declare c public.candidates; actor uuid; result public.assessment_sessions;
begin
  select * into c from public.candidates where public_id=target_candidate_public_id and public.can_access_candidate(id);
  if c.id is null then raise exception 'candidate unavailable' using errcode='42501'; end if;
  perform private.lock_assessment_identity(c.organization_id);
  select * into c from public.candidates where id=c.id and archived_at is null and public.can_access_candidate(id) for update;
  actor:=public.current_active_membership_id(c.organization_id);
  if c.id is null or actor is null then raise exception 'candidate unavailable' using errcode='42501'; end if;
  result:=private.replace_assessment_invitation(c.organization_id,c.id,c.contact_id,c.assigned_membership_id,
    actor,presented_token_hash,invitation_expires_at,expected_replacement_id);
  return next result;
end $$;

-- Consultant DTO deliberately omits token hashes and internal identity IDs.
create function public.get_contact_assessment(target_contact_public_id text) returns jsonb
language sql security definer set search_path='' as $$
  select (to_jsonb(s)-'token_hash'-'candidate_id'-'contact_id') || jsonb_build_object(
    'candidate_public_id',c.public_id,'contact_public_id',p.public_id,'analysis_snapshot',a.analysis_snapshot,
    'identity_conflict',s.status not in('submitted','analyzed') and (
      p.assigned_membership_id<>s.owning_membership_id
      or exists(select 1 from public.candidates linked where linked.contact_id=p.id
        and (linked.archived_at is not null or linked.assigned_membership_id<>p.assigned_membership_id))
      or (not exists(select 1 from public.candidates linked where linked.contact_id=p.id)
        and exists(select 1 from public.candidates x where x.organization_id=p.organization_id
          and (lower(btrim(x.email))=p.normalized_primary_email or (p.normalized_primary_phone is not null
            and nullif(regexp_replace(coalesce(x.phone,''),'[^0-9]+','','g'),'')=p.normalized_primary_phone))))))
  from public.contacts p join public.assessment_sessions s on s.contact_id=p.id
    or s.candidate_id in (select linked.id from public.candidates linked where linked.contact_id=p.id)
  left join public.candidates c on c.id=s.candidate_id
  left join public.assessment_analyses a on a.session_id=s.id and a.superseded_at is null
  where p.public_id=target_contact_public_id and p.archived_at is null
    and public.can_view_membership(p.assigned_membership_id)
    and (s.candidate_id is null or public.can_access_candidate(s.candidate_id))
  order by s.created_at desc,s.id desc limit 1
$$;

create or replace function public.get_candidate_assessment(target_candidate_public_id text)
returns table(id uuid,public_id text,candidate_public_id text,status public.assessment_session_status,
  current_section smallint,started_at timestamptz,last_saved_at timestamptz,submitted_at timestamptz,
  completed_at timestamptz,expires_at timestamptz,revoked_at timestamptz,progress_snapshot jsonb,analysis_snapshot jsonb)
language sql security definer set search_path='' as $$
  select s.id,s.public_id,c.public_id,s.status,s.current_section,s.started_at,s.last_saved_at,
    s.submitted_at,s.completed_at,s.expires_at,s.revoked_at,s.progress_snapshot,a.analysis_snapshot
  from public.candidates c join public.assessment_sessions s on s.candidate_id=c.id or s.contact_id=c.contact_id
  left join public.assessment_analyses a on a.session_id=s.id and a.superseded_at is null
  where c.public_id=target_candidate_public_id and public.can_access_candidate(c.id)
  order by s.created_at desc,s.id desc limit 1
$$;

create function public.create_contact_assessment_invitation(target_contact_public_id text,presented_token_hash text,
  invitation_expires_at timestamptz,expected_replacement_id uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare p public.contacts; c public.candidates; actor uuid;
begin
  select * into p from public.contacts where public_id=target_contact_public_id and archived_at is null
    and public.can_view_membership(assigned_membership_id);
  if p.id is null then raise exception 'contact unavailable' using errcode='42501'; end if;
  perform private.lock_assessment_identity(p.organization_id);
  select * into p from public.contacts where id=p.id and archived_at is null
    and public.can_view_membership(assigned_membership_id) for update;
  actor:=public.current_active_membership_id(p.organization_id);
  if p.id is null or actor is null or p.primary_email is null then
    raise exception 'contact unavailable for assessment' using errcode='42501'; end if;
  select * into c from public.candidates where contact_id=p.id and organization_id=p.organization_id;
  if c.id is not null and (c.archived_at is not null or not public.can_access_candidate(c.id)) then
    raise exception 'candidate unavailable' using errcode='42501'; end if;
  perform private.replace_assessment_invitation(p.organization_id,c.id,p.id,p.assigned_membership_id,
    actor,presented_token_hash,invitation_expires_at,expected_replacement_id);
  return public.get_contact_assessment(target_contact_public_id);
end $$;

create function public.revoke_contact_assessment_invitation(target_contact_public_id text) returns void
language plpgsql security definer set search_path='' as $$
declare p public.contacts; resolved jsonb; s public.assessment_sessions;
begin
  select * into p from public.contacts where public_id=target_contact_public_id and archived_at is null
    and public.can_view_membership(assigned_membership_id);
  if p.id is null then raise exception 'contact unavailable' using errcode='42501'; end if;
  perform private.lock_assessment_identity(p.organization_id);
  select * into p from public.contacts where id=p.id and archived_at is null
    and public.can_view_membership(assigned_membership_id) for update;
  if p.id is null then raise exception 'contact unavailable' using errcode='42501'; end if;
  -- Use the SAME authorized resolution as status, including legacy sessions
  -- attached through the explicitly linked candidate rather than contact_id.
  resolved:=public.get_contact_assessment(target_contact_public_id);
  select * into s from public.assessment_sessions where id=(resolved->>'id')::uuid
    and organization_id=p.organization_id
    and (candidate_id is null or public.can_access_candidate(candidate_id)) for update;
  if s.id is null then raise exception 'assessment unavailable' using errcode='42501'; end if;
  if s.status in('submitted','analyzed') then
    raise exception 'completed assessment history must be preserved' using errcode='55000'; end if;
  if s.revoked_at is not null then return; end if;
  update public.assessment_sessions set status='cancelled',revoked_at=now(),updated_at=now()
    where id=s.id;
end $$;

create or replace function public.revoke_assessment_invitation(target_candidate_public_id text) returns void
language plpgsql security definer set search_path='' as $$
declare c public.candidates;
begin
  select * into c from public.candidates where public_id=target_candidate_public_id and public.can_access_candidate(id);
  if c.id is null then raise exception 'candidate unavailable' using errcode='42501'; end if;
  perform private.lock_assessment_identity(c.organization_id);
  select * into c from public.candidates where id=c.id and public.can_access_candidate(id) for update;
  if c.id is null then raise exception 'candidate unavailable' using errcode='42501'; end if;
  update public.assessment_sessions set status='cancelled',revoked_at=now(),updated_at=now()
    where (candidate_id=c.id or contact_id=c.contact_id) and status in('created','invited','in-progress');
end $$;

create or replace function public.finalize_assessment_trusted(presented_token_hash text,candidate_progress jsonb,authoritative_analysis jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare s public.assessment_sessions; sub public.assessment_submissions; c public.candidates; p public.contacts;
begin
  if not private.validate_assessment_progress(candidate_progress,true) then raise exception 'invalid assessment submission' using errcode='22023'; end if;
  select * into s from public.assessment_sessions where token_hash=presented_token_hash;
  if s.id is null then raise exception 'assessment unavailable' using errcode='42501'; end if;
  perform private.lock_assessment_identity(s.organization_id);
  select * into s from public.assessment_sessions where token_hash=presented_token_hash for update;
  if s.revoked_at is not null or s.expires_at<=now() then raise exception 'assessment unavailable' using errcode='42501'; end if;
  if s.status='analyzed' then
    select * into sub from public.assessment_submissions where session_id=s.id;
    if sub.intake_snapshot is distinct from candidate_progress->'intake' or sub.response_snapshot is distinct from candidate_progress->'answers' then
      raise exception 'submitted assessment evidence is immutable' using errcode='55000'; end if;
    return public.load_assessment_by_token(presented_token_hash);
  end if;
  if s.status not in('created','invited','in-progress') then raise exception 'assessment unavailable' using errcode='42501'; end if;
  if jsonb_typeof(authoritative_analysis) is distinct from 'object' or authoritative_analysis->>'version' is distinct from 'franchise-ownership-v1'
    or authoritative_analysis->>'analysisVersion' is distinct from '2' or jsonb_typeof(authoritative_analysis->'ownershipProfile') is distinct from 'object'
    or jsonb_typeof(authoritative_analysis->'consultantBrief') is distinct from 'object' then
    raise exception 'trusted analysis required' using errcode='22023'; end if;
  if s.contact_id is not null then
    select * into p from public.contacts where id=s.contact_id and organization_id=s.organization_id for update;
    if p.id is null or p.archived_at is not null or p.assigned_membership_id<>s.owning_membership_id then
      raise exception 'assessment identity requires review' using errcode='P0001'; end if;
    c:=private.assessment_candidate_for_contact(p.id,s.created_by_membership_id);
    if s.candidate_id is not null and s.candidate_id<>c.id then
      raise exception 'assessment identity requires review' using errcode='P0001'; end if;
    update public.assessment_sessions set candidate_id=c.id where id=s.id;
  else
    select * into c from public.candidates where id=s.candidate_id and organization_id=s.organization_id and archived_at is null;
    if c.id is null then raise exception 'candidate unavailable' using errcode='42501'; end if;
  end if;
  insert into public.assessment_submissions(session_id,organization_id,instrument_version,intake_snapshot,response_snapshot)
    values(s.id,s.organization_id,s.instrument_version,candidate_progress->'intake',candidate_progress->'answers') returning * into sub;
  insert into public.assessment_analyses(session_id,submission_id,organization_id,instrument_version,analysis_version,analysis_snapshot)
    values(s.id,sub.id,s.organization_id,s.instrument_version,2,authoritative_analysis);
  update public.assessment_sessions set status='analyzed',progress_snapshot=null,started_at=coalesce(started_at,now()),
    submitted_at=now(),completed_at=now(),last_saved_at=now(),updated_at=now() where id=s.id;
  return public.load_assessment_by_token(presented_token_hash);
end $$;

-- Contact-only state is available only through authorized status RPCs; existing
-- candidate RLS starts exposing the session/evidence once promotion attaches it.
revoke all on function private.lock_assessment_identity(uuid),private.enforce_assessment_identity(),
  private.assessment_candidate_for_contact(uuid,uuid),
  private.replace_assessment_invitation(uuid,uuid,uuid,uuid,uuid,text,timestamptz,uuid)
  from public,anon,authenticated,service_role;
revoke all on function public.create_assessment_invitation(text,text,timestamptz,uuid),
  public.create_contact_assessment_invitation(text,text,timestamptz,uuid),public.get_contact_assessment(text),
  public.revoke_contact_assessment_invitation(text) from public,anon,authenticated,service_role;
grant execute on function public.create_assessment_invitation(text,text,timestamptz,uuid),
  public.create_contact_assessment_invitation(text,text,timestamptz,uuid),public.get_contact_assessment(text),
  public.revoke_contact_assessment_invitation(text) to authenticated;
revoke all on function public.finalize_assessment_trusted(text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.finalize_assessment_trusted(text,jsonb,jsonb) to service_role;

-- Minimal new-person entry: create only a permanent Contact. Existing identities
-- require explicit selection; neither email nor phone authorizes automatic reuse.
create function public.create_assessment_contact(target_organization_id uuid,proposed_first_name text,
  proposed_last_name text,proposed_email text,proposed_phone text) returns text
language plpgsql security definer set search_path='' as $$
declare actor uuid; email_key text:=lower(btrim(proposed_email));
  phone_key text:=nullif(regexp_replace(coalesce(proposed_phone,''),'[^0-9]+','','g'),''); result text;
begin
  actor:=public.current_active_membership_id(target_organization_id);
  if auth.uid() is null or actor is null then raise exception 'workspace unavailable' using errcode='42501'; end if;
  if coalesce(btrim(proposed_first_name),'')='' or coalesce(btrim(proposed_last_name),'')=''
    or coalesce(email_key,'') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or length(coalesce(proposed_phone,''))>40 then raise exception 'invalid contact' using errcode='22023'; end if;
  perform private.lock_assessment_identity(target_organization_id);
  if exists(select 1 from public.contacts p where p.organization_id=target_organization_id
      and (p.normalized_primary_email=email_key or (phone_key is not null and p.normalized_primary_phone=phone_key)))
    or exists(select 1 from public.candidates c where c.organization_id=target_organization_id
      and (lower(btrim(c.email))=email_key or (phone_key is not null and nullif(regexp_replace(coalesce(c.phone,''),'[^0-9]+','','g'),'')=phone_key))) then
    raise exception 'person identity requires review' using errcode='P0001'; end if;
  insert into public.contacts(organization_id,created_by_membership_id,assigned_membership_id,first_name,last_name,
    primary_email,primary_phone,country,source,lifecycle_status)
    values(target_organization_id,actor,actor,btrim(proposed_first_name),btrim(proposed_last_name),email_key,
      nullif(btrim(proposed_phone),''),'US','Assessment invitation','prospect') returning public_id into result;
  return result;
end $$;
revoke all on function public.create_assessment_contact(uuid,text,text,text,text) from public,anon,authenticated,service_role;
grant execute on function public.create_assessment_contact(uuid,text,text,text,text) to authenticated;

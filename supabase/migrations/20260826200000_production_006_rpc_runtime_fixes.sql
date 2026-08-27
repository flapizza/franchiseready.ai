-- Fix two PL/pgSQL name-resolution defects found by plpgsql_check.

create or replace function public.claim_outbound_email_attempt(
  target_message_public_id text,
  is_retry boolean
)
returns public.email_delivery_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  message public.email_messages;
  attempt public.email_delivery_attempts;
  next_attempt integer;
begin
  select *
  into message
  from public.email_messages m
  where m.public_id = target_message_public_id
  for update;

  if message.id is null
    or message.owner_membership_id <> public.current_active_membership_id(message.organization_id)
  then
    raise exception using errcode = '42501', message = 'Outbound message is unavailable.';
  end if;

  if (not is_retry and message.status <> 'pending')
    or (is_retry and message.status <> 'failed-confirmed')
  then
    return null;
  end if;

  select coalesce(max(a.attempt_number), 0) + 1
  into next_attempt
  from public.email_delivery_attempts a
  where a.email_message_id = message.id;

  update public.email_messages
  set status = 'submitting'
  where id = message.id;

  insert into public.email_delivery_attempts(email_message_id, attempt_number, status)
  values (message.id, next_attempt, 'submitting')
  returning * into attempt;

  return attempt;
end
$$;

create or replace function public.save_discovery_observation(
  target_candidate_public_id text,
  topic_key text,
  topic_label text,
  finding_text text,
  candidate_statement_text text,
  finding_status public.discovery_finding_status,
  consultant_significance text,
  follow_up_needed boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  payload jsonb;
  sid uuid;
  cid uuid;
  org uuid;
  m uuid;
begin
  payload := public.get_or_create_discovery_session(
    save_discovery_observation.target_candidate_public_id
  );
  sid := (payload ->> 'id')::uuid;

  select candidate_id, organization_id
  into cid, org
  from public.discovery_sessions
  where id = sid;

  m := public.current_active_membership_id(org);

  insert into public.discovery_observations(
    organization_id,
    session_id,
    candidate_id,
    topic_key,
    topic_label,
    finding,
    candidate_statement,
    status,
    consultant_significance,
    follow_up_needed,
    created_by_membership_id
  )
  values (
    org,
    sid,
    cid,
    save_discovery_observation.topic_key,
    save_discovery_observation.topic_label,
    save_discovery_observation.finding_text,
    save_discovery_observation.candidate_statement_text,
    save_discovery_observation.finding_status,
    save_discovery_observation.consultant_significance,
    save_discovery_observation.follow_up_needed,
    m
  )
  on conflict on constraint discovery_observations_session_id_topic_key_key
  do update set
    topic_label = excluded.topic_label,
    finding = excluded.finding,
    candidate_statement = excluded.candidate_statement,
    status = excluded.status,
    consultant_significance = excluded.consultant_significance,
    follow_up_needed = excluded.follow_up_needed,
    updated_at = now();

  update public.discovery_sessions
  set
    status = 'in-progress',
    started_at = coalesce(started_at, now()),
    updated_at = now()
  where id = sid;
end
$$;

-- Make the application privilege model independent of Supabase default ACLs.
-- service_role is intentionally excluded from every revoke in this migration.

create or replace function public.discovery_session_payload(sid uuid)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', s.id,
    'public_id', s.public_id,
    'candidate_public_id', c.public_id,
    'assessment_session_id', s.assessment_session_id,
    'status', s.status,
    'summary', s.summary,
    'consultant_notes', s.consultant_notes,
    'next_steps', s.next_steps,
    'started_at', s.started_at,
    'completed_at', s.completed_at,
    'created_at', s.created_at,
    'updated_at', s.updated_at,
    'assessment_snapshot', a.analysis_snapshot,
    'observations', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', o.id,
          'topicId', o.topic_key,
          'topic', o.topic_label,
          'finding', o.finding,
          'candidateStatement', o.candidate_statement,
          'status', o.status,
          'significance', o.consultant_significance,
          'followUpNeeded', o.follow_up_needed,
          'source', o.source,
          'createdAt', o.created_at,
          'updatedAt', o.updated_at
        )
        order by o.created_at
      )
      from public.discovery_observations o
      where o.session_id = s.id
    ), '[]'::jsonb),
    'current_intelligence', (
      select i.current_snapshot
      from public.discovery_intelligence i
      where i.session_id = s.id
        and i.superseded_at is null
    )
  )
  from public.discovery_sessions s
  join public.candidates c on c.id = s.candidate_id
  join public.assessment_analyses a
    on a.session_id = s.assessment_session_id
   and a.superseded_at is null
  where s.id = sid
    and public.can_access_candidate(s.candidate_id)
$$;

-- Internal trigger and authorization helpers: no direct application execution.
revoke all on function
  public.set_updated_at(),
  public.enforce_membership_hierarchy(),
  public.record_membership_reporting_change(),
  public.is_membership_descendant(uuid, uuid),
  public.enforce_candidate_memberships(),
  public.record_candidate_assignment_change(),
  public.prevent_assessment_submission_mutation(),
  public.discovery_session_payload(uuid),
  public.prevent_discovery_provenance_change()
from public, anon, authenticated;

-- Authenticated authorization helpers and application RPCs.
revoke all on function
  public.current_active_membership_id(uuid),
  public.is_active_organization_member(uuid),
  public.has_organization_role(uuid, public.membership_role[]),
  public.can_view_membership(uuid),
  public.get_authorized_membership_ids(uuid),
  public.has_workspace_capability(uuid, public.workspace_capability),
  public.can_access_candidate(uuid),
  public.begin_outbound_email_send(text, text, text, text, text, text, text),
  public.claim_outbound_email_attempt(text, boolean),
  public.complete_outbound_email_attempt(text, uuid, public.email_attempt_status, text, text, text, boolean),
  public.create_assessment_invitation(text, text, timestamptz),
  public.get_candidate_assessment(text),
  public.regenerate_assessment_analysis(text, jsonb, integer),
  public.revoke_assessment_invitation(text),
  public.get_or_create_discovery_session(text),
  public.save_discovery_observation(text, text, text, text, text, public.discovery_finding_status, text, boolean),
  public.save_discovery_notes(text, text, text, text),
  public.complete_discovery_session(text, jsonb, text)
from public, anon, authenticated;

grant execute on function
  public.current_active_membership_id(uuid),
  public.is_active_organization_member(uuid),
  public.has_organization_role(uuid, public.membership_role[]),
  public.can_view_membership(uuid),
  public.get_authorized_membership_ids(uuid),
  public.has_workspace_capability(uuid, public.workspace_capability),
  public.can_access_candidate(uuid),
  public.begin_outbound_email_send(text, text, text, text, text, text, text),
  public.claim_outbound_email_attempt(text, boolean),
  public.complete_outbound_email_attempt(text, uuid, public.email_attempt_status, text, text, text, boolean),
  public.create_assessment_invitation(text, text, timestamptz),
  public.get_candidate_assessment(text),
  public.regenerate_assessment_analysis(text, jsonb, integer),
  public.revoke_assessment_invitation(text),
  public.get_or_create_discovery_session(text),
  public.save_discovery_observation(text, text, text, text, text, public.discovery_finding_status, text, boolean),
  public.save_discovery_notes(text, text, text, text),
  public.complete_discovery_session(text, jsonb, text)
to authenticated;

-- These three token-scoped assessment RPCs are the only anonymous application RPCs.
revoke all on function
  public.load_assessment_by_token(text),
  public.save_assessment_progress(text, jsonb),
  public.submit_assessment(text, jsonb, jsonb, jsonb, integer)
from public, anon, authenticated;

grant execute on function
  public.load_assessment_by_token(text),
  public.save_assessment_progress(text, jsonb),
  public.submit_assessment(text, jsonb, jsonb, jsonb, integer)
to anon, authenticated;

-- Remove hosted default table privileges that exceed the migration-defined API.
revoke insert, update, delete on table public.candidate_assignment_history from authenticated;
revoke delete on table public.candidates from authenticated;
revoke insert, update, delete on table public.connected_email_accounts from authenticated;
revoke update on table public.email_oauth_transactions from authenticated;
revoke insert, update, delete on table public.membership_reporting_history from authenticated;
revoke delete on table public.organization_memberships from authenticated;
revoke insert, delete on table public.organizations from authenticated;
revoke delete on table public.user_profiles from authenticated;

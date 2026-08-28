create function public.delete_relation_free_candidate(target_candidate_public_id text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_candidate public.candidates;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'Candidate cannot be deleted.';
  end if;

  select candidate.*
  into target_candidate
  from public.candidates as candidate
  where candidate.public_id = target_candidate_public_id
    and exists (
      select 1
      from public.organization_memberships as membership
      where membership.organization_id = candidate.organization_id
        and membership.user_id = auth.uid()
        and membership.status = 'active'
    )
    and public.can_access_candidate(candidate.id)
  for update;

  if target_candidate.id is null then
    raise exception using errcode = '42501', message = 'Candidate cannot be deleted.';
  end if;

  if exists (select 1 from public.candidate_assignment_history where candidate_id = target_candidate.id)
     or exists (select 1 from public.assessment_sessions where candidate_id = target_candidate.id)
     or exists (select 1 from public.discovery_sessions where candidate_id = target_candidate.id)
     or exists (select 1 from public.discovery_observations where candidate_id = target_candidate.id)
     or exists (select 1 from public.discovery_intelligence where candidate_id = target_candidate.id)
     or exists (select 1 from public.email_messages where candidate_id = target_candidate.id) then
    raise exception using errcode = '55000', message = 'Candidate cannot be deleted because related records exist.';
  end if;

  delete from public.candidates where id = target_candidate.id;
  if not found then
    raise exception using errcode = 'P0001', message = 'Candidate cannot be deleted.';
  end if;

  return 'deleted';
end;
$$;

revoke all on function public.delete_relation_free_candidate(text) from public, anon, authenticated;
grant execute on function public.delete_relation_free_candidate(text) to authenticated;

comment on function public.delete_relation_free_candidate(text) is
  'Physically deletes one caller-authorized candidate only when no candidate-owned dependency exists.';

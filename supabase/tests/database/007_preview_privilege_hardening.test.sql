begin;
create extension if not exists pgtap with schema extensions;
select plan(33);

select ok(not has_function_privilege('anon', 'public.create_assessment_invitation(text,text,timestamp with time zone)', 'EXECUTE'), 'anon cannot create assessment invitations');
select ok(not has_function_privilege('anon', 'public.get_candidate_assessment(text)', 'EXECUTE'), 'anon cannot read consultant assessment reports');
select ok(not has_function_privilege('anon', 'public.regenerate_assessment_analysis(text,jsonb,integer)', 'EXECUTE'), 'anon cannot regenerate assessment analysis');
select ok(not has_function_privilege('anon', 'public.revoke_assessment_invitation(text)', 'EXECUTE'), 'anon cannot revoke assessment invitations');
select ok(not has_function_privilege('anon', 'public.get_or_create_discovery_session(text)', 'EXECUTE'), 'anon cannot create discovery sessions');
select ok(not has_function_privilege('anon', 'public.save_discovery_observation(text,text,text,text,text,public.discovery_finding_status,text,boolean)', 'EXECUTE'), 'anon cannot save discovery observations');
select ok(not has_function_privilege('anon', 'public.save_discovery_notes(text,text,text,text)', 'EXECUTE'), 'anon cannot save discovery notes');
select ok(not has_function_privilege('anon', 'public.complete_discovery_session(text,jsonb,text)', 'EXECUTE'), 'anon cannot complete discovery sessions');
select ok(not has_function_privilege('anon', 'public.discovery_session_payload(uuid)', 'EXECUTE'), 'anon cannot call the internal discovery payload helper');

select ok(has_function_privilege('anon', 'public.load_assessment_by_token(text)', 'EXECUTE'), 'anon retains token-scoped assessment load');
select ok(has_function_privilege('anon', 'public.save_assessment_progress(text,jsonb)', 'EXECUTE'), 'anon retains token-scoped assessment progress save');
select ok(has_function_privilege('anon', 'public.submit_assessment(text,jsonb,jsonb,jsonb,integer)', 'EXECUTE'), 'anon retains token-scoped assessment submission');

select ok(not has_function_privilege('anon', 'public.prevent_assessment_submission_mutation()', 'EXECUTE'), 'anon cannot execute the assessment trigger helper');
select ok(not has_function_privilege('authenticated', 'public.prevent_assessment_submission_mutation()', 'EXECUTE'), 'authenticated cannot execute the assessment trigger helper');
select ok(not has_function_privilege('anon', 'public.prevent_discovery_provenance_change()', 'EXECUTE'), 'anon cannot execute the discovery trigger helper');
select ok(not has_function_privilege('authenticated', 'public.prevent_discovery_provenance_change()', 'EXECUTE'), 'authenticated cannot execute the discovery trigger helper');

select ok(has_function_privilege('authenticated', 'public.create_assessment_invitation(text,text,timestamp with time zone)', 'EXECUTE'), 'authenticated retains assessment invitation RPC');
select ok(has_function_privilege('authenticated', 'public.get_candidate_assessment(text)', 'EXECUTE'), 'authenticated retains assessment report RPC');
select ok(has_function_privilege('authenticated', 'public.regenerate_assessment_analysis(text,jsonb,integer)', 'EXECUTE'), 'authenticated retains analysis regeneration RPC');
select ok(has_function_privilege('authenticated', 'public.revoke_assessment_invitation(text)', 'EXECUTE'), 'authenticated retains assessment revocation RPC');
select ok(has_function_privilege('authenticated', 'public.get_or_create_discovery_session(text)', 'EXECUTE'), 'authenticated retains discovery session RPC');
select ok(has_function_privilege('authenticated', 'public.save_discovery_observation(text,text,text,text,text,public.discovery_finding_status,text,boolean)', 'EXECUTE'), 'authenticated retains discovery observation RPC');
select ok(has_function_privilege('authenticated', 'public.save_discovery_notes(text,text,text,text)', 'EXECUTE'), 'authenticated retains discovery notes RPC');
select ok(has_function_privilege('authenticated', 'public.complete_discovery_session(text,jsonb,text)', 'EXECUTE'), 'authenticated retains discovery completion RPC');

select ok(not has_table_privilege('authenticated', 'public.candidate_assignment_history', 'INSERT,UPDATE,DELETE'), 'assignment history has no authenticated writes');
select ok(not has_table_privilege('authenticated', 'public.candidates', 'DELETE'), 'candidates cannot be deleted directly');
select ok(not has_table_privilege('authenticated', 'public.connected_email_accounts', 'INSERT,UPDATE,DELETE'), 'connected accounts have no authenticated writes');
select ok(not has_table_privilege('authenticated', 'public.email_oauth_transactions', 'UPDATE'), 'OAuth transactions cannot be updated directly');
select ok(not has_table_privilege('authenticated', 'public.membership_reporting_history', 'INSERT,UPDATE,DELETE'), 'reporting history has no authenticated writes');
select ok(not has_table_privilege('authenticated', 'public.organization_memberships', 'DELETE'), 'memberships cannot be deleted directly');
select ok(not has_table_privilege('authenticated', 'public.organizations', 'INSERT,DELETE'), 'organizations cannot be inserted or deleted directly');
select ok(not has_table_privilege('authenticated', 'public.user_profiles', 'DELETE'), 'user profiles cannot be deleted directly');

select ok(
  pg_get_functiondef('public.discovery_session_payload(uuid)'::regprocedure)
    like '%public.can_access_candidate(s.candidate_id)%',
  'discovery payload enforces candidate authorization'
);

select * from finish();
rollback;

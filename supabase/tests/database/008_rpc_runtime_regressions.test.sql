begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

insert into auth.users(
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '80000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated', 'rpc-runtime@example.test', '', now(),
  '{}', '{}', now(), now()
);

insert into public.organizations(id, public_id, name)
values ('80000000-0000-0000-0000-000000000100', 'org_rpcruntimeaaaaaa', 'RPC Runtime');

insert into public.organization_memberships(
  id, organization_id, user_id, role, status, manager_membership_id
) values (
  '81000000-0000-0000-0000-000000000001',
  '80000000-0000-0000-0000-000000000100',
  '80000000-0000-0000-0000-000000000001',
  'consultant', 'active', null
);

insert into public.candidates(
  id, organization_id, public_id, assigned_membership_id,
  created_by_membership_id, first_name, last_name, email
) values (
  '82000000-0000-0000-0000-000000000001',
  '80000000-0000-0000-0000-000000000100',
  'cand_rpcruntimeaaaaaa',
  '81000000-0000-0000-0000-000000000001',
  '81000000-0000-0000-0000-000000000001',
  'Runtime', 'Candidate', 'rpc-candidate@example.test'
);

insert into public.connected_email_accounts(
  id, public_id, organization_id, owner_membership_id, provider,
  provider_account_id, email_address, status, granted_scopes, connected_at
) values (
  '83000000-0000-0000-0000-000000000001',
  'email_account_rpcruntime',
  '80000000-0000-0000-0000-000000000100',
  '81000000-0000-0000-0000-000000000001',
  'google', 'rpc-provider-account', 'sender@example.test', 'connected',
  array['https://www.googleapis.com/auth/gmail.send'], now()
);

insert into public.email_messages(
  id, public_id, organization_id, owner_membership_id,
  connected_email_account_id, candidate_id, provider,
  internet_message_id, sender_email, subject, text_body, send_idempotency_key
) values (
  '84000000-0000-0000-0000-000000000001',
  'email_rpcruntimeaaaa',
  '80000000-0000-0000-0000-000000000100',
  '81000000-0000-0000-0000-000000000001',
  '83000000-0000-0000-0000-000000000001',
  '82000000-0000-0000-0000-000000000001',
  'google', '<rpc-runtime@example.test>', 'sender@example.test',
  'Runtime subject', 'Runtime body', 'rpc-runtime-idempotency-key'
);

insert into public.assessment_sessions(
  id, public_id, organization_id, candidate_id, owning_membership_id,
  created_by_membership_id, status, token_hash, expires_at, completed_at
) values (
  '85000000-0000-0000-0000-000000000001',
  'asmt_rpcruntimeaaaa',
  '80000000-0000-0000-0000-000000000100',
  '82000000-0000-0000-0000-000000000001',
  '81000000-0000-0000-0000-000000000001',
  '81000000-0000-0000-0000-000000000001',
  'analyzed', repeat('8', 64), now() + interval '1 day', now()
);

insert into public.assessment_submissions(
  id, session_id, organization_id, instrument_version,
  intake_snapshot, response_snapshot
) values (
  '86000000-0000-0000-0000-000000000001',
  '85000000-0000-0000-0000-000000000001',
  '80000000-0000-0000-0000-000000000100',
  'franchise-ownership-assessment-v1', '{}', '{}'
);

insert into public.assessment_analyses(
  id, session_id, submission_id, organization_id, instrument_version,
  analysis_version, analysis_snapshot
) values (
  '87000000-0000-0000-0000-000000000001',
  '85000000-0000-0000-0000-000000000001',
  '86000000-0000-0000-0000-000000000001',
  '80000000-0000-0000-0000-000000000100',
  'franchise-ownership-assessment-v1', 1, '{}'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '80000000-0000-0000-0000-000000000001', true);

select lives_ok(
  $$ select public.claim_outbound_email_attempt('email_rpcruntimeaaaa', false) $$,
  'claiming a pending outbound email executes without an unresolved identifier'
);
select is(
  (select status::text from public.email_messages where public_id = 'email_rpcruntimeaaaa'),
  'submitting',
  'claim moves the message to submitting'
);
select is(
  (select count(*) from public.email_delivery_attempts),
  1::bigint,
  'claim creates one delivery attempt'
);

select lives_ok(
  $$ select public.save_discovery_observation(
    'cand_rpcruntimeaaaaaa', 'capital', 'Capital', 'Initial finding',
    'Initial statement', 'confirmed', 'Initial significance', false
  ) $$,
  'saving a discovery observation resolves the conflict key unambiguously'
);
select lives_ok(
  $$ select public.save_discovery_observation(
    'cand_rpcruntimeaaaaaa', 'capital', 'Capital updated', 'Updated finding',
    'Updated statement', 'refined', 'Updated significance', true
  ) $$,
  'saving the same topic follows the upsert path'
);
select is(
  (select count(*) from public.discovery_observations where topic_key = 'capital'),
  1::bigint,
  'discovery observation upsert keeps one row per session and topic'
);
select is(
  (select finding from public.discovery_observations where topic_key = 'capital'),
  'Updated finding',
  'discovery observation upsert persists the replacement values'
);

reset role;
select * from finish();
rollback;

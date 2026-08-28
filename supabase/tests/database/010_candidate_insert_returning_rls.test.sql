begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'returning-self@example.test', '', now(), '{}', '{}', now(), now()),
('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'returning-peer@example.test', '', now(), '{}', '{}', now(), now()),
('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'returning-other@example.test', '', now(), '{}', '{}', now(), now());

insert into public.organizations (id, public_id, name) values
('a1000000-0000-0000-0000-000000000001', 'org_returningaaaaaaa', 'Returning Org A'),
('a1000000-0000-0000-0000-000000000002', 'org_returningbbbbbbb', 'Returning Org B');

insert into public.organization_memberships (
  id, organization_id, user_id, role, status, manager_membership_id
) values
('a2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'consultant', 'active', null),
('a2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'consultant', 'active', null),
('a2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'consultant', 'active', null);

insert into public.candidates (
  id, organization_id, public_id, assigned_membership_id,
  created_by_membership_id, first_name, last_name, email
) values
('a3000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'cand_returningownaaaa', 'a2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000001', 'Existing', 'Own', 'existing-own@example.test'),
('a3000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'cand_returningpeeraaa', 'a2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 'Existing', 'Peer', 'existing-peer@example.test'),
('a3000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'cand_returningotheraa', 'a2000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000003', 'Existing', 'Other', 'existing-other@example.test');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000001', true);

select results_eq(
  $$
    insert into public.candidates (
      organization_id, public_id, assigned_membership_id,
      created_by_membership_id, first_name, last_name, email
    ) values (
      'a1000000-0000-0000-0000-000000000001', 'cand_returningnewaaaa',
      'a2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000001',
      'Returning', 'Candidate', 'returning-candidate@example.test'
    ) returning public_id
  $$,
  $$ values ('cand_returningnewaaaa'::text) $$,
  'authorized consultant receives the inserted row from INSERT RETURNING'
);

select is(
  (select count(*) from public.candidates where public_id = 'cand_returningnewaaaa'),
  1::bigint,
  'returned candidate remains ordinarily visible to its assigned consultant'
);

select throws_ok(
  $$
    insert into public.candidates (
      organization_id, assigned_membership_id, created_by_membership_id,
      first_name, last_name, email
    ) values (
      'a1000000-0000-0000-0000-000000000002',
      'a2000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000003',
      'Cross', 'Organization', 'cross-organization@example.test'
    ) returning public_id
  $$,
  '42501', null,
  'cross-organization INSERT RETURNING remains denied'
);

select throws_ok(
  $$
    insert into public.candidates (
      organization_id, assigned_membership_id, created_by_membership_id,
      first_name, last_name, email
    ) values (
      'a1000000-0000-0000-0000-000000000001',
      'a2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000001',
      'Peer', 'Assigned', 'peer-assigned@example.test'
    ) returning public_id
  $$,
  '42501', null,
  'peer-assigned INSERT RETURNING remains denied'
);

select is(
  (select count(*) from public.candidates where public_id = 'cand_returningownaaaa'),
  1::bigint,
  'ordinary SELECT still returns an existing authorized candidate'
);

select is(
  (select count(*) from public.candidates where public_id in (
    'cand_returningpeeraaa', 'cand_returningotheraa'
  )),
  0::bigint,
  'ordinary SELECT still hides peer and cross-organization candidates'
);

select * from finish();
rollback;

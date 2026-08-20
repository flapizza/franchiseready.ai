begin;

create extension if not exists pgtap with schema extensions;
select plan(35);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000101', 'authenticated', 'authenticated', 'owner-a@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000102', 'authenticated', 'authenticated', 'manager-a@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000103', 'authenticated', 'authenticated', 'leader-a@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000104', 'authenticated', 'authenticated', 'consultant-a1@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000105', 'authenticated', 'authenticated', 'consultant-a2@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000106', 'authenticated', 'authenticated', 'inactive-a@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000107', 'authenticated', 'authenticated', 'admin-a@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000201', 'authenticated', 'authenticated', 'owner-b@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000202', 'authenticated', 'authenticated', 'consultant-b1@example.test', '', now(), '{}', '{}', now(), now());

insert into public.organizations (id, public_id, name) values
  ('10000000-0000-0000-0000-000000000001', 'org_aaaaaaaaaaaaaaaa', 'Organization A'),
  ('20000000-0000-0000-0000-000000000002', 'org_bbbbbbbbbbbbbbbb', 'Organization B');

insert into public.organization_memberships (id, organization_id, user_id, role, status, manager_membership_id) values
  ('11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'owner', 'active', null),
  ('11000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102', 'manager', 'active', '11000000-0000-0000-0000-000000000001'),
  ('11000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000103', 'manager', 'active', '11000000-0000-0000-0000-000000000002'),
  ('11000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000104', 'consultant', 'active', '11000000-0000-0000-0000-000000000003'),
  ('11000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000105', 'consultant', 'active', '11000000-0000-0000-0000-000000000002'),
  ('11000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000106', 'consultant', 'suspended', '11000000-0000-0000-0000-000000000002'),
  ('11000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000107', 'admin', 'active', null),
  ('22000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000201', 'owner', 'active', null),
  ('22000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000202', 'consultant', 'active', '22000000-0000-0000-0000-000000000001');

select throws_ok(
  $$update public.organization_memberships set manager_membership_id = '22000000-0000-0000-0000-000000000001' where id = '11000000-0000-0000-0000-000000000004'$$,
  '23514', 'An active same-organization manager is required.', 'a cross-organization manager is rejected'
);
select throws_ok(
  $$update public.organization_memberships set manager_membership_id = id where id = '11000000-0000-0000-0000-000000000004'$$,
  '23514', null, 'self-management is rejected'
);
select throws_ok(
  $$update public.organization_memberships set manager_membership_id = '11000000-0000-0000-0000-000000000005' where id = '11000000-0000-0000-0000-000000000002'$$,
  '23514', 'Reporting hierarchy cycles are not allowed.', 'a direct cycle is rejected'
);
select throws_ok(
  $$update public.organization_memberships set manager_membership_id = '11000000-0000-0000-0000-000000000004' where id = '11000000-0000-0000-0000-000000000001'$$,
  '23514', 'Reporting hierarchy cycles are not allowed.', 'a multi-level cycle is rejected'
);
select throws_ok(
  $$update public.organization_memberships set manager_membership_id = '11000000-0000-0000-0000-000000000006' where id = '11000000-0000-0000-0000-000000000004'$$,
  '23514', 'An active same-organization manager is required.', 'an inactive membership cannot become a manager'
);
select throws_ok(
  $$update public.organization_memberships set status = 'suspended' where id = '11000000-0000-0000-0000-000000000002'$$,
  '23514', 'A membership with active reports cannot be suspended.', 'a manager must reassign active reports before suspension'
);

select is((select count(*) from public.membership_reporting_history), 0::bigint, 'fixture inserts do not create reporting history');
update public.organization_memberships
set manager_membership_id = '11000000-0000-0000-0000-000000000003'
where id = '11000000-0000-0000-0000-000000000005';
select is((select count(*) from public.membership_reporting_history), 1::bigint, 'a manager change creates one history row');
select is(
  (select previous_manager_membership_id from public.membership_reporting_history where membership_id = '11000000-0000-0000-0000-000000000005'),
  '11000000-0000-0000-0000-000000000002'::uuid,
  'history preserves the previous manager'
);
select is(
  (select new_manager_membership_id from public.membership_reporting_history where membership_id = '11000000-0000-0000-0000-000000000005'),
  '11000000-0000-0000-0000-000000000003'::uuid,
  'history preserves the new manager'
);
update public.organization_memberships set role = role where id = '11000000-0000-0000-0000-000000000005';
select is((select count(*) from public.membership_reporting_history), 1::bigint, 'a no-op update creates no reporting history');

set local role anon;
select throws_ok(
  $$select count(*) from public.organizations$$,
  '42501', null, 'anonymous users cannot read organizations'
);
select throws_ok(
  $$select count(*) from public.organization_memberships$$,
  '42501', null, 'anonymous users cannot read memberships'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000104', true);
select is((select count(*) from public.organizations), 1::bigint, 'consultant sees only their active organization');
select is((select count(*) from public.organization_memberships), 1::bigint, 'consultant sees only their own membership');
select ok(not public.can_view_membership('11000000-0000-0000-0000-000000000005'), 'peer membership is not visible');
select is((select count(*) from public.get_authorized_membership_ids('10000000-0000-0000-0000-000000000001')), 1::bigint, 'consultant authorization set contains only self');
select is((select count(*) from public.get_authorized_membership_ids('20000000-0000-0000-0000-000000000002')), 0::bigint, 'fabricated organization ID grants no access');
select ok(not public.has_workspace_capability('10000000-0000-0000-0000-000000000001', 'hierarchy:view_descendants'), 'consultant lacks hierarchy capability');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
select is((select count(*) from public.get_authorized_membership_ids('10000000-0000-0000-0000-000000000001')), 4::bigint, 'manager sees self and all active descendants across levels');
select ok(public.can_view_membership('11000000-0000-0000-0000-000000000004'), 'manager sees deep consultant descendant');
select ok(public.can_view_membership('11000000-0000-0000-0000-000000000005'), 'manager sees second consultant descendant');
select ok(not public.can_view_membership('11000000-0000-0000-0000-000000000001'), 'manager does not inherit visibility upward');
select ok(not public.can_view_membership('22000000-0000-0000-0000-000000000002'), 'manager cannot cross organizations');
select ok(public.has_workspace_capability('10000000-0000-0000-0000-000000000001', 'hierarchy:view_descendants'), 'manager has bounded hierarchy visibility capability');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
select is((select count(*) from public.organization_memberships where organization_id = '10000000-0000-0000-0000-000000000001'), 7::bigint, 'owner can administer active and suspended organization memberships');
select ok(public.has_workspace_capability('10000000-0000-0000-0000-000000000001', 'organization:manage'), 'owner has organization administration capability');
select throws_ok(
  $$insert into public.membership_reporting_history (organization_id, membership_id, previous_manager_membership_id, new_manager_membership_id) values ('10000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000004', '11000000-0000-0000-0000-000000000003', null)$$,
  '42501', null, 'history is append-only to authenticated application roles'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000107', true);
select is((select count(*) from public.organization_memberships where organization_id = '10000000-0000-0000-0000-000000000001'), 7::bigint, 'admin has explicit organization-wide membership visibility');
select ok(public.has_workspace_capability('10000000-0000-0000-0000-000000000001', 'memberships:manage'), 'admin has membership administration capability');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000106', true);
select is((select count(*) from public.organizations), 0::bigint, 'suspended membership has no tenant access');
select is((select count(*) from public.organization_memberships), 0::bigint, 'suspended membership has no hierarchy access');
select is((select count(*) from public.get_authorized_membership_ids('10000000-0000-0000-0000-000000000001')), 0::bigint, 'suspended membership resolves no authorized IDs');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);
select is((select count(*) from public.organizations), 1::bigint, 'Organization B owner sees only Organization B');
select is((select count(*) from public.organization_memberships), 2::bigint, 'Organization B hierarchy remains isolated');
reset role;

select * from finish();
rollback;

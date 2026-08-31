begin;
create extension if not exists pgtap with schema extensions;
select plan(23);

insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','b0000000-0000-0000-0000-000000000001','authenticated','authenticated','owner-a@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','b0000000-0000-0000-0000-000000000002','authenticated','authenticated','consultant-a@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','b0000000-0000-0000-0000-000000000003','authenticated','authenticated','consultant-b@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','b0000000-0000-0000-0000-000000000004','authenticated','authenticated','suspended@example.test','',now(),'{}','{}',now(),now());
insert into public.organizations(id,public_id,name) values
('b1000000-0000-0000-0000-000000000001','org_checkpoint5aaaaa','Checkpoint Five A'),
('b1000000-0000-0000-0000-000000000002','org_checkpoint5bbbbb','Checkpoint Five B');
insert into public.organization_memberships(id,organization_id,user_id,role,status,manager_membership_id) values
('b2000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','owner','active',null),
('b2000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000002','consultant','active','b2000000-0000-0000-0000-000000000001'),
('b2000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000003','consultant','active',null),
('b2000000-0000-0000-0000-000000000004','b1000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000004','consultant','suspended',null);

select ok(not has_table_privilege('authenticated','private.domain_event_outbox','SELECT'),'authenticated cannot select the private outbox');
select ok(not has_table_privilege('authenticated','private.domain_event_outbox','INSERT'),'authenticated cannot directly insert outbox events');
select ok(not has_table_privilege('authenticated','public.consultant_profiles','INSERT'),'authenticated cannot directly insert profiles');
select ok(not has_table_privilege('authenticated','public.organization_settings','UPDATE'),'authenticated cannot directly update settings');
select ok(not has_table_privilege('authenticated','public.membership_onboarding','DELETE'),'authenticated cannot directly delete onboarding');

set local role authenticated;
select set_config('request.jwt.claim.sub','b0000000-0000-0000-0000-000000000002',true);
select lives_ok($$select public.save_consultant_profile('b1000000-0000-0000-0000-000000000001','Casey Consultant','Advisor','casey@example.test','555-0100','https://linkedin.example/casey','https://calendar.example/casey')$$,'active member saves own profile');
select is((select display_name from public.consultant_profiles),'Casey Consultant','member reads own profile');
select is((select count(*) from public.organization_settings),0::bigint,'member cannot see absent settings');
select lives_ok($$select public.set_membership_onboarding_state('b1000000-0000-0000-0000-000000000001','in-progress','profile',array['welcome'])$$,'member saves own onboarding progress');
select is((select status::text from public.membership_onboarding),'in-progress','member reads own onboarding state');
select throws_ok($$select public.save_organization_settings('b1000000-0000-0000-0000-000000000001','Forbidden','https://example.test')$$,'42501',null,'consultant cannot administer organization settings');
select throws_ok($$select public.save_consultant_profile('b1000000-0000-0000-0000-000000000002','Cross Org','','','','','')$$,'42501',null,'profile RPC rejects another tenant');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','b0000000-0000-0000-0000-000000000001',true);
select lives_ok($$select public.save_organization_settings('b1000000-0000-0000-0000-000000000001','Persisted Organization','https://organization.example')$$,'owner saves organization settings');
select is((select display_name from public.organization_settings),'Persisted Organization','owner reads persisted settings');
select is((select display_name from public.consultant_profiles where membership_id='b2000000-0000-0000-0000-000000000002'),'Casey Consultant','owner can read descendant profile');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','b0000000-0000-0000-0000-000000000003',true);
select is((select count(*) from public.organization_settings),0::bigint,'other tenant cannot read organization settings');
select is((select count(*) from public.consultant_profiles),0::bigint,'other tenant cannot read profiles');
select is((select count(*) from public.membership_onboarding),0::bigint,'other tenant cannot read onboarding');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','b0000000-0000-0000-0000-000000000004',true);
select throws_ok($$select public.save_consultant_profile('b1000000-0000-0000-0000-000000000001','Suspended','','','','','')$$,'42501',null,'suspended membership cannot save a profile');

reset role;
select is((select count(*) from private.domain_event_outbox),3::bigint,'each successful mutation emitted one transactional event');
select results_eq($$select event_type from private.domain_event_outbox order by event_type$$,$$values ('consultant-profile.saved'::text),('membership-onboarding.state-changed'::text),('organization-settings.saved'::text)$$,'outbox records the intended event types');
insert into private.domain_event_outbox(aggregate_type,event_type,occurred_at) values ('test','test.sentinel',now());
select throws_ok($$update private.domain_event_outbox set payload='{}'$$,'55000','Domain events are append-only.','outbox rows cannot be updated');
select throws_ok($$delete from private.domain_event_outbox$$,'55000','Domain events are append-only.','outbox rows cannot be deleted');

select * from finish();
rollback;

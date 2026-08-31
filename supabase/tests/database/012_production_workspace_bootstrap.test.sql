begin;
create extension if not exists pgtap with schema extensions;
select plan(22);

insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','c0000000-0000-0000-0000-000000000001','authenticated','authenticated','bootstrap@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','c0000000-0000-0000-0000-000000000002','authenticated','authenticated','existing@example.test','',now(),'{}','{}',now(),now());
insert into public.organizations(id,public_id,name) values ('c1000000-0000-0000-0000-000000000002','org_existingworkspac','Existing Workspace');
insert into public.organization_memberships(id,organization_id,user_id,role,status) values ('c2000000-0000-0000-0000-000000000002','c1000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002','consultant','active');

select ok(not has_table_privilege('authenticated','public.organizations','INSERT'),'authenticated has no unrestricted organization insert');
select ok(not has_table_privilege('anon','public.organization_memberships','INSERT'),'anon has no membership insert privilege');
select ok(not has_function_privilege('anon','public.bootstrap_first_workspace(text,text)','EXECUTE'),'anon cannot execute bootstrap');
select ok(has_function_privilege('authenticated','public.bootstrap_first_workspace(text,text)','EXECUTE'),'authenticated can execute bootstrap RPC');

set local role anon;
select throws_ok($$select * from public.bootstrap_first_workspace('Anon Org','Anon User')$$,'42501',null,'unauthenticated bootstrap is denied');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','c0000000-0000-0000-0000-000000000001',true);
select results_eq($$select organization_name, created from public.bootstrap_first_workspace('Bootstrap Organization','Bootstrap Owner')$$,$$values ('Bootstrap Organization'::text,true)$$,'eligible authenticated user bootstraps workspace');
reset role;

select is((select count(*) from public.organizations where name='Bootstrap Organization'),1::bigint,'organization is created exactly once');
select is((select count(*) from public.organization_memberships where user_id='c0000000-0000-0000-0000-000000000001'),1::bigint,'one initial membership is created');
select is((select role::text from public.organization_memberships where user_id='c0000000-0000-0000-0000-000000000001'),'owner','initial membership is owner');
select is((select status::text from public.organization_memberships where user_id='c0000000-0000-0000-0000-000000000001'),'active','initial membership is active');
select is((select display_name from public.consultant_profiles cp join public.organization_memberships om on om.id=cp.membership_id where om.user_id='c0000000-0000-0000-0000-000000000001'),'Bootstrap Owner','consultant profile shell is initialized');
select is((select os.display_name from public.organization_settings os join public.organizations o on o.id=os.organization_id where o.name='Bootstrap Organization'),'Bootstrap Organization','organization settings are initialized');
select is((select mo.status::text from public.membership_onboarding mo join public.organization_memberships om on om.id=mo.membership_id where om.user_id='c0000000-0000-0000-0000-000000000001'),'not-started','onboarding is truthfully initialized');
select is((select count(*) from private.domain_event_outbox where actor_user_id='c0000000-0000-0000-0000-000000000001'),2::bigint,'bootstrap emits two transactional events');
select results_eq($$select event_type from private.domain_event_outbox where actor_user_id='c0000000-0000-0000-0000-000000000001' order by event_type$$,$$values ('organization-membership.established'::text),('organization.created'::text)$$,'bootstrap event model is stable and narrow');

set local role authenticated;
select set_config('request.jwt.claim.sub','c0000000-0000-0000-0000-000000000001',true);
select results_eq($$select organization_name, created from public.bootstrap_first_workspace('Ignored Retry','Ignored Retry')$$,$$values ('Bootstrap Organization'::text,false)$$,'retry returns existing active workspace');
reset role;
select is((select count(*) from public.organizations where name in ('Bootstrap Organization','Ignored Retry')),1::bigint,'retry creates no duplicate organization');
select is((select count(*) from private.domain_event_outbox where actor_user_id='c0000000-0000-0000-0000-000000000001'),2::bigint,'retry emits no duplicate events');

set local role authenticated;
select set_config('request.jwt.claim.sub','c0000000-0000-0000-0000-000000000002',true);
select results_eq($$select organization_id, created from public.bootstrap_first_workspace('Accidental Second','Existing User')$$,$$values ('c1000000-0000-0000-0000-000000000002'::uuid,false)$$,'existing active member cannot accidentally create another workspace');
select is((select count(*) from public.organizations),1::bigint,'existing member attempt creates no additional visible tenant');
select is((select count(*) from public.consultant_profiles),0::bigint,'existing tenant profile remains inaccessible cross-tenant');
select is((select count(*) from public.organization_settings),0::bigint,'existing tenant settings remain inaccessible cross-tenant');

select * from finish();
rollback;

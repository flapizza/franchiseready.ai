begin;
create extension if not exists pgtap with schema extensions;
select plan(17);

insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','50000000-0000-0000-0000-000000000001','authenticated','authenticated','owner@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','50000000-0000-0000-0000-000000000002','authenticated','authenticated','manager@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','50000000-0000-0000-0000-000000000003','authenticated','authenticated','consultant@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','50000000-0000-0000-0000-000000000004','authenticated','authenticated','peer@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','60000000-0000-0000-0000-000000000001','authenticated','authenticated','other@example.test','',now(),'{}','{}',now(),now());
insert into public.organizations(id,public_id,name) values
('50000000-0000-0000-0000-000000000100','org_eeeeeeeeeeeeeeee','Email Org'),
('60000000-0000-0000-0000-000000000100','org_ffffffffffffffff','Other Email Org');
insert into public.organization_memberships(id,organization_id,user_id,role,status,manager_membership_id) values
('51000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000100','50000000-0000-0000-0000-000000000001','owner','active',null),
('51000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000100','50000000-0000-0000-0000-000000000002','manager','active','51000000-0000-0000-0000-000000000001'),
('51000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000100','50000000-0000-0000-0000-000000000003','consultant','active','51000000-0000-0000-0000-000000000002'),
('51000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000100','50000000-0000-0000-0000-000000000004','consultant','active','51000000-0000-0000-0000-000000000002'),
('61000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000100','60000000-0000-0000-0000-000000000001','owner','active',null);

insert into public.connected_email_accounts(id,organization_id,owner_membership_id,provider,provider_account_id,email_address,status,granted_scopes,connected_at) values
('52000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000100','51000000-0000-0000-0000-000000000003','google','google-sub-1','consultant@gmail.test','connected',array['openid','email','profile','https://www.googleapis.com/auth/gmail.send'],now()),
('52000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000100','61000000-0000-0000-0000-000000000001','google','google-sub-2','other@gmail.test','connected',array['openid','email','profile','https://www.googleapis.com/auth/gmail.send'],now());
insert into public.connected_email_credentials(connected_email_account_id,cipher_provider,cipher_version,encrypted_payload) values
('52000000-0000-0000-0000-000000000001','test-cipher',1,'ciphertext-only');

select ok(not has_table_privilege('authenticated','public.connected_email_credentials','select'),'authenticated cannot select credentials');
select ok(not has_table_privilege('authenticated','public.connected_email_credentials','insert'),'authenticated cannot insert credentials');
select ok(not has_table_privilege('authenticated','public.connected_email_credentials','update'),'authenticated cannot update credentials');
select ok(not has_table_privilege('authenticated','public.connected_email_credentials','delete'),'authenticated cannot delete credentials');
select ok(not has_table_privilege('authenticated','public.connected_email_accounts','update'),'authenticated cannot mutate account metadata');

set local role authenticated; select set_config('request.jwt.claim.sub','50000000-0000-0000-0000-000000000003',true);
select is((select count(*) from public.connected_email_accounts),1::bigint,'consultant sees own account');
select is((select email_address from public.connected_email_accounts limit 1),'consultant@gmail.test','consultant reads own metadata');
insert into public.email_oauth_transactions(state_hash,pkce_verifier_hash,organization_id,owner_membership_id,user_id,provider,return_path,expires_at) values
(repeat('a',64),repeat('b',64),'50000000-0000-0000-0000-000000000100','51000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000003','google','/settings/email',now()+interval '5 minutes');
select is((select count(*) from public.email_oauth_transactions),1::bigint,'owner creates and sees bound transaction');
delete from public.email_oauth_transactions where state_hash=repeat('a',64);
select is((select count(*) from public.email_oauth_transactions),0::bigint,'transaction consume deletes it once');
select throws_ok($$insert into public.email_oauth_transactions(state_hash,pkce_verifier_hash,organization_id,owner_membership_id,user_id,provider,return_path,expires_at) values (repeat('c',64),repeat('d',64),'50000000-0000-0000-0000-000000000100','51000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000003','google','/settings/email',now()+interval '5 minutes')$$,'42501',null,'consultant cannot create peer transaction'); reset role;

set local role authenticated; select set_config('request.jwt.claim.sub','50000000-0000-0000-0000-000000000004',true);
select is((select count(*) from public.connected_email_accounts),0::bigint,'peer cannot see account metadata'); reset role;
set local role authenticated; select set_config('request.jwt.claim.sub','50000000-0000-0000-0000-000000000002',true);
select is((select count(*) from public.connected_email_accounts),0::bigint,'manager hierarchy does not grant mailbox metadata'); reset role;
set local role authenticated; select set_config('request.jwt.claim.sub','50000000-0000-0000-0000-000000000001',true);
select is((select count(*) from public.connected_email_accounts),0::bigint,'organization owner does not inherit mailbox metadata'); reset role;
set local role authenticated; select set_config('request.jwt.claim.sub','60000000-0000-0000-0000-000000000001',true);
select is((select count(*) from public.connected_email_accounts),1::bigint,'other organization owner sees only own account'); reset role;
set local role anon;
select throws_ok($$select count(*) from public.connected_email_accounts$$,'42501',null,'anonymous account enumeration denied');
select throws_ok($$select count(*) from public.email_oauth_transactions$$,'42501',null,'anonymous transaction enumeration denied'); reset role;
select throws_ok($$insert into public.connected_email_accounts(organization_id,owner_membership_id,provider,provider_account_id,email_address) values ('50000000-0000-0000-0000-000000000100','61000000-0000-0000-0000-000000000001','google','bad','bad@test.dev')$$,'23503',null,'cross-organization account ownership rejected');

select * from finish(); rollback;

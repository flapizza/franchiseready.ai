begin;
create extension if not exists pgtap with schema extensions;
select plan(29);

insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000001','authenticated','authenticated','o2@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000002','authenticated','authenticated','ma@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000003','authenticated','authenticated','a1@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000004','authenticated','authenticated','a2@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000005','authenticated','authenticated','tl@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000006','authenticated','authenticated','a4@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000007','authenticated','authenticated','mb@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000008','authenticated','authenticated','b1@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000009','authenticated','authenticated','inactive@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','40000000-0000-0000-0000-000000000001','authenticated','authenticated','ob@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','40000000-0000-0000-0000-000000000002','authenticated','authenticated','cb@example.test','',now(),'{}','{}',now(),now());

insert into public.organizations(id,public_id,name) values
('30000000-0000-0000-0000-000000000100','org_cccccccccccccccc','Candidate Org A'),
('40000000-0000-0000-0000-000000000100','org_dddddddddddddddd','Candidate Org B');
insert into public.organization_memberships(id,organization_id,user_id,role,status,manager_membership_id) values
('31000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000100','30000000-0000-0000-0000-000000000001','owner','active',null),
('31000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000100','30000000-0000-0000-0000-000000000002','manager','active','31000000-0000-0000-0000-000000000001'),
('31000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000100','30000000-0000-0000-0000-000000000003','consultant','active','31000000-0000-0000-0000-000000000002'),
('31000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000100','30000000-0000-0000-0000-000000000004','consultant','active','31000000-0000-0000-0000-000000000002'),
('31000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000100','30000000-0000-0000-0000-000000000005','manager','active','31000000-0000-0000-0000-000000000002'),
('31000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000100','30000000-0000-0000-0000-000000000006','consultant','active','31000000-0000-0000-0000-000000000005'),
('31000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000100','30000000-0000-0000-0000-000000000007','manager','active','31000000-0000-0000-0000-000000000001'),
('31000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000100','30000000-0000-0000-0000-000000000008','consultant','active','31000000-0000-0000-0000-000000000007'),
('31000000-0000-0000-0000-000000000009','30000000-0000-0000-0000-000000000100','30000000-0000-0000-0000-000000000009','consultant','suspended','31000000-0000-0000-0000-000000000002'),
('41000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000100','40000000-0000-0000-0000-000000000001','owner','active',null),
('41000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000100','40000000-0000-0000-0000-000000000002','consultant','active','41000000-0000-0000-0000-000000000001');

insert into public.candidates(id,organization_id,public_id,assigned_membership_id,created_by_membership_id,first_name,last_name,email) values
('32000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000100','cand_aaaaaaaaaaaaaaaa','31000000-0000-0000-0000-000000000003','31000000-0000-0000-0000-000000000001','A','One','a1@candidate.test'),
('32000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000100','cand_bbbbbbbbbbbbbbbb','31000000-0000-0000-0000-000000000004','31000000-0000-0000-0000-000000000001','A','Two','a2@candidate.test'),
('32000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000100','cand_cccccccccccccccc','31000000-0000-0000-0000-000000000006','31000000-0000-0000-0000-000000000001','A','Four','a4@candidate.test'),
('32000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000100','cand_dddddddddddddddd','31000000-0000-0000-0000-000000000007','31000000-0000-0000-0000-000000000001','Manager','B','mb@candidate.test'),
('32000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000100','cand_eeeeeeeeeeeeeeee','31000000-0000-0000-0000-000000000008','31000000-0000-0000-0000-000000000001','B','One','b1@candidate.test'),
('42000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000100','cand_ffffffffffffffff','41000000-0000-0000-0000-000000000002','41000000-0000-0000-0000-000000000001','Other','Org','other@candidate.test');

select throws_ok($$insert into public.candidates(organization_id,assigned_membership_id,created_by_membership_id,first_name,last_name,email) values ('30000000-0000-0000-0000-000000000100','41000000-0000-0000-0000-000000000002','31000000-0000-0000-0000-000000000001','Bad','Org','bad@test.dev')$$,'23514','An active same-organization assignee is required.','cross-org assignment rejected');
select throws_ok($$insert into public.candidates(organization_id,assigned_membership_id,created_by_membership_id,first_name,last_name,email) values ('30000000-0000-0000-0000-000000000100','31000000-0000-0000-0000-000000000009','31000000-0000-0000-0000-000000000001','Bad','Inactive','bad2@test.dev')$$,'23514','An active same-organization assignee is required.','inactive assignee rejected');

set local role authenticated; select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000003',true);
select is((select count(*) from public.candidates),1::bigint,'consultant lists self only');
select is((select count(*) from public.candidates where id='32000000-0000-0000-0000-000000000002'),0::bigint,'peer UUID hidden');
select is((select count(*) from public.candidates where public_id='cand_bbbbbbbbbbbbbbbb'),0::bigint,'peer public ID hidden');
update public.candidates set first_name='Hacked' where id='32000000-0000-0000-0000-000000000002';
select is((select first_name from public.candidates where id='32000000-0000-0000-0000-000000000001'),'A','own record remains visible');
select throws_ok($$insert into public.candidates(organization_id,assigned_membership_id,created_by_membership_id,first_name,last_name,email) values ('30000000-0000-0000-0000-000000000100','31000000-0000-0000-0000-000000000004','31000000-0000-0000-0000-000000000003','No','Peer','no@test.dev')$$,'42501',null,'consultant cannot create for peer');
insert into public.candidates(organization_id,assigned_membership_id,created_by_membership_id,first_name,last_name,email) values ('30000000-0000-0000-0000-000000000100','31000000-0000-0000-0000-000000000003','31000000-0000-0000-0000-000000000003','Own','Created','own@test.dev');
select is((select count(*) from public.candidates),2::bigint,'ordinary creation assigns self'); reset role;

set local role authenticated; select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000005',true);
select is((select count(*) from public.candidates),1::bigint,'team leader sees nested descendant candidate');
select ok(public.can_access_candidate('32000000-0000-0000-0000-000000000003'),'candidate helper authorizes descendant'); reset role;

set local role authenticated; select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000002',true);
select is((select count(*) from public.candidates),4::bigint,'manager A sees own branch candidates');
select is((select count(*) from public.candidates where id in ('32000000-0000-0000-0000-000000000004','32000000-0000-0000-0000-000000000005')),0::bigint,'manager A cannot see sibling branch');
select is((select count(*) from public.candidates where organization_id='40000000-0000-0000-0000-000000000100'),0::bigint,'manager cannot cross organizations');
update public.candidates set assigned_membership_id='31000000-0000-0000-0000-000000000004' where id='32000000-0000-0000-0000-000000000001';
select is((select count(*) from public.candidate_assignment_history where candidate_id='32000000-0000-0000-0000-000000000001'),1::bigint,'authorized reassignment records history');
select is((select changed_by_membership_id from public.candidate_assignment_history where candidate_id='32000000-0000-0000-0000-000000000001'),'31000000-0000-0000-0000-000000000002'::uuid,'history records actor');
update public.candidates set assigned_membership_id=assigned_membership_id where id='32000000-0000-0000-0000-000000000001';
select is((select count(*) from public.candidate_assignment_history where candidate_id='32000000-0000-0000-0000-000000000001'),1::bigint,'no-op reassignment has no history'); reset role;

set local role authenticated; select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000003',true);
select is((select count(*) from public.candidates where id='32000000-0000-0000-0000-000000000001'),0::bigint,'reassignment immediately removes previous visibility'); reset role;
set local role authenticated; select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000004',true);
select is((select count(*) from public.candidates where id='32000000-0000-0000-0000-000000000001'),1::bigint,'reassignment immediately grants new visibility');
select throws_ok($$update public.candidates set assigned_membership_id='41000000-0000-0000-0000-000000000002' where id='32000000-0000-0000-0000-000000000001'$$,'23514','An active same-organization assignee is required.','authorized row access cannot assign cross-org'); reset role;

set local role authenticated; select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000001',true);
select is((select count(*) from public.candidates where organization_id='30000000-0000-0000-0000-000000000100'),6::bigint,'owner has organization-wide candidate scope');
select is((select count(*) from public.candidates where organization_id='40000000-0000-0000-0000-000000000100'),0::bigint,'owner remains tenant-bound'); reset role;
set local role authenticated; select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000009',true);
select is((select count(*) from public.candidates),0::bigint,'inactive membership has no candidate access');
select ok(not public.can_access_candidate('32000000-0000-0000-0000-000000000001'),'candidate helper fails closed for inactive caller'); reset role;
set local role authenticated; select set_config('request.jwt.claim.sub','40000000-0000-0000-0000-000000000001',true);
select is((select count(*) from public.candidates),1::bigint,'organization B sees only organization B candidate'); reset role;
set local role anon;
select throws_ok($$select count(*) from public.candidates$$,'42501',null,'anonymous candidate enumeration denied');
select throws_ok($$select public.can_access_candidate('32000000-0000-0000-0000-000000000001')$$,'42501',null,'anonymous helper execution denied'); reset role;
select is((select count(*) from public.candidate_assignment_history),1::bigint,'history remains append-only and exact');
select is((select previous_membership_id from public.candidate_assignment_history limit 1),'31000000-0000-0000-0000-000000000003'::uuid,'history preserves previous assignee');
select is((select new_membership_id from public.candidate_assignment_history limit 1),'31000000-0000-0000-0000-000000000004'::uuid,'history preserves new assignee');

select * from finish(); rollback;

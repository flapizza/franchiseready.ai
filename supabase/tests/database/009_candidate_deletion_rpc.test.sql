begin;
create extension if not exists pgtap with schema extensions;
select plan(18);

insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','90000000-0000-0000-0000-000000000001','authenticated','authenticated','delete-owner@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','90000000-0000-0000-0000-000000000002','authenticated','authenticated','delete-peer@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','90000000-0000-0000-0000-000000000003','authenticated','authenticated','delete-inactive@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','90000000-0000-0000-0000-000000000004','authenticated','authenticated','delete-other@example.test','',now(),'{}','{}',now(),now());

insert into public.organizations(id,public_id,name) values
('90000000-0000-0000-0000-000000000100','org_deleterpcaaaaaaa','Deletion A'),
('90000000-0000-0000-0000-000000000200','org_deleterpcbbbbbbb','Deletion B');
insert into public.organization_memberships(id,organization_id,user_id,role,status,manager_membership_id) values
('91000000-0000-0000-0000-000000000001','90000000-0000-0000-0000-000000000100','90000000-0000-0000-0000-000000000001','consultant','active',null),
('91000000-0000-0000-0000-000000000002','90000000-0000-0000-0000-000000000100','90000000-0000-0000-0000-000000000002','consultant','active',null),
('91000000-0000-0000-0000-000000000003','90000000-0000-0000-0000-000000000100','90000000-0000-0000-0000-000000000003','consultant','suspended',null),
('91000000-0000-0000-0000-000000000004','90000000-0000-0000-0000-000000000200','90000000-0000-0000-0000-000000000004','consultant','active',null);

insert into public.candidates(id,organization_id,public_id,assigned_membership_id,created_by_membership_id,first_name,last_name,email) values
('92000000-0000-0000-0000-000000000001','90000000-0000-0000-0000-000000000100','cand_deletefreeaaaaaa','91000000-0000-0000-0000-000000000001','91000000-0000-0000-0000-000000000001','Delete','Free','free@example.test'),
('92000000-0000-0000-0000-000000000002','90000000-0000-0000-0000-000000000100','cand_deletepeeraaaaaa','91000000-0000-0000-0000-000000000002','91000000-0000-0000-0000-000000000002','Delete','Peer','peer@example.test'),
('92000000-0000-0000-0000-000000000003','90000000-0000-0000-0000-000000000200','cand_deleteotheraaaaa','91000000-0000-0000-0000-000000000004','91000000-0000-0000-0000-000000000004','Delete','Other','other@example.test'),
('92000000-0000-0000-0000-000000000004','90000000-0000-0000-0000-000000000100','cand_deletehistoryaaa','91000000-0000-0000-0000-000000000001','91000000-0000-0000-0000-000000000001','Delete','History','history@example.test'),
('92000000-0000-0000-0000-000000000005','90000000-0000-0000-0000-000000000100','cand_deleteassessaaaa','91000000-0000-0000-0000-000000000001','91000000-0000-0000-0000-000000000001','Delete','Assessment','assessment@example.test'),
('92000000-0000-0000-0000-000000000006','90000000-0000-0000-0000-000000000100','cand_deletediscoverya','91000000-0000-0000-0000-000000000001','91000000-0000-0000-0000-000000000001','Delete','Discovery','discovery@example.test'),
('92000000-0000-0000-0000-000000000007','90000000-0000-0000-0000-000000000100','cand_deleteemailaaaaa','91000000-0000-0000-0000-000000000001','91000000-0000-0000-0000-000000000001','Delete','Email','email@example.test');

insert into public.candidate_assignment_history(organization_id,candidate_id,previous_membership_id,new_membership_id,changed_by_membership_id)
values('90000000-0000-0000-0000-000000000100','92000000-0000-0000-0000-000000000004','91000000-0000-0000-0000-000000000002','91000000-0000-0000-0000-000000000001','91000000-0000-0000-0000-000000000001');
insert into public.assessment_sessions(id,public_id,organization_id,candidate_id,owning_membership_id,created_by_membership_id,token_hash,expires_at)
values('93000000-0000-0000-0000-000000000001','asmt_deleterpcaaaaaaa','90000000-0000-0000-0000-000000000100','92000000-0000-0000-0000-000000000005','91000000-0000-0000-0000-000000000001','91000000-0000-0000-0000-000000000001',repeat('9',64),now()+interval '1 day');
insert into public.discovery_sessions(id,public_id,organization_id,candidate_id,assessment_session_id,consultant_membership_id)
values('94000000-0000-0000-0000-000000000001','disc_deleterpcaaaaaaa','90000000-0000-0000-0000-000000000100','92000000-0000-0000-0000-000000000006','93000000-0000-0000-0000-000000000001','91000000-0000-0000-0000-000000000001');
insert into public.connected_email_accounts(id,public_id,organization_id,owner_membership_id,provider,provider_account_id,email_address,status,granted_scopes,connected_at)
values('95000000-0000-0000-0000-000000000001','email_account_deleterpc','90000000-0000-0000-0000-000000000100','91000000-0000-0000-0000-000000000001','google','delete-rpc','sender@example.test','connected',array['https://www.googleapis.com/auth/gmail.send'],now());
insert into public.email_messages(public_id,organization_id,owner_membership_id,connected_email_account_id,candidate_id,provider,internet_message_id,sender_email,subject,text_body,send_idempotency_key)
values('email_deleterpcaaaaaaa','90000000-0000-0000-0000-000000000100','91000000-0000-0000-0000-000000000001','95000000-0000-0000-0000-000000000001','92000000-0000-0000-0000-000000000007','google','<delete-rpc@example.test>','sender@example.test','Delete RPC','Body','delete-rpc-key-0001');

select ok(has_function_privilege('authenticated','public.delete_relation_free_candidate(text)','execute'),'authenticated can execute deletion RPC');
select ok(not has_function_privilege('anon','public.delete_relation_free_candidate(text)','execute'),'anonymous cannot execute deletion RPC');

set local role authenticated; select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000001',true);
select is(public.delete_relation_free_candidate('cand_deletefreeaaaaaa'),'deleted','authorized relation-free candidate is deleted');
select is((select count(*) from public.candidates where public_id='cand_deletefreeaaaaaa'),0::bigint,'deleted candidate row is absent');
select throws_ok($$select public.delete_relation_free_candidate('cand_deletepeeraaaaaa')$$,'42501','Candidate cannot be deleted.','peer candidate is denied');
select throws_ok($$select public.delete_relation_free_candidate('cand_deleteotheraaaaa')$$,'42501','Candidate cannot be deleted.','cross-organization candidate is denied');
select throws_ok($$select public.delete_relation_free_candidate('cand_missingaaaaaaaaa')$$,'42501','Candidate cannot be deleted.','non-existent candidate fails safely');
select throws_ok($$select public.delete_relation_free_candidate('cand_deletehistoryaaa')$$,'55000','Candidate cannot be deleted because related records exist.','assignment history blocks deletion');
select throws_ok($$select public.delete_relation_free_candidate('cand_deleteassessaaaa')$$,'55000','Candidate cannot be deleted because related records exist.','assessment dependency blocks deletion');
select throws_ok($$select public.delete_relation_free_candidate('cand_deletediscoverya')$$,'55000','Candidate cannot be deleted because related records exist.','discovery dependency blocks deletion');
select throws_ok($$select public.delete_relation_free_candidate('cand_deleteemailaaaaa')$$,'55000','Candidate cannot be deleted because related records exist.','email dependency blocks deletion');
reset role;

set local role authenticated; select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000003',true);
select throws_ok($$select public.delete_relation_free_candidate('cand_deletehistoryaaa')$$,'42501','Candidate cannot be deleted.','inactive caller is denied');
reset role;

select is((select count(*) from public.candidate_assignment_history where candidate_id='92000000-0000-0000-0000-000000000004'),1::bigint,'assignment history is never deleted implicitly');
select is((select count(*) from public.assessment_sessions where candidate_id='92000000-0000-0000-0000-000000000005'),1::bigint,'assessment records are never deleted implicitly');
select is((select count(*) from public.discovery_sessions where candidate_id='92000000-0000-0000-0000-000000000006'),1::bigint,'discovery records are never deleted implicitly');
select is((select count(*) from public.email_messages where candidate_id='92000000-0000-0000-0000-000000000007'),1::bigint,'email records are never deleted implicitly');
select is((select count(*) from public.candidates where public_id in('cand_deletehistoryaaa','cand_deleteassessaaaa','cand_deletediscoverya','cand_deleteemailaaaaa')),4::bigint,'all dependency-bearing candidates remain');
select is((select count(*) from public.candidates where public_id in('cand_deletepeeraaaaaa','cand_deleteotheraaaaa')),2::bigint,'unauthorized candidates remain');

select * from finish();
rollback;

begin;
create extension if not exists pgtap with schema extensions;
select plan(28);
select has_table('public','assessment_sessions','assessment sessions exist');
select has_table('public','assessment_submissions','immutable submissions exist');
select has_table('public','assessment_analyses','versioned analyses exist');
select col_is_fk('public','assessment_sessions','organization_id','sessions are tenant bound');
select col_is_fk('public','assessment_sessions','candidate_id','sessions associate candidates');
select col_is_fk('public','assessment_sessions',array['owning_membership_id','organization_id'],'sessions preserve same-tenant ownership');
select col_not_null('public','assessment_sessions','instrument_version','instrument version persists');
select col_not_null('public','assessment_sessions','expires_at','tokens expire');
select col_type_is('public','assessment_sessions','token_hash','text','opaque token hash is stored');
select has_index('public','assessment_sessions','assessment_sessions_token_hash_key','token hashes are unique');
select col_not_null('public','assessment_submissions','response_snapshot','source responses persist');
select col_not_null('public','assessment_analyses','analysis_version','analysis version persists');
select has_index('public','assessment_analyses','assessment_current_analysis_idx','one current derived analysis is enforced');
select has_function('public','create_assessment_invitation',array['text','text','timestamp with time zone'],'consultant invitation boundary exists');
select has_function('public','load_assessment_by_token',array['text'],'token-scoped load boundary exists');
select has_function('public','save_assessment_progress',array['text','jsonb'],'durable resume boundary exists');
select has_function('public','submit_assessment',array['text','jsonb','jsonb','jsonb','integer'],'atomic immutable submission boundary exists');
select has_function('public','regenerate_assessment_analysis',array['text','jsonb','integer'],'analysis regeneration boundary exists');
select has_function('public','revoke_assessment_invitation',array['text'],'revocation boundary exists');
select policies_are('public','assessment_analyses',array['assessment_analyses_read'],'consultant-only analysis policy is narrow');

insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','50000000-0000-0000-0000-000000000001','authenticated','authenticated','report-manager@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','50000000-0000-0000-0000-000000000002','authenticated','authenticated','report-owner@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','50000000-0000-0000-0000-000000000003','authenticated','authenticated','report-sibling@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','50000000-0000-0000-0000-000000000004','authenticated','authenticated','report-other@example.test','',now(),'{}','{}',now(),now());
insert into public.organizations(id,public_id,name) values
('50000000-0000-0000-0000-000000000100','org_reportauthaaaaaa','Report Authorization A'),
('50000000-0000-0000-0000-000000000200','org_reportauthbbbbbb','Report Authorization B');
insert into public.organization_memberships(id,organization_id,user_id,role,status,manager_membership_id) values
('51000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000100','50000000-0000-0000-0000-000000000001','manager','active',null),
('51000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000100','50000000-0000-0000-0000-000000000002','consultant','active','51000000-0000-0000-0000-000000000001'),
('51000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000100','50000000-0000-0000-0000-000000000003','consultant','active','51000000-0000-0000-0000-000000000001'),
('51000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000200','50000000-0000-0000-0000-000000000004','consultant','active',null);
insert into public.candidates(id,organization_id,public_id,assigned_membership_id,created_by_membership_id,first_name,last_name,email) values
('52000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000100','cand_reportauthaaaaaa','51000000-0000-0000-0000-000000000002','51000000-0000-0000-0000-000000000001','Report','Candidate','report-candidate@example.test');
insert into public.assessment_sessions(id,public_id,organization_id,candidate_id,owning_membership_id,created_by_membership_id,instrument_version,status,token_hash,expires_at,completed_at,created_at) values
('53000000-0000-0000-0000-000000000001','asmt_reportauthaaaa','50000000-0000-0000-0000-000000000100','52000000-0000-0000-0000-000000000001','51000000-0000-0000-0000-000000000002','51000000-0000-0000-0000-000000000001','franchise-ownership-assessment-v1','analyzed',repeat('a',64),now()+interval '14 days',now(),now()),
('53000000-0000-0000-0000-000000000002','asmt_reportexpired','50000000-0000-0000-0000-000000000100','52000000-0000-0000-0000-000000000001','51000000-0000-0000-0000-000000000002','51000000-0000-0000-0000-000000000001','franchise-ownership-assessment-v1','invited',repeat('b',64),now()-interval '1 day',null,now()-interval '2 days'),
('53000000-0000-0000-0000-000000000003','asmt_reportrevoked','50000000-0000-0000-0000-000000000100','52000000-0000-0000-0000-000000000001','51000000-0000-0000-0000-000000000002','51000000-0000-0000-0000-000000000001','franchise-ownership-assessment-v1','cancelled',repeat('c',64),now()+interval '14 days',null,now()-interval '1 day');
update public.assessment_sessions set revoked_at=now() where id='53000000-0000-0000-0000-000000000003';
insert into public.assessment_submissions(id,session_id,organization_id,instrument_version,intake_snapshot,response_snapshot,submitted_at) values
('54000000-0000-0000-0000-000000000001','53000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000100','franchise-ownership-assessment-v1','{}','{}',now());
insert into public.assessment_analyses(id,session_id,submission_id,organization_id,instrument_version,analysis_version,analysis_snapshot) values
('55000000-0000-0000-0000-000000000001','53000000-0000-0000-0000-000000000001','54000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000100','franchise-ownership-assessment-v1',2,'{"ownershipProfile":{"primary":"Synthetic profile"}}');

set local role authenticated;select set_config('request.jwt.claim.sub','50000000-0000-0000-0000-000000000002',true);
select is((select count(*) from public.get_candidate_assessment('cand_reportauthaaaaaa')),1::bigint,'assigned consultant can resolve the report source');reset role;
set local role authenticated;select set_config('request.jwt.claim.sub','50000000-0000-0000-0000-000000000001',true);
select is((select count(*) from public.get_candidate_assessment('cand_reportauthaaaaaa')),1::bigint,'authorized manager ancestor can resolve the report source');reset role;
set local role authenticated;select set_config('request.jwt.claim.sub','50000000-0000-0000-0000-000000000003',true);
select is((select count(*) from public.get_candidate_assessment('cand_reportauthaaaaaa')),0::bigint,'sibling consultant cannot resolve the report source');reset role;
set local role authenticated;select set_config('request.jwt.claim.sub','50000000-0000-0000-0000-000000000004',true);
select is((select count(*) from public.get_candidate_assessment('cand_reportauthaaaaaa')),0::bigint,'cross-organization consultant cannot resolve the report source');reset role;
set local role anon;
select is((select count(*) from public.load_assessment_by_token(repeat('d',64))),0::bigint,'invalid assessment token fails closed');
select is((select status::text from public.load_assessment_by_token(repeat('a',64))),'analyzed','valid token holder can resolve completed candidate-safe source');
select is((select status::text from public.load_assessment_by_token(repeat('b',64))),'expired','expired token follows invitation expiry policy');
select is((select analysis_snapshot is null from public.load_assessment_by_token(repeat('c',64))),true,'revoked token exposes no analysis snapshot');reset role;
select * from finish(); rollback;

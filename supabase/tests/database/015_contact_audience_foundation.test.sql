begin;create extension if not exists pgtap with schema extensions;select plan(15);
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','f0000000-0000-0000-0000-000000000001','authenticated','authenticated','audience-a@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','f0000000-0000-0000-0000-000000000002','authenticated','authenticated','audience-b@example.test','',now(),'{}','{}',now(),now());
insert into public.organizations(id,public_id,name) values('f1000000-0000-0000-0000-000000000001','org_audienceaaaaaaaa','Audience A'),('f1000000-0000-0000-0000-000000000002','org_audiencebbbbbbbb','Audience B');
insert into public.organization_memberships(id,organization_id,user_id,role,status) values('f2000000-0000-0000-0000-000000000001','f1000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001','owner','active'),('f2000000-0000-0000-0000-000000000002','f1000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000002','owner','active');
insert into public.contacts(id,organization_id,created_by_membership_id,assigned_membership_id,first_name,last_name,primary_email,source) values('f3000000-0000-0000-0000-000000000001','f1000000-0000-0000-0000-000000000001','f2000000-0000-0000-0000-000000000001','f2000000-0000-0000-0000-000000000001','Ada','Audience','ada@audience.test','CSV Import');
set local role authenticated;select set_config('request.jwt.claim.sub','f0000000-0000-0000-0000-000000000001',true);
insert into public.contact_tags(organization_id,created_by_membership_id,name) values('f1000000-0000-0000-0000-000000000001','f2000000-0000-0000-0000-000000000001','  Webinar   Lead ');
select is((select normalized_name from public.contact_tags),'webinar lead','tag names normalize whitespace and case');
select throws_ok($$insert into public.contact_tags(organization_id,created_by_membership_id,name) values('f1000000-0000-0000-0000-000000000001','f2000000-0000-0000-0000-000000000001','WEBINAR LEAD')$$,'23505',null,'duplicate normalized tags are denied');
insert into public.contact_lists(organization_id,created_by_membership_id,name) values('f1000000-0000-0000-0000-000000000001','f2000000-0000-0000-0000-000000000001','Newsletter');
insert into public.contact_tag_memberships select 'f1000000-0000-0000-0000-000000000001','f3000000-0000-0000-0000-000000000001',id,'f2000000-0000-0000-0000-000000000001',now() from public.contact_tags;
insert into public.contact_list_memberships select 'f1000000-0000-0000-0000-000000000001','f3000000-0000-0000-0000-000000000001',id,'f2000000-0000-0000-0000-000000000001',now() from public.contact_lists;
select throws_ok($$insert into public.contact_list_memberships select organization_id,'f3000000-0000-0000-0000-000000000001',id,'f2000000-0000-0000-0000-000000000001',now() from public.contact_lists$$,'23505',null,'list membership is unique');
select is((select count(*) from public.contacts c join public.contact_tag_memberships m on m.contact_id=c.id join public.contact_tags t on t.id=m.tag_id where t.normalized_name='webinar lead'),1::bigint,'contacts filter by tag');
select is((select count(*) from public.contacts c join public.contact_list_memberships m on m.contact_id=c.id join public.contact_lists l on l.id=m.list_id where l.normalized_name='newsletter'),1::bigint,'contacts filter by list');
select is((select marketing_email_status::text from public.contacts),'unknown','membership changes do not manufacture consent');
select is(public.bulk_organize_contacts(array[(select public_id from public.contacts)],'lifecycle',null,'nurture'),1,'authorized bulk lifecycle succeeds');
select is((select lifecycle_status::text from public.contacts),'nurture','bulk lifecycle persists');
select throws_ok($$select public.bulk_organize_contacts(array[(select public_id from public.contacts)],'lifecycle',null,'active-candidate')$$,'22023','Unsupported bulk operation.','bulk Candidate promotion is denied');
select is((select count(*) from public.contact_tags where organization_id='f1000000-0000-0000-0000-000000000002'),0::bigint,'other tenant tags hidden');
select is((select count(*) from public.contact_lists where organization_id='f1000000-0000-0000-0000-000000000002'),0::bigint,'other tenant lists hidden');
select ok(not has_table_privilege('anon','public.contact_tags','SELECT'),'anonymous tags denied');select ok(not has_table_privilege('anon','public.contact_lists','SELECT'),'anonymous lists denied');select ok(not has_function_privilege('anon','public.bulk_organize_contacts(text[],text,text,public.contact_lifecycle_status)','EXECUTE'),'anonymous bulk denied');
select is((select count(*) from public.candidates where contact_id='f3000000-0000-0000-0000-000000000001'),0::bigint,'audience organization does not create candidate relationships');select * from finish();rollback;

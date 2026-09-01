begin;
create extension if not exists pgtap with schema extensions;
select plan(31);

insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001','authenticated','authenticated','owner-a@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000002','authenticated','authenticated','consultant-a@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000003','authenticated','authenticated','inactive-a@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','e0000000-0000-0000-0000-000000000001','authenticated','authenticated','owner-b@example.test','',now(),'{}','{}',now(),now());
insert into public.organizations(id,public_id,name) values
('d1000000-0000-0000-0000-000000000001','org_contactsorgaaaaa','Contacts Org A'),
('e1000000-0000-0000-0000-000000000001','org_contactsorgbbbbb','Contacts Org B');
insert into public.organization_memberships(id,organization_id,user_id,role,status,manager_membership_id) values
('d2000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000001','owner','active',null),
('d2000000-0000-0000-0000-000000000002','d1000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000002','consultant','active','d2000000-0000-0000-0000-000000000001'),
('d2000000-0000-0000-0000-000000000003','d1000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000003','consultant','suspended','d2000000-0000-0000-0000-000000000001'),
('e2000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','owner','active',null);

select ok(has_table_privilege('authenticated','public.contacts','SELECT'),'authenticated may select contacts through RLS');
select ok(has_table_privilege('authenticated','public.contacts','INSERT'),'authenticated may insert contacts through RLS');
select ok(not has_table_privilege('authenticated','public.contacts','DELETE'),'contacts cannot be deleted through the Data API');
select ok(not has_table_privilege('anon','public.contacts','SELECT'),'anonymous contact enumeration is denied');
select ok(not has_function_privilege('anon','public.promote_contact_to_candidate(text)','EXECUTE'),'anonymous promotion execution is denied');

set local role authenticated;
select set_config('request.jwt.claim.sub','d0000000-0000-0000-0000-000000000002',true);
insert into public.contacts(organization_id,created_by_membership_id,assigned_membership_id,first_name,last_name,primary_email,primary_phone,city,state_province,source)
values('d1000000-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000002','d2000000-0000-0000-0000-000000000002','Ada','Lovelace',' ADA@Example.Test ','(555) 010-1212','Toronto','ON','Referral');
select is((select count(*) from public.contacts),1::bigint,'consultant creates and lists an assigned contact');
select is((select normalized_primary_email from public.contacts),'ada@example.test','email is normalized');
select is((select normalized_primary_phone from public.contacts),'5550101212','phone is normalized');
select throws_ok($$insert into public.contacts(organization_id,created_by_membership_id,assigned_membership_id,first_name,last_name,primary_email,source) values('d1000000-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000002','d2000000-0000-0000-0000-000000000002','Different','Person','ada@example.test','Manual')$$,'23505',null,'normalized email prevents an obvious organization duplicate');
insert into public.contacts(organization_id,created_by_membership_id,assigned_membership_id,first_name,last_name,primary_email,source)
values('d1000000-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000002','d2000000-0000-0000-0000-000000000002','No','Email',null,'Walk-in');
select is((select count(*) from public.contacts where normalized_primary_email is null),1::bigint,'contact without email is permitted');
update public.contacts set company='Analytical Engines', lifecycle_status='engaged' where first_name='Ada';
select results_eq($$select company,lifecycle_status::text from public.contacts where first_name='Ada'$$,$$values('Analytical Engines'::text,'engaged'::text)$$,'contact update persists');
select is((select count(*) from public.contacts where lower(first_name||' '||last_name) like '%ada%'),1::bigint,'contact search predicate finds a person');
select is((select count(*) from public.contacts where lifecycle_status='engaged'),1::bigint,'contact lifecycle filtering is stable');
select throws_ok($$insert into public.contacts(organization_id,created_by_membership_id,assigned_membership_id,first_name,last_name,source) values('d1000000-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000002','d2000000-0000-0000-0000-000000000001','Unauthorized','Assignment','Manual')$$,'42501',null,'consultant cannot assign a contact outside authorized self scope');
reset role;

insert into public.contacts(organization_id,created_by_membership_id,assigned_membership_id,first_name,last_name,primary_email,source)
values('e1000000-0000-0000-0000-000000000001','e2000000-0000-0000-0000-000000000001','e2000000-0000-0000-0000-000000000001','Ada','Other Org','ada@example.test','Manual');
select is((select count(*) from public.contacts where normalized_primary_email='ada@example.test'),2::bigint,'same normalized email is allowed in separate organizations');

set local role authenticated;
select set_config('request.jwt.claim.sub','d0000000-0000-0000-0000-000000000002',true);
select is((select count(*) from public.contacts),2::bigint,'consultant remains tenant and assignment scoped');
select is((select count(*) from public.contacts where organization_id='e1000000-0000-0000-0000-000000000001'),0::bigint,'cross-tenant contacts are hidden');
select throws_ok($$select * from public.promote_contact_to_candidate((select public_id from public.contacts where first_name='No'))$$,'23514','Add an email address before promoting this contact.','email-less contact is not promotion eligible');
select lives_ok($$select * from public.promote_contact_to_candidate((select public_id from public.contacts where first_name='Ada'))$$,'eligible contact promotion succeeds');
select is((select count(*) from public.candidates where contact_id=(select id from public.contacts where first_name='Ada')),1::bigint,'promotion creates one linked candidate profile');
select ok((select public_id like 'cand_%' from public.candidates where contact_id=(select id from public.contacts where first_name='Ada')),'promotion preserves candidate public route identity');
select is((select lifecycle_status::text from public.contacts where first_name='Ada'),'active-candidate','promotion advances contact lifecycle');
select is((select source from public.contacts where first_name='Ada'),'Referral','promotion retains contact source');
select throws_ok($$select * from public.promote_contact_to_candidate((select public_id from public.contacts where first_name='Ada'))$$,'23505','This contact already has a candidate profile.','duplicate active candidate promotion is rejected');
select throws_ok($$update public.candidates set first_name='Diverged' where contact_id=(select id from public.contacts where first_name='Ada')$$,'23514','Linked candidate identity must match its contact source of truth.','candidate identity cannot diverge from contact');
update public.contacts set preferred_name='Augusta',primary_phone='555-777-8888' where first_name='Ada';
select is((select preferred_name||'|'||phone from public.candidates where contact_id=(select id from public.contacts where first_name='Ada')),'Augusta|555-777-8888','contact edits synchronize linked candidate compatibility fields');
select throws_ok($$update public.contacts set primary_email=null where first_name='Ada'$$,'23514','Email cannot be removed from a contact linked to a candidate.','linked candidate email remains valid');
reset role;

insert into public.candidates(organization_id,assigned_membership_id,created_by_membership_id,first_name,last_name,email)
values('d1000000-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000002','d2000000-0000-0000-0000-000000000002','Legacy','Candidate','legacy@example.test');
select is((select count(*) from public.candidates where first_name='Legacy' and contact_id is null),1::bigint,'legacy unlinked candidate compatibility remains additive');

set local role authenticated;
select set_config('request.jwt.claim.sub','d0000000-0000-0000-0000-000000000003',true);
select is((select count(*) from public.contacts),0::bigint,'suspended membership has no contact access');
reset role;
set local role anon;
select throws_ok($$select count(*) from public.contacts$$,'42501',null,'anonymous contact query is denied');
select throws_ok($$select * from public.promote_contact_to_candidate('contact_missingidentity')$$,'42501',null,'anonymous contact promotion is denied');
reset role;

select * from finish();
rollback;

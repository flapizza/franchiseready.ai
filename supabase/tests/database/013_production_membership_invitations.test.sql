begin;
create extension if not exists pgtap with schema extensions;
select plan(33);

insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000001','authenticated','authenticated','owner@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000002','authenticated','authenticated','admin@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000003','authenticated','authenticated','consultant@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000004','authenticated','authenticated','invitee@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','d0000000-0000-0000-0000-000000000005','authenticated','authenticated','wrong@example.test','',now(),'{}','{}',now(),now());
insert into public.organizations(id,public_id,name) values
('d1000000-0000-0000-0000-000000000001','org_invitationorgaaa','Invitation Organization'),
('d1000000-0000-0000-0000-000000000002','org_invitationorgbbb','Other Organization');
insert into public.organization_memberships(id,organization_id,user_id,role,status,manager_membership_id) values
('d2000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000001','owner','active',null),
('d2000000-0000-0000-0000-000000000002','d1000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000002','admin','active',null),
('d2000000-0000-0000-0000-000000000003','d1000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000003','consultant','active',null);

select ok(not has_table_privilege('anon','public.membership_invitations','SELECT'),'anon cannot read invitation table');
select ok(not has_table_privilege('authenticated','public.membership_invitations','INSERT'),'authenticated cannot mutate invitation table directly');
select ok(has_function_privilege('anon','public.resolve_membership_invitation(text)','EXECUTE'),'anon may use only limited token resolution');
select ok(not has_function_privilege('anon','public.accept_membership_invitation(text)','EXECUTE'),'anon cannot execute acceptance');

set local role authenticated;
select set_config('request.jwt.claim.sub','d0000000-0000-0000-0000-000000000003',true);
select throws_ok($$select * from public.create_membership_invitation('d1000000-0000-0000-0000-000000000001','invitee@example.test','consultant','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')$$,'42501',null,'consultant cannot create invitations');
select set_config('request.jwt.claim.sub','d0000000-0000-0000-0000-000000000001',true);
select throws_ok($$select * from public.create_membership_invitation('d1000000-0000-0000-0000-000000000002','invitee@example.test','consultant','bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')$$,'42501',null,'cross-tenant invitation creation is denied');
select throws_ok($$select * from public.create_membership_invitation('d1000000-0000-0000-0000-000000000001','invitee@example.test','owner','ccccccccccccccccccccccccccccccccccccccccccc')$$,'42501',null,'owner role invitation is outside allowed least privilege roles');
select set_config('request.jwt.claim.sub','d0000000-0000-0000-0000-000000000002',true);
select throws_ok($$select * from public.create_membership_invitation('d1000000-0000-0000-0000-000000000001','invitee@example.test','admin','ddddddddddddddddddddddddddddddddddddddddddd')$$,'42501',null,'admin cannot grant admin role');
select set_config('request.jwt.claim.sub','d0000000-0000-0000-0000-000000000001',true);
select is((select created from public.create_membership_invitation('d1000000-0000-0000-0000-000000000001',' Invitee@Example.Test ','consultant','eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')),true,'owner creates consultant invitation');
reset role;
select is((select invited_email from public.membership_invitations),'invitee@example.test','invited email is normalized');
select is((select resolution from public.resolve_membership_invitation('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')),'available','valid token resolves available');
select is((select resolution from public.resolve_membership_invitation('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')),'invalid','unknown token resolves invalid');

set local role authenticated;
select set_config('request.jwt.claim.sub','d0000000-0000-0000-0000-000000000001',true);
select is((select created from public.create_membership_invitation('d1000000-0000-0000-0000-000000000001','invitee@example.test','consultant','fffffffffffffffffffffffffffffffffffffffffff')),false,'duplicate pending invitation is deterministically reissued');
reset role;
select is((select count(*) from public.membership_invitations where invited_email='invitee@example.test'),1::bigint,'reissue creates no duplicate pending invitation');
select is((select resolution from public.resolve_membership_invitation('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')),'invalid','reissue invalidates old bearer token');
select is((select resolution from public.resolve_membership_invitation('fffffffffffffffffffffffffffffffffffffffffff')),'available','reissued token is available');

set local role authenticated;
select set_config('request.jwt.claim.sub','d0000000-0000-0000-0000-000000000005',true);
select throws_ok($$select * from public.accept_membership_invitation('fffffffffffffffffffffffffffffffffffffffffff')$$,'42501',null,'wrong authenticated email cannot accept');
select set_config('request.jwt.claim.sub','d0000000-0000-0000-0000-000000000004',true);
select is((select accepted from public.accept_membership_invitation('fffffffffffffffffffffffffffffffffffffffffff')),true,'verified intended recipient accepts');
reset role;
select is((select count(*) from public.organization_memberships where user_id='d0000000-0000-0000-0000-000000000004'),1::bigint,'acceptance creates exactly one membership');
select is((select role::text from public.organization_memberships where user_id='d0000000-0000-0000-0000-000000000004'),'consultant','accepted membership has intended role');
select is((select count(*) from public.consultant_profiles cp join public.organization_memberships om on om.id=cp.membership_id where om.user_id='d0000000-0000-0000-0000-000000000004'),1::bigint,'acceptance initializes consultant profile');
select is((select mo.status::text from public.membership_onboarding mo join public.organization_memberships om on om.id=mo.membership_id where om.user_id='d0000000-0000-0000-0000-000000000004'),'not-started','acceptance initializes onboarding truthfully');
select is((select resolution from public.resolve_membership_invitation('fffffffffffffffffffffffffffffffffffffffffff')),'accepted','accepted token resolves accepted');
set local role authenticated;
select set_config('request.jwt.claim.sub','d0000000-0000-0000-0000-000000000004',true);
select is((select accepted from public.accept_membership_invitation('fffffffffffffffffffffffffffffffffffffffffff')),false,'double acceptance returns established outcome');
reset role;
select is((select count(*) from public.organization_memberships where user_id='d0000000-0000-0000-0000-000000000004'),1::bigint,'double acceptance creates no duplicate membership');

set local role authenticated;
select set_config('request.jwt.claim.sub','d0000000-0000-0000-0000-000000000001',true);
select lives_ok($$select * from public.create_membership_invitation('d1000000-0000-0000-0000-000000000001','revoke@example.test','consultant','ggggggggggggggggggggggggggggggggggggggggggg')$$,'revocable invitation created');
reset role;
create temp table revocation_target as select id from public.membership_invitations where invited_email='revoke@example.test';
grant select on revocation_target to authenticated;
set local role authenticated;
select set_config('request.jwt.claim.sub','d0000000-0000-0000-0000-000000000003',true);
select throws_ok($$select public.revoke_membership_invitation((select id from revocation_target))$$,'42501',null,'consultant cannot revoke invitation');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','d0000000-0000-0000-0000-000000000001',true);
select lives_ok($$select public.revoke_membership_invitation((select id from revocation_target))$$,'owner revokes pending invitation');
reset role;
select is((select resolution from public.resolve_membership_invitation('ggggggggggggggggggggggggggggggggggggggggggg')),'revoked','revoked token resolves revoked');

set local role authenticated;
select set_config('request.jwt.claim.sub','d0000000-0000-0000-0000-000000000001',true);
select lives_ok($$select * from public.create_membership_invitation('d1000000-0000-0000-0000-000000000001','expired@example.test','consultant','hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')$$,'expiring invitation created');
reset role;
update public.membership_invitations set expires_at=now()-interval '1 minute' where invited_email='expired@example.test';
select is((select resolution from public.resolve_membership_invitation('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')),'expired','expired token resolves expired');
select is((select count(*) from private.domain_event_outbox where organization_id='d1000000-0000-0000-0000-000000000001' and event_type like 'membership-invitation.%'),5::bigint,'invitation lifecycle emits only real events');
select is((select count(*) from public.organization_settings where organization_id='d1000000-0000-0000-0000-000000000001'),0::bigint,'acceptance does not duplicate organization settings');

select * from finish();
rollback;

begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

select has_table('public', t, 'Brand Intelligence table: ' || t)
from unnest(array['brand_identities','brand_profile_versions','brand_fact_definitions','brand_profile_facts','brand_evidence','brand_fact_evidence','brand_consultant_items','organization_brands']) t;
select has_index('public','brand_profile_versions','brand_profiles_current_idx','current publication index');
select has_index('public','brand_fact_evidence','brand_fact_primary_evidence_idx','one primary source per fact');
select is((select count(*) from public.brand_fact_definitions),50::bigint,'all 50 canonical fact paths registered');
select ok((select bool_and(relrowsecurity) from pg_class where oid in (
 'public.brand_identities'::regclass,'public.brand_profile_versions'::regclass,'public.brand_fact_definitions'::regclass,
 'public.brand_profile_facts'::regclass,'public.brand_evidence'::regclass,'public.brand_fact_evidence'::regclass,
 'public.brand_consultant_items'::regclass,'public.organization_brands'::regclass)), 'RLS enabled on all new tables');

insert into auth.users(id,aud,role,email,raw_app_meta_data,raw_user_meta_data)
select md5('bi-user-'||n)::uuid,'authenticated','authenticated','bi-'||n||'@example.test','{}','{}' from generate_series(1,4) n;
insert into public.organizations(id,public_id,name)
select md5('bi-org-'||n)::uuid,'org_'||md5('bi-org-'||n),'BI org '||n from generate_series(1,2) n;
insert into public.organization_memberships(id,organization_id,user_id,role,status) values
 (md5('bi-member-1')::uuid,md5('bi-org-1')::uuid,md5('bi-user-1')::uuid,'owner','active'),
 (md5('bi-member-2')::uuid,md5('bi-org-2')::uuid,md5('bi-user-2')::uuid,'owner','active'),
 (md5('bi-member-3')::uuid,md5('bi-org-1')::uuid,md5('bi-user-3')::uuid,'consultant','suspended');

set local role service_role;
insert into public.brand_identities(id,slug,name,visibility)
values (md5('bi-shared')::uuid,'bi-shared','Shared','shared'),(md5('bi-private')::uuid,'bi-private','Private','restricted');
select throws_ok($$insert into public.brand_identities(slug,name) values('bi-shared','Duplicate')$$,'23505',null,'slug unique');
select throws_ok($$insert into public.brand_identities(slug,name) values('Bad Slug','Invalid')$$,'23514',null,'slug normalized');
select throws_ok($$insert into public.brand_identities(public_id,slug,name) select public_id,'another-slug','Duplicate ID' from public.brand_identities limit 1$$,'23505',null,'public identity unique');
select throws_ok($$update public.brand_identities set slug='changed' where slug='bi-shared'$$,'23514',null,'stable slug cannot drift');
insert into public.organization_brands(organization_id,brand_id) values(md5('bi-org-1')::uuid,md5('bi-private')::uuid);
insert into public.brand_profile_versions(id,brand_id,version_number,brand_name,origin,created_by)
values(md5('bi-shared-v1')::uuid,md5('bi-shared')::uuid,1,'Shared','test','fixture'),
 (md5('bi-private-v1')::uuid,md5('bi-private')::uuid,1,'Private','test','fixture');
select throws_ok($$insert into public.brand_profile_versions(brand_id,version_number,brand_name,origin,created_by) values(md5('bi-shared')::uuid,1,'Dup','test','fixture')$$,'23505',null,'version number unique per brand');
select throws_ok($$insert into public.brand_profile_versions(brand_id,version_number,brand_name,origin,created_by,status) values(md5('bi-shared')::uuid,2,'Bad','test','fixture','published')$$,'23514',null,'cannot insert published profile');
select throws_ok($$update public.brand_profile_versions set status='published' where id=md5('bi-shared-v1')::uuid$$,'23514',null,'cannot skip review');
select throws_ok($$update public.brand_profile_versions set status='reviewed',reviewed_by='reviewer',reviewed_at=now() where id=md5('bi-shared-v1')::uuid$$,'23514',null,'review requires explicit governed facts');
insert into public.brand_profile_facts(profile_id,fact_key)
select p.id,d.fact_key from public.brand_profile_versions p cross join public.brand_fact_definitions d where p.id in (md5('bi-shared-v1')::uuid,md5('bi-private-v1')::uuid,md5('bi-shared-v2')::uuid);
select is((select count(*) from public.brand_profile_facts where profile_id in (md5('bi-shared-v1')::uuid,md5('bi-private-v1')::uuid,md5('bi-shared-v2')::uuid) and knowledge_state='unknown' and review_state='not-reviewed' and verification='unknown' and value is null),100::bigint,'unknown and not-reviewed are explicit');
select throws_ok($$insert into public.brand_profile_facts(profile_id,fact_key) values(md5('bi-shared-v1')::uuid,'caller.arbitrary')$$,'23503',null,'arbitrary paths rejected');
select throws_ok($$insert into public.brand_fact_definitions(fact_key,value_kind) values('callerPath','text')$$,'42501',null,'service role cannot invent keys');
select throws_ok($$update public.brand_profile_facts set value='false' where profile_id=md5('bi-shared-v1')::uuid and fact_key='characteristics.recurringRevenue'$$,'23514',null,'unknown cannot silently become false');
select throws_ok($$update public.brand_profile_facts set value='"false"',knowledge_state='known',verification='unverified' where profile_id=md5('bi-shared-v1')::uuid and fact_key='characteristics.recurringRevenue'$$,'23514',null,'boolean string rejected');
select lives_ok($$update public.brand_profile_facts set value='false',knowledge_state='known',verification='unverified' where profile_id=md5('bi-shared-v1')::uuid and fact_key='characteristics.recurringRevenue'$$,'known false retained');
select is((select value from public.brand_profile_facts where profile_id=md5('bi-shared-v1')::uuid and fact_key='characteristics.recurringRevenue'),'false'::jsonb,'false is a known value');
select throws_ok($$update public.brand_profile_facts set value='"extreme"',knowledge_state='known',verification='unverified' where profile_id=md5('bi-shared-v1')::uuid and fact_key='fit.leadership'$$,'23514',null,'controlled enum enforced');
select throws_ok($$update public.brand_profile_facts set value='-1',knowledge_state='known',verification='unverified' where profile_id=md5('bi-shared-v1')::uuid and fact_key='economics.franchiseFee'$$,'23514',null,'negative money rejected');
select throws_ok($$update public.brand_profile_facts set value='{"minimum":200,"maximum":100,"currency":"USD"}',knowledge_state='known',verification='unverified' where profile_id=md5('bi-shared-v1')::uuid and fact_key='economics.initialInvestment'$$,'23514',null,'inverted money range rejected');
select throws_ok($$update public.brand_profile_facts set value='{"minimum":null,"maximum":100,"currency":null}',knowledge_state='known',verification='unverified' where profile_id=md5('bi-shared-v1')::uuid and fact_key='economics.initialInvestment'$$,'23514',null,'null currency rejected');
select lives_ok($$update public.brand_profile_facts set value='{"minimum":null,"maximum":100,"currency":"USD"}',knowledge_state='known',verification='unverified' where profile_id=md5('bi-shared-v1')::uuid and fact_key='economics.initialInvestment'$$,'partial range preserves unknown bound');
select throws_ok($$update public.brand_profile_facts set value='[1]',knowledge_state='known',verification='unverified' where profile_id=md5('bi-shared-v1')::uuid and fact_key='differentiators'$$,'23514',null,'typed string arrays enforced');
select throws_ok($$update public.brand_profile_facts set value='[{"name":"Fee","amount":20}]',knowledge_state='known',verification='unverified' where profile_id=md5('bi-shared-v1')::uuid and fact_key='economics.otherRecurringFees'$$,'23514',null,'fee structure enforced');
select throws_ok($$update public.brand_profile_facts set verification='verified' where profile_id=md5('bi-shared-v1')::uuid and fact_key='characteristics.recurringRevenue'$$,'23514',null,'verification requires review');
update public.brand_profile_facts set value='"Service"',knowledge_state='known',verification='unverified' where profile_id in (md5('bi-shared-v1')::uuid,md5('bi-private-v1')::uuid,md5('bi-shared-v2')::uuid) and fact_key in ('category','industry');
insert into public.brand_evidence(id,brand_id,source_type,title,created_by)
values(md5('bi-source-1')::uuid,md5('bi-shared')::uuid,'primary','Document A','fixture'),
 (md5('bi-source-2')::uuid,md5('bi-shared')::uuid,'secondary','Document B','fixture'),
 (md5('bi-source-3')::uuid,md5('bi-private')::uuid,'consultant-provided','Private document','fixture'),
 (md5('bi-unused')::uuid,md5('bi-shared')::uuid,'inferred','Unpublished evidence','fixture');
insert into public.brand_fact_evidence(profile_id,fact_key,evidence_id,brand_id,is_primary) values
 (md5('bi-shared-v1')::uuid,'category',md5('bi-source-1')::uuid,md5('bi-shared')::uuid,true),
 (md5('bi-shared-v1')::uuid,'category',md5('bi-source-2')::uuid,md5('bi-shared')::uuid,false),
 (md5('bi-shared-v1')::uuid,'industry',md5('bi-source-1')::uuid,md5('bi-shared')::uuid,true),
 (md5('bi-private-v1')::uuid,'category',md5('bi-source-3')::uuid,md5('bi-private')::uuid,true);
select is((select count(*) from public.brand_fact_evidence where evidence_id=md5('bi-source-1')::uuid),2::bigint,'one source supports two facts');
select is((select count(*) from public.brand_fact_evidence where profile_id=md5('bi-shared-v1')::uuid and fact_key='category'),2::bigint,'one fact has two sources');
select throws_ok($$update public.brand_fact_evidence set is_primary=true where evidence_id=md5('bi-source-2')::uuid$$,'23505',null,'only one primary source');
select throws_ok($$insert into public.brand_fact_evidence(profile_id,fact_key,evidence_id,brand_id) values(md5('bi-shared-v1')::uuid,'description',md5('bi-source-3')::uuid,md5('bi-shared')::uuid)$$,'23503',null,'cannot attach another brand evidence');
select throws_ok($$update public.brand_evidence set title='Changed' where id=md5('bi-source-1')::uuid$$,'23514',null,'evidence immutable even before publication');
select throws_ok($$delete from public.brand_evidence where id=md5('bi-source-1')::uuid$$,'23514',null,'source history cannot be deleted');
select lives_ok($$insert into public.brand_evidence(brand_id,supersedes_id,source_type,title,created_by,verification,reviewed_at) values(md5('bi-shared')::uuid,md5('bi-source-1')::uuid,'primary','Reviewed snapshot','reviewer','verified',now())$$,'correction creates a versioned evidence snapshot');
select throws_ok($$insert into public.brand_consultant_items(profile_id,section,position,label,explanation,source_facts,origin,origin_reference,created_by) values(md5('bi-shared-v1')::uuid,'strongFit',0,'Signal','Explanation',array['made.up'],'editorial','review-1','fixture')$$,'23503',null,'interpretation paths governed');
insert into public.brand_consultant_items(profile_id,section,position,label,explanation,source_facts,origin,origin_reference,created_by)
values(md5('bi-shared-v1')::uuid,'strongFit',0,'Signal','Explanation',array['category'],'editorial','review-1','fixture');
select throws_ok($$delete from public.brand_profile_facts where profile_id=md5('bi-shared-v1')::uuid and fact_key='category'$$,'23503',null,'editorial source cannot become dangling');
update public.brand_profile_facts set review_state='reviewed' where profile_id in (md5('bi-shared-v1')::uuid,md5('bi-private-v1')::uuid,md5('bi-shared-v2')::uuid);
select throws_ok($$update public.brand_profile_versions set status='reviewed',reviewed_by='reviewer',reviewed_at=now(),effective_at=now() where id=md5('bi-shared-v1')::uuid$$,'23514',null,'unreviewed editorial item blocks review');
update public.brand_consultant_items set review_state='reviewed',reviewed_by='reviewer',reviewed_at=now() where profile_id in (md5('bi-shared-v1')::uuid,md5('bi-private-v1')::uuid,md5('bi-shared-v2')::uuid);
update public.brand_profile_facts set verification='verified' where profile_id=md5('bi-shared-v1')::uuid and fact_key='category';
select throws_ok($$update public.brand_profile_versions set status='reviewed',reviewed_by='reviewer',reviewed_at=now(),effective_at=now() where id=md5('bi-shared-v1')::uuid$$,'23514',null,'verified fact requires verified evidence before approval');
insert into public.brand_fact_evidence(profile_id,fact_key,evidence_id,brand_id)
select md5('bi-shared-v1')::uuid,'category',id,brand_id from public.brand_evidence where supersedes_id=md5('bi-source-1')::uuid;
update public.brand_profile_versions set status='reviewed',reviewed_by='reviewer',reviewed_at=now(),effective_at=now() where id in (md5('bi-shared-v1')::uuid,md5('bi-private-v1')::uuid,md5('bi-shared-v2')::uuid);
select throws_ok($$update public.brand_profile_facts set notes='changed' where profile_id=md5('bi-shared-v1')::uuid$$,'23514',null,'review freezes facts');
update public.brand_profile_versions set status='published' where id in (md5('bi-shared-v1')::uuid,md5('bi-private-v1')::uuid,md5('bi-shared-v2')::uuid);
select is((select count(*) from public.brand_profile_versions where id in (md5('bi-shared-v1')::uuid,md5('bi-private-v1')::uuid,md5('bi-shared-v2')::uuid) and status='published'),2::bigint,'reviewed profiles published');
select throws_ok($$update public.brand_profile_versions set brand_name='Rewrite' where id=md5('bi-shared-v1')::uuid$$,'23514',null,'published metadata immutable');
select throws_ok($$update public.brand_profile_versions set status='draft' where id=md5('bi-shared-v1')::uuid$$,'23514',null,'published cannot return to draft');
select throws_ok($$delete from public.brand_profile_versions where id=md5('bi-shared-v1')::uuid$$,'23514',null,'published profile deletion denied');
select throws_ok($$update public.brand_profile_facts set notes='rewrite' where profile_id=md5('bi-shared-v1')::uuid$$,'23514',null,'published facts immutable');
select throws_ok($$delete from public.brand_fact_evidence where profile_id=md5('bi-shared-v1')::uuid$$,'23514',null,'published evidence associations immutable');
select throws_ok($$update public.brand_consultant_items set explanation='rewrite' where profile_id=md5('bi-shared-v1')::uuid$$,'23514',null,'published interpretation immutable');

insert into public.brand_profile_versions(id,brand_id,version_number,based_on_profile_id,brand_name,origin,created_by)
values(md5('bi-shared-v2')::uuid,md5('bi-shared')::uuid,2,md5('bi-shared-v1')::uuid,'Shared renamed','copy-v1','fixture');
insert into public.brand_profile_facts select md5('bi-shared-v2')::uuid,fact_key,value,knowledge_state,'not-reviewed',
 case when knowledge_state='unknown' then 'unknown' else 'unverified' end,confidence,approval,notes
 from public.brand_profile_facts where profile_id=md5('bi-shared-v1')::uuid;
select throws_ok($$update public.brand_profile_facts set profile_id=md5('bi-shared-v2')::uuid where profile_id=md5('bi-shared-v1')::uuid$$,'23514',null,'moving published content cannot bypass guard');
select is((select version_number from public.brand_profile_versions where brand_id=md5('bi-shared')::uuid and status='published' order by version_number desc limit 1),1,'draft does not replace published current');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub',md5('bi-user-1')::text,true);
select is((select count(*) from public.brand_identities where id in (md5('bi-shared')::uuid,md5('bi-private')::uuid)),2::bigint,'tenant A sees shared and provisioned brand');
select is((select count(*) from public.brand_profile_versions where brand_id in (md5('bi-shared')::uuid,md5('bi-private')::uuid)),2::bigint,'tenant reads published profiles only');
select is((select count(*) from public.brand_profile_facts where profile_id in (md5('bi-shared-v1')::uuid,md5('bi-private-v1')::uuid,md5('bi-shared-v2')::uuid)),100::bigint,'draft facts not exposed');
select is((select count(*) from public.brand_evidence where brand_id in (md5('bi-shared')::uuid,md5('bi-private')::uuid)),4::bigint,'only attached published sources exposed');
select is((select count(*) from public.organization_brands),1::bigint,'tenant sees own association');
select throws_ok($$insert into public.brand_identities(slug,name) values('tenant-created','Bad')$$,'42501',null,'tenant owner cannot create global brands');
select throws_ok($$update public.brand_profile_facts set notes='bad'$$,'42501',null,'read does not grant fact writes');
select throws_ok($$insert into public.organization_brands(organization_id,brand_id) values(md5('bi-org-2')::uuid,md5('bi-shared')::uuid)$$,'42501',null,'cross-tenant association insert denied');
select throws_ok($$update public.organization_brands set organization_id=md5('bi-org-2')::uuid$$,'42501',null,'cross-tenant reassignment denied');
select throws_ok($$delete from public.organization_brands$$,'42501',null,'tenant cannot alter platform grants');
select set_config('request.jwt.claim.sub',md5('bi-user-2')::text,true);
select is((select count(*) from public.brand_identities where id in (md5('bi-shared')::uuid,md5('bi-private')::uuid)),1::bigint,'tenant B sees shared catalog only');
select is((select count(*) from public.brand_profile_versions where brand_id in (md5('bi-shared')::uuid,md5('bi-private')::uuid)),1::bigint,'tenant B cannot read private profile');
select is((select count(*) from public.brand_profile_facts where profile_id in (md5('bi-shared-v1')::uuid,md5('bi-private-v1')::uuid,md5('bi-shared-v2')::uuid)),50::bigint,'private facts isolated');
select is((select count(*) from public.brand_evidence where brand_id in (md5('bi-shared')::uuid,md5('bi-private')::uuid)),3::bigint,'private sources isolated');
select is((select count(*) from public.organization_brands),0::bigint,'association data isolated');
select throws_ok($$update public.brand_profile_versions set status='draft' where brand_id=md5('bi-private')::uuid$$,'42501',null,'cross-tenant mutation denied');
select set_config('request.jwt.claim.sub',md5('bi-user-3')::text,true);
select is((select count(*) from public.brand_identities where id in (md5('bi-shared')::uuid,md5('bi-private')::uuid)),0::bigint,'suspended member gets no catalog');
select set_config('request.jwt.claim.sub',md5('bi-user-4')::text,true);
select is((select count(*) from public.brand_identities where id in (md5('bi-shared')::uuid,md5('bi-private')::uuid)),0::bigint,'authenticated nonmember gets no catalog');
select set_config('request.jwt.claims',jsonb_build_object('sub',md5('bi-user-1')::text,'is_anonymous',true)::text,true);
select is((select count(*) from public.brand_identities where id in (md5('bi-shared')::uuid,md5('bi-private')::uuid)),0::bigint,'anonymous auth identity denied even with membership');
select set_config('request.jwt.claims','{}',true);
reset role;
set local role anon;
select throws_ok('select count(*) from public.'||t,'42501',null,'anonymous denied: '||t)
from unnest(array['brand_identities','brand_profile_versions','brand_fact_definitions','brand_profile_facts','brand_evidence','brand_fact_evidence','brand_consultant_items','organization_brands']) t;
reset role;

select ok(not has_table_privilege('authenticated','public.'||t,'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'),'authenticated has no governance grants: '||t)
from unnest(array['brand_identities','brand_profile_versions','brand_fact_definitions','brand_profile_facts','brand_evidence','brand_fact_evidence','brand_consultant_items','organization_brands']) t;
select is((select count(*) from pg_class c cross join lateral aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a
 where c.relnamespace='public'::regnamespace and c.relname in ('brand_identities','brand_profile_versions','brand_fact_definitions','brand_profile_facts','brand_evidence','brand_fact_evidence','brand_consultant_items','organization_brands') and a.grantee=0),0::bigint,'no PUBLIC table grants');
select is((select count(*) from pg_proc p cross join lateral aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
 where p.pronamespace='private'::regnamespace and p.proname like 'brand_%' and a.grantee=0),0::bigint,'no PUBLIC function execution');
select ok((select bool_and(not prosecdef and proconfig @> array['search_path=""']) from pg_proc where pronamespace='private'::regnamespace and proname like 'brand_%'),'helpers use invoker and empty search paths');
select throws_ok($$update public.brand_fact_definitions set value_kind='boolean' where fact_key='category'$$,'23514',null,'registry cannot reinterpret historical facts');

set local role service_role;
update public.brand_profile_facts set review_state='reviewed' where profile_id=md5('bi-shared-v2')::uuid;
update public.brand_profile_versions set status='reviewed',reviewed_by='reviewer',reviewed_at=now(),effective_at=now() where id=md5('bi-shared-v2')::uuid;
update public.brand_profile_versions set status='published' where id=md5('bi-shared-v2')::uuid;
select is((select version_number from public.brand_profile_versions where brand_id=md5('bi-shared')::uuid and status='published' order by version_number desc limit 1),2,'new publication deterministically becomes current');
select is((select brand_name from public.brand_profile_versions where id=md5('bi-shared-v1')::uuid),'Shared','historical name remains unchanged');
select is((select count(*) from public.brand_profile_versions where brand_id=md5('bi-shared')::uuid and status='published'),2::bigint,'old publication retained');
select lives_ok($$update public.brand_identities set lifecycle='inactive' where id=md5('bi-shared')::uuid$$,'archive uses lifecycle');
select throws_ok($$delete from public.brand_identities where id=md5('bi-shared')::uuid$$,'23514',null,'archive cannot destroy history');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub',md5('bi-user-1')::text,true);
select is((select count(*) from public.brand_profile_versions where brand_id=md5('bi-shared')::uuid),2::bigint,'archived brand historical publications still queryable');
reset role;
select * from finish();
rollback;

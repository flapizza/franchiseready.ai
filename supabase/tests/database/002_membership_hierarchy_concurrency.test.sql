create extension if not exists pgtap with schema extensions;
create extension if not exists dblink with schema extensions;

select plan(5);

delete from public.membership_reporting_history
where organization_id = '30000000-0000-0000-0000-000000000003';
delete from public.organization_memberships
where organization_id = '30000000-0000-0000-0000-000000000003';
delete from public.organizations
where id = '30000000-0000-0000-0000-000000000003';
delete from auth.users
where id in (
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000302'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000301', 'authenticated', 'authenticated', 'concurrent-a@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000302', 'authenticated', 'authenticated', 'concurrent-b@example.test', '', now(), '{}', '{}', now(), now());

insert into public.organizations (id, public_id, name)
values ('30000000-0000-0000-0000-000000000003', 'org_concurrencytest1', 'Concurrency Test Organization');

insert into public.organization_memberships (id, organization_id, user_id, role, status) values
  ('33000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000301', 'manager', 'active'),
  ('33000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000302', 'manager', 'active');

select extensions.dblink_connect(
  'hierarchy_writer_a',
  'host=host.docker.internal port=54322 dbname=postgres user=postgres password=postgres'
);
select extensions.dblink_connect(
  'hierarchy_writer_b',
  'host=host.docker.internal port=54322 dbname=postgres user=postgres password=postgres'
);

select extensions.dblink_exec('hierarchy_writer_a', 'begin');
select extensions.dblink_exec(
  'hierarchy_writer_a',
  $$update public.organization_memberships
    set manager_membership_id = '33000000-0000-0000-0000-000000000002'
    where id = '33000000-0000-0000-0000-000000000001'$$
);

select is(
  extensions.dblink_send_query(
    'hierarchy_writer_b',
    $$update public.organization_memberships
      set manager_membership_id = '33000000-0000-0000-0000-000000000001'
      where id = '33000000-0000-0000-0000-000000000002'$$
  ),
  1,
  'a concurrent cycle-forming hierarchy write is dispatched'
);
select pg_sleep(0.25);
select is(
  extensions.dblink_is_busy('hierarchy_writer_b'),
  1,
  'the organization advisory lock serializes concurrent hierarchy writes'
);

select extensions.dblink_exec('hierarchy_writer_a', 'commit');
select throws_ok(
  $$select status
    from extensions.dblink_get_result('hierarchy_writer_b') as result(status text)$$,
  '23514',
  'Reporting hierarchy cycles are not allowed.',
  'the serialized second writer is rejected after observing the committed graph'
);

select is(
  (
    select count(*)
    from public.organization_memberships
    where organization_id = '30000000-0000-0000-0000-000000000003'
      and manager_membership_id is not null
  ),
  1::bigint,
  'only one manager edge commits, preserving an acyclic hierarchy'
);
select is(
  (
    select count(*)
    from public.membership_reporting_history
    where organization_id = '30000000-0000-0000-0000-000000000003'
  ),
  1::bigint,
  'only the committed manager change creates reporting history'
);

select extensions.dblink_disconnect('hierarchy_writer_a');
select extensions.dblink_disconnect('hierarchy_writer_b');

select * from finish();

delete from public.membership_reporting_history
where organization_id = '30000000-0000-0000-0000-000000000003';
delete from public.organization_memberships
where organization_id = '30000000-0000-0000-0000-000000000003';
delete from public.organizations
where id = '30000000-0000-0000-0000-000000000003';
delete from auth.users
where id in (
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000302'
);

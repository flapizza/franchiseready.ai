create type public.marketing_campaign_status as enum ('draft','ready','planned','sending','sent');
create type public.marketing_audience_source as enum ('segment','list');

create table public.contact_segments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  public_id text not null default ('seg_'||replace(gen_random_uuid()::text,'-','')) unique,
  name text not null check(length(btrim(name)) between 1 and 100), description text check(description is null or length(description)<=500),
  criteria_version integer not null default 1 check(criteria_version=1), criteria jsonb not null,
  created_by_membership_id uuid not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(id,organization_id), unique(organization_id,name),
  foreign key(created_by_membership_id,organization_id) references public.organization_memberships(id,organization_id) on delete restrict
);
create table public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  public_id text not null default ('camp_'||replace(gen_random_uuid()::text,'-','')) unique,
  name text not null check(length(btrim(name)) between 1 and 120), description text check(description is null or length(description)<=1000),
  subject text not null default '' check(length(subject)<=180), preview_text text not null default '' check(length(preview_text)<=220),
  sender_name text not null default '' check(length(sender_name)<=120), reply_to text not null default '' check(length(reply_to)<=320),
  audience_type public.marketing_audience_source, audience_public_id text,
  content_version integer not null default 1 check(content_version=1), content jsonb not null default '{"version":1,"heading":"","body":"","ctaLabel":"","ctaUrl":"","footer":""}'::jsonb,
  status public.marketing_campaign_status not null default 'draft', created_by_membership_id uuid not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(id,organization_id), foreign key(created_by_membership_id,organization_id) references public.organization_memberships(id,organization_id) on delete restrict,
  check(status not in ('sending','sent'))
);
create index contact_segments_org_updated_idx on public.contact_segments(organization_id,updated_at desc);
create index marketing_campaigns_org_updated_idx on public.marketing_campaigns(organization_id,updated_at desc);
create index contacts_source_idx on public.contacts(organization_id,source,updated_at desc) where archived_at is null;
create index contacts_state_idx on public.contacts(organization_id,state_province,updated_at desc) where archived_at is null;
create trigger contact_segments_set_updated_at before update on public.contact_segments for each row execute function public.set_updated_at();
create trigger marketing_campaigns_set_updated_at before update on public.marketing_campaigns for each row execute function public.set_updated_at();

create function public.valid_segment_criteria(input jsonb) returns boolean language sql immutable set search_path='' as $$
select jsonb_typeof(input)='object' and input->>'version'='1' and input->>'combinator' in ('and','or')
 and jsonb_typeof(input->'rules')='array' and jsonb_array_length(input->'rules') between 1 and 20
 and not exists(select 1 from jsonb_array_elements(input->'rules') r where
   r->>'field' not in ('lifecycle','tag','list','emailStatus','smsStatus','candidate','assignee','source','state') or
   r->>'operator' not in ('is','isNot','isAnyOf','has','doesNotHave') or
   jsonb_typeof(r->'value') not in ('string','array'));
$$;
alter table public.contact_segments add constraint contact_segments_criteria_valid check(public.valid_segment_criteria(criteria));

create schema if not exists private; revoke all on schema private from public,anon; grant usage on schema private to authenticated;
create function private.segment_rule_matches(contact_id uuid, rule jsonb) returns boolean language sql stable security invoker set search_path='' as $$
select case rule->>'field'
 when 'lifecycle' then case rule->>'operator' when 'isNot' then c.lifecycle_status::text <> rule->>'value' when 'isAnyOf' then c.lifecycle_status::text in(select jsonb_array_elements_text(rule->'value')) else c.lifecycle_status::text=rule->>'value' end
 when 'emailStatus' then case when rule->>'operator'='isNot' then c.marketing_email_status::text<>rule->>'value' else c.marketing_email_status::text=rule->>'value' end
 when 'smsStatus' then case when rule->>'operator'='isNot' then c.marketing_sms_status::text<>rule->>'value' else c.marketing_sms_status::text=rule->>'value' end
 when 'candidate' then (exists(select 1 from public.candidates x where x.contact_id=c.id))=(rule->>'value'='candidate')
 when 'assignee' then case when rule->>'operator'='isNot' then c.assigned_membership_id::text<>rule->>'value' else c.assigned_membership_id::text=rule->>'value' end
 when 'source' then case rule->>'operator' when 'isNot' then c.source<>rule->>'value' when 'isAnyOf' then c.source in(select jsonb_array_elements_text(rule->'value')) else c.source=rule->>'value' end
 when 'state' then case rule->>'operator' when 'isNot' then coalesce(c.state_province,'')<>rule->>'value' when 'isAnyOf' then coalesce(c.state_province,'') in(select jsonb_array_elements_text(rule->'value')) else coalesce(c.state_province,'')=rule->>'value' end
 when 'tag' then exists(select 1 from public.contact_tag_memberships m join public.contact_tags t on t.id=m.tag_id where m.contact_id=c.id and t.public_id=rule->>'value')=(rule->>'operator'<>'doesNotHave')
 when 'list' then exists(select 1 from public.contact_list_memberships m join public.contact_lists l on l.id=m.list_id where m.contact_id=c.id and l.public_id=rule->>'value')=(rule->>'operator'<>'doesNotHave')
 else false end from public.contacts c where c.id=contact_id;
$$;

create function public.resolve_segment(target_criteria jsonb, page_limit integer default 25, page_offset integer default 0)
returns table(contact_public_id text,display_name text,primary_email text,email_status text,total_count bigint) language sql stable security invoker set search_path='' as $$
 with matched as(select c.*,case when target_criteria->>'combinator'='and' then bool_and(private.segment_rule_matches(c.id,r)) else bool_or(private.segment_rule_matches(c.id,r)) end ok
 from public.contacts c cross join lateral jsonb_array_elements(target_criteria->'rules') r where c.archived_at is null and public.can_view_membership(c.assigned_membership_id) group by c.id)
 select public_id,btrim(first_name||' '||last_name),primary_email,marketing_email_status::text,count(*) over() from matched where ok order by updated_at desc,id desc limit least(greatest(page_limit,1),50) offset greatest(page_offset,0);
$$;

create function public.resolve_campaign_audience(source_kind public.marketing_audience_source, source_id text, page_limit integer default 25, page_offset integer default 0)
returns table(contact_public_id text,display_name text,primary_email text,email_status text,matching_count bigint,eligible_count bigint,unknown_count bigint,opted_out_count bigint,suppressed_count bigint,missing_email_count bigint) language sql stable security invoker set search_path='' as $$
 with base as(select c.* from public.contacts c where c.archived_at is null and public.can_view_membership(c.assigned_membership_id) and (
 (source_kind='list' and exists(select 1 from public.contact_list_memberships m join public.contact_lists l on l.id=m.list_id where m.contact_id=c.id and l.public_id=source_id)) or
 (source_kind='segment' and exists(select 1 from public.contact_segments s where s.public_id=source_id and s.organization_id=c.organization_id and public.valid_segment_criteria(s.criteria) and (select case when s.criteria->>'combinator'='and' then bool_and(private.segment_rule_matches(c.id,r)) else bool_or(private.segment_rule_matches(c.id,r)) end from jsonb_array_elements(s.criteria->'rules') r))))
 ), counted as(select *,count(*) over() matching,sum((primary_email is not null and marketing_email_status='opted-in')::int) over() eligible,sum((marketing_email_status='unknown')::int) over() unknown,sum((marketing_email_status='opted-out')::int) over() opted_out,sum((marketing_email_status='suppressed')::int) over() suppressed,sum((primary_email is null)::int) over() missing from base)
 select public_id,btrim(first_name||' '||last_name),primary_email,marketing_email_status::text,matching,eligible,unknown,opted_out,suppressed,missing from counted order by updated_at desc,id desc limit least(greatest(page_limit,1),50) offset greatest(page_offset,0);
$$;

alter table public.contact_segments enable row level security; alter table public.marketing_campaigns enable row level security;
create policy contact_segments_select on public.contact_segments for select to authenticated using(public.current_active_membership_id(organization_id) is not null);
create policy contact_segments_insert on public.contact_segments for insert to authenticated with check(created_by_membership_id=public.current_active_membership_id(organization_id));
create policy contact_segments_update on public.contact_segments for update to authenticated using(public.current_active_membership_id(organization_id) is not null) with check(created_by_membership_id=public.current_active_membership_id(organization_id));
create policy marketing_campaigns_select on public.marketing_campaigns for select to authenticated using(public.current_active_membership_id(organization_id) is not null);
create policy marketing_campaigns_insert on public.marketing_campaigns for insert to authenticated with check(created_by_membership_id=public.current_active_membership_id(organization_id));
create policy marketing_campaigns_update on public.marketing_campaigns for update to authenticated using(public.current_active_membership_id(organization_id) is not null) with check(created_by_membership_id=public.current_active_membership_id(organization_id));
revoke all on public.contact_segments,public.marketing_campaigns from anon; grant select,insert,update on public.contact_segments,public.marketing_campaigns to authenticated;
revoke all on function public.valid_segment_criteria(jsonb),private.segment_rule_matches(uuid,jsonb),public.resolve_segment(jsonb,integer,integer),public.resolve_campaign_audience(public.marketing_audience_source,text,integer,integer) from public,anon;
grant execute on function private.segment_rule_matches(uuid,jsonb) to authenticated;
grant execute on function public.valid_segment_criteria(jsonb) to authenticated;
grant execute on function public.resolve_segment(jsonb,integer,integer),public.resolve_campaign_audience(public.marketing_audience_source,text,integer,integer) to authenticated;

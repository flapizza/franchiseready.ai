create type public.marketing_send_status as enum ('queued','sending','completed','partially-failed','failed');
create type public.marketing_recipient_status as enum ('pending','processing','accepted','delivered','bounced','failed','suppressed');
create type public.marketing_delivery_event_type as enum ('accepted','delivered','soft-bounce','hard-bounce','rejected','complaint','provider-failure','unsubscribed');

alter table public.marketing_campaigns drop constraint if exists marketing_campaigns_status_check;

create table public.marketing_send_runs (
 id uuid primary key default gen_random_uuid(), public_id text not null default ('send_'||replace(gen_random_uuid()::text,'-','')) unique,
 organization_id uuid not null references public.organizations(id) on delete restrict, campaign_id uuid not null,
 initiated_by_membership_id uuid not null, idempotency_key text not null check(length(idempotency_key) between 16 and 255),
 campaign_version timestamptz not null, campaign_name text not null, subject text not null, preview_text text not null,
 sender_name text not null, reply_to text not null, content_version integer not null, content jsonb not null,
 audience_type public.marketing_audience_source not null, audience_public_id text not null,
 status public.marketing_send_status not null default 'queued', simulated boolean not null,
 matching_count integer not null, eligible_count integer not null, unknown_count integer not null,
 opted_out_count integer not null, suppressed_count integer not null, missing_email_count integer not null, duplicate_count integer not null,
 started_at timestamptz, completed_at timestamptz, created_at timestamptz not null default now(),
 unique(organization_id,idempotency_key), unique(id,organization_id),
 foreign key(campaign_id,organization_id) references public.marketing_campaigns(id,organization_id) on delete restrict,
 foreign key(initiated_by_membership_id,organization_id) references public.organization_memberships(id,organization_id) on delete restrict
);
create table public.marketing_send_recipients (
 id uuid primary key default gen_random_uuid(), public_id text not null default ('rcpt_'||replace(gen_random_uuid()::text,'-','')) unique,
 organization_id uuid not null, send_run_id uuid not null, contact_id uuid not null,
 normalized_email text not null, display_name text not null, personalization jsonb not null default '{}'::jsonb,
 eligible_at_snapshot boolean not null, eligibility_reason text not null, status public.marketing_recipient_status not null default 'pending',
 claim_token uuid, claimed_at timestamptz, provider_message_id text, last_error_code text,
 accepted_at timestamptz, delivered_at timestamptz, completed_at timestamptz, created_at timestamptz not null default now(),
 unique(send_run_id,normalized_email), unique(id,organization_id),
 foreign key(send_run_id,organization_id) references public.marketing_send_runs(id,organization_id) on delete restrict,
 foreign key(contact_id,organization_id) references public.contacts(id,organization_id) on delete restrict
);
create table public.marketing_delivery_events (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, recipient_id uuid not null,
 provider text not null, provider_event_id text not null, provider_message_id text,
 event_type public.marketing_delivery_event_type not null, occurred_at timestamptz not null, metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), unique(provider,provider_event_id),
 foreign key(recipient_id,organization_id) references public.marketing_send_recipients(id,organization_id) on delete restrict
);
create table public.marketing_unsubscribe_tokens (
 token_hash text primary key, organization_id uuid not null, contact_id uuid not null, recipient_id uuid,
 created_at timestamptz not null default now(), used_at timestamptz,
 foreign key(contact_id,organization_id) references public.contacts(id,organization_id) on delete restrict,
 foreign key(recipient_id,organization_id) references public.marketing_send_recipients(id,organization_id) on delete restrict
);
create index marketing_recipients_claim_idx on public.marketing_send_recipients(send_run_id,status,created_at) where status='pending';
create index marketing_recipients_contact_idx on public.marketing_send_recipients(organization_id,contact_id,created_at desc);
create index marketing_events_recipient_idx on public.marketing_delivery_events(recipient_id,occurred_at desc);

create function private.campaign_audience_contacts(source_kind public.marketing_audience_source,source_id text,target_org uuid)
returns setof public.contacts language sql stable security invoker set search_path='' as $$
 select c.* from public.contacts c where c.organization_id=target_org and c.archived_at is null and (
  (source_kind='list' and exists(select 1 from public.contact_list_memberships m join public.contact_lists l on l.id=m.list_id where m.contact_id=c.id and l.organization_id=target_org and l.public_id=source_id)) or
  (source_kind='segment' and exists(select 1 from public.contact_segments s where s.organization_id=target_org and s.public_id=source_id and public.valid_segment_criteria(s.criteria) and
   (select case when s.criteria->>'combinator'='and' then bool_and(private.segment_rule_matches(c.id,r)) else bool_or(private.segment_rule_matches(c.id,r)) end from jsonb_array_elements(s.criteria->'rules') r))))
$$;

alter table public.marketing_send_runs enable row level security; alter table public.marketing_send_recipients enable row level security;
alter table public.marketing_delivery_events enable row level security; alter table public.marketing_unsubscribe_tokens enable row level security;
create policy marketing_send_runs_select on public.marketing_send_runs for select to authenticated using(public.current_active_membership_id(organization_id) is not null);
create policy marketing_send_recipients_select on public.marketing_send_recipients for select to authenticated using(public.current_active_membership_id(organization_id) is not null);
create policy marketing_delivery_events_select on public.marketing_delivery_events for select to authenticated using(public.current_active_membership_id(organization_id) is not null);
revoke all on public.marketing_send_runs,public.marketing_send_recipients,public.marketing_delivery_events,public.marketing_unsubscribe_tokens from anon,authenticated;
grant select on public.marketing_send_runs,public.marketing_send_recipients,public.marketing_delivery_events to authenticated;

create function public.confirm_campaign_send(target_campaign_public_id text, request_key text, is_simulated boolean)
returns public.marketing_send_runs language plpgsql security definer set search_path='' as $$
declare c public.marketing_campaigns; run public.marketing_send_runs; counts record; membership uuid;
begin
 select * into c from public.marketing_campaigns where public_id=target_campaign_public_id for update;
 membership:=public.current_active_membership_id(c.organization_id);
 if c.id is null or membership is null then raise exception using errcode='42501',message='Campaign is unavailable.'; end if;
 select * into run from public.marketing_send_runs where organization_id=c.organization_id and idempotency_key=request_key;
 if run.id is not null then return run; end if;
 if c.status<>'ready' or c.audience_type is null or c.audience_public_id is null or btrim(c.subject)='' or btrim(c.sender_name)='' then raise exception using errcode='22023',message='Campaign is not ready to send.'; end if;
 with audience as(select * from private.campaign_audience_contacts(c.audience_type,c.audience_public_id,c.organization_id))
 select count(*)::int matching,count(*) filter(where primary_email is not null and marketing_email_status='opted-in')::int eligible,
 count(*) filter(where marketing_email_status='unknown')::int unknown,count(*) filter(where marketing_email_status='opted-out')::int opted_out,
 count(*) filter(where marketing_email_status='suppressed')::int suppressed,count(*) filter(where primary_email is null)::int missing,
 (count(*) filter(where primary_email is not null and marketing_email_status='opted-in')-count(distinct lower(btrim(primary_email))) filter(where primary_email is not null and marketing_email_status='opted-in'))::int duplicates into counts from audience;
 insert into public.marketing_send_runs(organization_id,campaign_id,initiated_by_membership_id,idempotency_key,campaign_version,campaign_name,subject,preview_text,sender_name,reply_to,content_version,content,audience_type,audience_public_id,simulated,matching_count,eligible_count,unknown_count,opted_out_count,suppressed_count,missing_email_count,duplicate_count)
 values(c.organization_id,c.id,membership,request_key,c.updated_at,c.name,c.subject,c.preview_text,c.sender_name,c.reply_to,c.content_version,c.content,c.audience_type,c.audience_public_id,is_simulated,counts.matching,counts.eligible-counts.duplicates,counts.unknown,counts.opted_out,counts.suppressed,counts.missing,counts.duplicates) returning * into run;
 insert into public.marketing_send_recipients(organization_id,send_run_id,contact_id,normalized_email,display_name,personalization,eligible_at_snapshot,eligibility_reason)
 select c.organization_id,run.id,ct.id,lower(btrim(ct.primary_email)),btrim(ct.first_name||' '||ct.last_name),jsonb_build_object('firstName',ct.first_name,'lastName',ct.last_name,'displayName',btrim(ct.first_name||' '||ct.last_name)),true,'eligible'
 from private.campaign_audience_contacts(c.audience_type,c.audience_public_id,c.organization_id) ct
 where ct.primary_email is not null and ct.marketing_email_status='opted-in' on conflict(send_run_id,normalized_email) do nothing;
 update public.marketing_campaigns set status='sending' where id=c.id; return run;
end $$;

create function public.claim_campaign_recipients(target_send_public_id text,batch_size integer,claim_id uuid)
returns setof public.marketing_send_recipients language plpgsql security definer set search_path='' as $$
declare run public.marketing_send_runs;
begin
 select * into run from public.marketing_send_runs where public_id=target_send_public_id;
 if run.id is null or public.current_active_membership_id(run.organization_id) is null then raise exception using errcode='42501',message='Send run is unavailable.'; end if;
 update public.marketing_send_runs set status='sending',started_at=coalesce(started_at,now()) where id=run.id and status='queued';
 return query with claimed as(select r.id from public.marketing_send_recipients r where r.send_run_id=run.id and r.status='pending' order by r.created_at,r.id for update skip locked limit least(greatest(batch_size,1),100))
 update public.marketing_send_recipients r set status=case when c.marketing_email_status='opted-in' then 'processing'::public.marketing_recipient_status else 'suppressed'::public.marketing_recipient_status end,
 eligibility_reason=case when c.marketing_email_status='opted-in' then r.eligibility_reason else 'consent-changed-before-delivery' end,claim_token=claim_id,claimed_at=now(),completed_at=case when c.marketing_email_status='opted-in' then null else now() end
 from claimed x,public.contacts c where r.id=x.id and c.id=r.contact_id returning r.*;
end $$;

create function public.complete_campaign_recipient(target_recipient_public_id text,target_claim uuid,result_status public.marketing_recipient_status,target_provider_message_id text,error_code text)
returns void language plpgsql security definer set search_path='' as $$
declare r public.marketing_send_recipients;
begin select * into r from public.marketing_send_recipients where public_id=target_recipient_public_id for update;
 if r.id is null or public.current_active_membership_id(r.organization_id) is null or r.status<>'processing' or r.claim_token<>target_claim then raise exception using errcode='42501',message='Recipient claim is unavailable.'; end if;
 if result_status not in ('accepted','failed','suppressed') then raise exception using errcode='22023',message='Invalid delivery result.'; end if;
 update public.marketing_send_recipients set status=result_status,provider_message_id=target_provider_message_id,last_error_code=left(error_code,100),accepted_at=case when result_status='accepted' then now() end,completed_at=now() where id=r.id;
end $$;

create function public.record_marketing_delivery_event(target_recipient_public_id text,event_provider text,event_id text,message_id text,target_type public.marketing_delivery_event_type,event_time timestamptz,event_metadata jsonb default '{}'::jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
declare r public.marketing_send_recipients; inserted boolean;
begin select * into r from public.marketing_send_recipients where public_id=target_recipient_public_id;
 if r.id is null or public.current_active_membership_id(r.organization_id) is null then raise exception using errcode='42501',message='Recipient is unavailable.'; end if;
 insert into public.marketing_delivery_events(organization_id,recipient_id,provider,provider_event_id,provider_message_id,event_type,occurred_at,metadata)
 values(r.organization_id,r.id,left(event_provider,50),left(event_id,255),left(message_id,255),target_type,event_time,coalesce(event_metadata,'{}')) on conflict(provider,provider_event_id) do nothing;
 get diagnostics inserted=row_count; if not inserted then return false; end if;
 update public.marketing_send_recipients set status=case target_type when 'delivered' then 'delivered'::public.marketing_recipient_status when 'hard-bounce' then 'bounced'::public.marketing_recipient_status when 'rejected' then 'failed'::public.marketing_recipient_status when 'provider-failure' then 'failed'::public.marketing_recipient_status else status end,delivered_at=case when target_type='delivered' then event_time else delivered_at end where id=r.id;
 if target_type in ('hard-bounce','complaint') then update public.contacts set marketing_email_status='suppressed' where id=r.contact_id; end if; return true;
end $$;

create function public.unsubscribe_marketing(token_digest text) returns boolean language plpgsql security definer set search_path='' as $$
declare t public.marketing_unsubscribe_tokens;
begin select * into t from public.marketing_unsubscribe_tokens where token_hash=token_digest for update; if t.token_hash is null then return false; end if;
 update public.marketing_unsubscribe_tokens set used_at=coalesce(used_at,now()) where token_hash=token_digest;
 update public.contacts set marketing_email_status='opted-out' where id=t.contact_id and marketing_email_status<>'suppressed';
 if t.recipient_id is not null then insert into public.marketing_delivery_events(organization_id,recipient_id,provider,provider_event_id,event_type,occurred_at) values(t.organization_id,t.recipient_id,'frangroove','unsubscribe:'||token_digest,'unsubscribed',now()) on conflict do nothing; end if; return true;
end $$;

create function public.register_marketing_unsubscribe_token(target_recipient_public_id text,token_digest text) returns void language plpgsql security definer set search_path='' as $$
declare r public.marketing_send_recipients;
begin select * into r from public.marketing_send_recipients where public_id=target_recipient_public_id;
 if r.id is null or public.current_active_membership_id(r.organization_id) is null then raise exception using errcode='42501',message='Recipient is unavailable.'; end if;
 insert into public.marketing_unsubscribe_tokens(token_hash,organization_id,contact_id,recipient_id) values(token_digest,r.organization_id,r.contact_id,r.id) on conflict(token_hash) do nothing;
end $$;

create function public.finish_campaign_send(target_send_public_id text) returns public.marketing_send_runs language plpgsql security definer set search_path='' as $$
declare run public.marketing_send_runs; pending_count integer; failed_count integer;
begin select * into run from public.marketing_send_runs where public_id=target_send_public_id for update;
 if run.id is null or public.current_active_membership_id(run.organization_id) is null then raise exception using errcode='42501',message='Send run is unavailable.'; end if;
 select count(*) filter(where status in ('pending','processing')),count(*) filter(where status in ('failed','bounced')) into pending_count,failed_count from public.marketing_send_recipients where send_run_id=run.id;
 if pending_count=0 then update public.marketing_send_runs set status=case when failed_count=0 then 'completed'::public.marketing_send_status when failed_count<eligible_count then 'partially-failed'::public.marketing_send_status else 'failed'::public.marketing_send_status end,completed_at=now() where id=run.id returning * into run;
  update public.marketing_campaigns set status=case when failed_count=0 then 'sent'::public.marketing_campaign_status else 'sending'::public.marketing_campaign_status end where id=run.campaign_id;
 end if; return run;
end $$;

revoke all on function public.confirm_campaign_send(text,text,boolean),public.claim_campaign_recipients(text,integer,uuid),public.complete_campaign_recipient(text,uuid,public.marketing_recipient_status,text,text),public.record_marketing_delivery_event(text,text,text,text,public.marketing_delivery_event_type,timestamptz,jsonb),public.unsubscribe_marketing(text),public.register_marketing_unsubscribe_token(text,text),public.finish_campaign_send(text) from public,anon;
grant execute on function public.confirm_campaign_send(text,text,boolean),public.claim_campaign_recipients(text,integer,uuid),public.complete_campaign_recipient(text,uuid,public.marketing_recipient_status,text,text),public.record_marketing_delivery_event(text,text,text,text,public.marketing_delivery_event_type,timestamptz,jsonb),public.register_marketing_unsubscribe_token(text,text),public.finish_campaign_send(text) to authenticated;
grant execute on function public.unsubscribe_marketing(text) to anon,authenticated;

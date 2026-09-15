-- Additive V2 delivery. Historical V1 rows and artifacts are not rewritten.
alter table public.marketing_campaigns drop constraint marketing_campaigns_v2_valid;
alter table public.marketing_campaigns add constraint marketing_campaigns_v2_valid check(content_version<>2 or (content->>'version'='2' and private.valid_studio_document(content) and status in ('draft','sending','sent')));
alter table public.marketing_send_runs add column studio_snapshot jsonb;
-- The existing background worker reads its run and recipients with a server
-- client. Keep these two read grants explicit for clean local migration replays.
grant select on public.marketing_send_runs,public.marketing_send_recipients to service_role;

create table private.studio_send_stages (
 id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.marketing_campaigns(id),
 organization_id uuid not null, membership_id uuid not null, user_id uuid not null,
 campaign_version timestamptz not null, source jsonb not null, created_at timestamptz not null default now()
);
create table private.studio_recipient_payloads (
 recipient_id uuid primary key references public.marketing_send_recipients(id), organization_id uuid not null,
 payload jsonb not null, checksum text not null, created_at timestamptz not null default now()
);
create table public.studio_test_sends (
 id uuid primary key default gen_random_uuid(), public_id text not null unique default ('test_'||replace(gen_random_uuid()::text,'-','')),
 organization_id uuid not null, campaign_id uuid not null, membership_id uuid not null, stage_id uuid not null references private.studio_send_stages(id),
 request_key text not null check(length(request_key) between 16 and 255),status text not null default 'prepared' check(status in ('prepared','processing','accepted','failed')),
 provider_message_id text, error_code text, created_at timestamptz not null default now(), completed_at timestamptz,
 unique(organization_id,request_key),foreign key(campaign_id,organization_id) references public.marketing_campaigns(id,organization_id),
 foreign key(membership_id,organization_id) references public.organization_memberships(id,organization_id)
);
create table private.studio_test_payloads (
 test_id uuid primary key references public.studio_test_sends(id),payload jsonb not null,checksum text not null,
 token_hash text not null unique,unsubscribe_used_at timestamptz,created_at timestamptz not null default now()
);
create table private.studio_test_events (
 provider_event_id text primary key, test_id uuid not null references public.studio_test_sends(id),
 provider_message_id text not null, event_type public.marketing_delivery_event_type not null,
 occurred_at timestamptz not null, created_at timestamptz not null default now()
);
-- A verified webhook may beat the provider's HTTP response. Retain it until
-- the worker persists the message ID, rather than acknowledging and losing it.
create table private.studio_pending_provider_events (
 provider_event_id text primary key, provider_message_id text not null,
 event_type public.marketing_delivery_event_type not null, occurred_at timestamptz not null,
 metadata jsonb not null, created_at timestamptz not null default now()
);
alter table private.studio_pending_provider_events enable row level security;
revoke all on private.studio_pending_provider_events from public,anon,authenticated;
create index studio_pending_message_idx on private.studio_pending_provider_events(provider_message_id);
alter table private.studio_test_events enable row level security;
revoke all on private.studio_test_events from public,anon,authenticated;
create index studio_test_events_test_idx on private.studio_test_events(test_id);
create unique index studio_test_provider_id_idx on public.studio_test_sends(provider_message_id) where provider_message_id is not null;
alter table private.studio_send_stages enable row level security;
alter table private.studio_recipient_payloads enable row level security;
alter table private.studio_test_payloads enable row level security;
alter table public.studio_test_sends enable row level security;
revoke all on private.studio_send_stages,private.studio_recipient_payloads,private.studio_test_payloads,public.studio_test_sends from public,anon,authenticated;
grant select on public.studio_test_sends to authenticated;
create policy studio_test_sends_read on public.studio_test_sends for select to authenticated using(public.current_active_membership_id(organization_id) is not null);

create function private.studio_immutable() returns trigger language plpgsql set search_path='' as $$
begin raise exception using errcode='42501',message='Confirmed delivery artifacts are immutable.';end $$;
create trigger studio_stages_immutable before update or delete on private.studio_send_stages for each row execute function private.studio_immutable();
create trigger studio_test_events_immutable before update or delete on private.studio_test_events for each row execute function private.studio_immutable();
create trigger studio_payloads_immutable before update or delete on private.studio_recipient_payloads for each row execute function private.studio_immutable();
create function private.studio_test_payload_guard() returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='DELETE' or (to_jsonb(new)-'unsubscribe_used_at') is distinct from (to_jsonb(old)-'unsubscribe_used_at') then raise exception using errcode='42501',message='Test payloads are immutable.';end if;
 return new;
end $$;
create trigger studio_test_payload_guard before update or delete on private.studio_test_payloads for each row execute function private.studio_test_payload_guard();
create function private.studio_run_guard() returns trigger language plpgsql set search_path='' as $$
begin
 if old.content_version=2 and (tg_op='DELETE' or (to_jsonb(new)-'status'-'started_at'-'completed_at') is distinct from (to_jsonb(old)-'status'-'started_at'-'completed_at')) then raise exception using errcode='42501',message='Confirmed V2 sends are immutable.';end if;
 if tg_op='DELETE' then return old;end if;
 return new;
end $$;
create trigger studio_run_guard before update or delete on public.marketing_send_runs for each row execute function private.studio_run_guard();
create function private.studio_recipient_guard() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.marketing_send_runs where id=old.send_run_id and content_version=2) and (tg_op='DELETE' or
 (to_jsonb(new)-'status'-'claim_token'-'claimed_at'-'provider_message_id'-'last_error_code'-'accepted_at'-'delivered_at'-'completed_at'-'eligibility_reason') is distinct from
 (to_jsonb(old)-'status'-'claim_token'-'claimed_at'-'provider_message_id'-'last_error_code'-'accepted_at'-'delivered_at'-'completed_at'-'eligibility_reason')) then raise exception using errcode='42501',message='Recipient snapshots are immutable.';end if;
 if tg_op='DELETE' then return old;end if;
 return new;
end $$;
create trigger studio_recipient_guard before update or delete on public.marketing_send_recipients for each row execute function private.studio_recipient_guard();

-- This is the same membership-filtered source used by audience preview and V1.
create function private.studio_audience_state(c public.marketing_campaigns) returns jsonb language sql stable security invoker set search_path='' as $$
 with audience as(select * from private.campaign_audience_contacts(c.audience_type,c.audience_public_id,c.organization_id))
 select jsonb_build_object('matching',count(*),'eligible',count(distinct lower(btrim(primary_email))) filter(where primary_email is not null and marketing_email_status='opted-in'),
 'unknown',count(*) filter(where marketing_email_status='unknown'),'optedOut',count(*) filter(where marketing_email_status='opted-out'),
 'suppressed',count(*) filter(where marketing_email_status='suppressed'),'missingEmail',count(*) filter(where primary_email is null),
 'duplicates',count(*) filter(where primary_email is not null and marketing_email_status='opted-in')-count(distinct lower(btrim(primary_email))) filter(where primary_email is not null and marketing_email_status='opted-in'),
 'fingerprint',encode(extensions.digest(coalesce(jsonb_agg(jsonb_build_array(id,primary_email,first_name,preferred_name,last_name,marketing_email_status,assigned_membership_id) order by id)::text,'[]'),'sha256'),'hex'),
 'recipients',coalesce(jsonb_agg(jsonb_build_object('id',id,'primary_email',primary_email,'first_name',first_name,'preferred_name',preferred_name,'last_name',last_name,'marketing_email_status',marketing_email_status) order by id),'[]'::jsonb)) from audience
$$;
create function public.review_studio_campaign(target_campaign text) returns jsonb language plpgsql security definer set search_path='' as $$
declare c public.marketing_campaigns;
begin
 select * into c from public.marketing_campaigns where public_id=target_campaign;
 if c.id is null or public.current_active_membership_id(c.organization_id) is null then raise exception using errcode='42501',message='Campaign unavailable.';end if;
 if c.content_version<>2 or c.status not in ('draft','ready') then raise exception 'A V2 draft is required.';end if;
 return (private.studio_audience_state(c)-'recipients')||jsonb_build_object('revision',c.updated_at);
end $$;

-- Only the trusted application can stage rendering origins and a validated source.
create function public.stage_studio_campaign(target_campaign text,actor_membership uuid,expected_revision timestamptz,audience_fingerprint text,public_origin text,media_origin text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare c public.marketing_campaigns;m public.organization_memberships;stage private.studio_send_stages;asset_id text;assets jsonb:='{}';a public.studio_media_assets;snapshot jsonb;
begin
 select * into c from public.marketing_campaigns where public_id=target_campaign for share;
 select * into m from public.organization_memberships where id=actor_membership and organization_id=c.organization_id and status='active';
 if c.id is null or m.id is null or not exists(select 1 from public.organizations where id=c.organization_id and status='active') then raise exception using errcode='42501',message='Campaign unavailable.';end if;
 if c.updated_at<>expected_revision then raise exception using errcode='40001',message='Campaign changed. Review it again.';end if;
 if c.content_version<>2 or c.status not in ('draft','ready') or not private.valid_studio_document(c.content) or btrim(c.subject)='' or btrim(c.sender_name)='' or c.reply_to !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or
 c.branding_snapshot is null or btrim(c.branding_snapshot->>'name')='' or btrim(c.branding_snapshot->>'company')='' or length(btrim(c.branding_snapshot->>'postalAddress'))<10 or c.branding_snapshot->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Complete the V2 document, sender identity and company postal address.';end if;
 if btrim(c.sender_name) is distinct from btrim(c.branding_snapshot->>'name') or lower(btrim(c.reply_to)) is distinct from lower(btrim(c.branding_snapshot->>'email')) then raise exception 'Use the sender identity from the saved campaign branding.';end if;
 if public_origin !~ '^https://[^/?#[:space:]]+$' or media_origin !~ '^https://[^/?#[:space:]]+$' or audience_fingerprint !~ '^[a-f0-9]{64}$' then raise exception 'Invalid rendering configuration.';end if;
 if exists(select 1 from jsonb_path_query(c.content,'$.document.content.** ? (@.type == "emailImage")') x where x->'attrs'->>'assetId' is null) then raise exception 'Replace image placeholders before delivery.';end if;
 for asset_id in select jsonb_path_query(c.content,'$.document.content.**.assetId') #>> '{}' union select c.branding_snapshot->>'logo' union select c.branding_snapshot->>'headshot' loop
 if asset_id is not null then
 select * into a from public.studio_media_assets where public_id=asset_id and organization_id=c.organization_id and status='ready';
 if a.public_id is null then raise exception using errcode='42501',message='An image is unavailable for publication.';end if;
 assets:=assets||jsonb_build_object(asset_id,jsonb_build_object('deliveryPath',a.delivery_path,'checksum',a.checksum,'width',a.width,'height',a.height,'version',a.version));
 end if;end loop;
 snapshot:=jsonb_build_object('version',1,'rendererVersion','studio-001c-1','personalizationVersion',1,'branding',c.branding_snapshot,'assets',assets,'mediaOrigin',media_origin,'publicOrigin',public_origin,'audienceFingerprint',audience_fingerprint);
 insert into private.studio_send_stages(campaign_id,organization_id,membership_id,user_id,campaign_version,source)
 values(c.id,c.organization_id,m.id,m.user_id,c.updated_at,jsonb_build_object('content',c.content,'subject',c.subject,'preview_text',c.preview_text,'sender_name',c.sender_name,'reply_to',c.reply_to,'studio_snapshot',snapshot)) returning * into stage;
 return jsonb_build_object('stageId',stage.id,'source',stage.source);
end $$;

-- Retain the exact V1 implementation behind its existing public entry point.
alter function public.confirm_campaign_send(text,text,boolean) rename to confirm_v1_campaign_send_001c;
revoke all on function public.confirm_v1_campaign_send_001c(text,text,boolean) from public,anon,authenticated,service_role;
create function public.confirm_campaign_send(target_campaign_public_id text,request_key text,is_simulated boolean) returns public.marketing_send_runs language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.marketing_campaigns where public_id=target_campaign_public_id and content_version=1 and public.current_active_membership_id(organization_id) is not null) then raise exception using errcode='42501',message='Use the governed V2 confirmation flow.';end if;
 return public.confirm_v1_campaign_send_001c(target_campaign_public_id,request_key,is_simulated);
end $$;
create function public.confirm_studio_campaign(target_campaign text,stage_id uuid,request_key text,is_simulated boolean) returns public.marketing_send_runs language plpgsql security definer set search_path='' as $$
declare s private.studio_send_stages;c public.marketing_campaigns;r public.marketing_send_runs;counts jsonb;
begin
 if is_simulated is distinct from false then raise exception using errcode='22023',message='V2 delivery requires the governed external provider.';end if;
 select * into s from private.studio_send_stages where id=stage_id;
 if s.id is null or s.user_id<>auth.uid() or public.current_active_membership_id(s.organization_id) is distinct from s.membership_id then raise exception using errcode='42501',message='Review unavailable.';end if;
 select * into c from public.marketing_campaigns where id=s.campaign_id and public_id=target_campaign for update;
 if c.id is null then raise exception using errcode='42501',message='Review belongs to another campaign.';end if;
 select * into r from public.marketing_send_runs where organization_id=s.organization_id and idempotency_key=request_key;
 if r.id is not null then
 if r.campaign_id<>c.id or r.content_version<>2 then raise exception 'Confirmation key already used.';end if;return r;end if;
 if c.updated_at<>s.campaign_version or c.status not in ('draft','ready') or s.created_at<now()-interval '15 minutes' then raise exception using errcode='40001',message='Campaign changed or review expired. Review again.';end if;
 counts:=private.studio_audience_state(c);
 if counts->>'fingerprint'<>s.source->'studio_snapshot'->>'audienceFingerprint' or (counts->>'eligible')::int<1 then raise exception using errcode='40001',message='Audience changed or has no eligible recipients. Review again.';end if;
 if exists(select 1 from jsonb_object_keys(s.source->'studio_snapshot'->'assets') x where not exists(select 1 from public.studio_media_assets a where a.public_id=x and a.organization_id=c.organization_id and a.status='ready')) then raise exception 'Media publication status changed. Review again.';end if;
 insert into public.marketing_send_runs(organization_id,campaign_id,initiated_by_membership_id,idempotency_key,campaign_version,campaign_name,subject,preview_text,sender_name,reply_to,content_version,content,audience_type,audience_public_id,simulated,matching_count,eligible_count,unknown_count,opted_out_count,suppressed_count,missing_email_count,duplicate_count,studio_snapshot)
 values(c.organization_id,c.id,s.membership_id,request_key,c.updated_at,c.name,c.subject,c.preview_text,c.sender_name,c.reply_to,2,c.content,c.audience_type,c.audience_public_id,is_simulated,(counts->>'matching')::int,(counts->>'eligible')::int,(counts->>'unknown')::int,(counts->>'optedOut')::int,(counts->>'suppressed')::int,(counts->>'missingEmail')::int,(counts->>'duplicates')::int,s.source->'studio_snapshot') returning * into r;
 insert into public.marketing_send_recipients(organization_id,send_run_id,contact_id,normalized_email,display_name,personalization,eligible_at_snapshot,eligibility_reason)
 select distinct on (lower(btrim(ct.primary_email))) c.organization_id,r.id,ct.id,lower(btrim(ct.primary_email)),btrim(ct.first_name||' '||ct.last_name),jsonb_build_object('firstName',ct.first_name,'preferredName',ct.preferred_name,'lastName',ct.last_name),true,'eligible'
 -- Materialize the very same audience used for the fingerprint check. A second
 -- audience query under READ COMMITTED could otherwise see different contacts.
 from jsonb_to_recordset(counts->'recipients') as ct(id uuid,primary_email text,first_name text,preferred_name text,last_name text,marketing_email_status text)
 where ct.primary_email is not null and ct.marketing_email_status='opted-in' order by lower(btrim(ct.primary_email)),ct.id;
 update public.marketing_campaigns set status='sending' where id=c.id;return r;
end $$;

-- Private payload reads require a current lease. A retry receives stored bytes.
create function public.studio_recipient_payload(target_recipient text,target_claim uuid,new_payload jsonb default null,token_digest text default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.marketing_send_recipients;s public.marketing_send_runs;stored private.studio_recipient_payloads;
begin
 select * into r from public.marketing_send_recipients where public_id=target_recipient for update;
 if r.id is null or r.status<>'processing' or r.claim_token is distinct from target_claim then raise exception using errcode='42501',message='Recipient lease unavailable.';end if;
 select * into s from public.marketing_send_runs where id=r.send_run_id and content_version=2;
 if s.id is null then raise exception 'V2 run required.';end if;
 select * into stored from private.studio_recipient_payloads where recipient_id=r.id;
 if stored.recipient_id is not null then return stored.payload;end if;
 if new_payload is null then return null;end if;
 if new_payload->>'to' is distinct from r.normalized_email or new_payload->>'deliveryKey' is distinct from r.public_id or new_payload->>'senderName' is distinct from s.sender_name or new_payload->>'replyTo' is distinct from s.reply_to or
 length(new_payload->>'html')<1 or octet_length(new_payload->>'html')>110000 or length(new_payload->>'text')<1 or token_digest !~ '^[a-f0-9]{64}$' then raise exception 'Invalid delivery payload.';end if;
 insert into private.studio_recipient_payloads(recipient_id,organization_id,payload,checksum) values(r.id,r.organization_id,new_payload,encode(extensions.digest(new_payload::text,'sha256'),'hex'));
 insert into public.marketing_unsubscribe_tokens(token_hash,organization_id,contact_id,recipient_id) values(token_digest,r.organization_id,r.contact_id,r.id);
 return new_payload;
end $$;

create function public.prepare_studio_test(stage_id uuid,actor_membership uuid,request_key text,payload jsonb,token_digest text) returns jsonb language plpgsql security definer set search_path='' as $$
declare s private.studio_send_stages;c public.marketing_campaigns;t public.studio_test_sends;
begin
 select * into s from private.studio_send_stages where id=stage_id and membership_id=actor_membership;
 -- Serialize the per-membership test quota even across different campaigns.
 perform 1 from public.organization_memberships m join public.organizations o on o.id=m.organization_id
 where m.id=actor_membership and m.organization_id=s.organization_id and m.status='active' and o.status='active' for update of m;
 if s.id is null or not found then raise exception using errcode='42501',message='Test send unavailable.';end if;
 select * into c from public.marketing_campaigns where id=s.campaign_id for update;
 select * into t from public.studio_test_sends where organization_id=s.organization_id and studio_test_sends.request_key=prepare_studio_test.request_key;
 if t.id is not null then
 if t.campaign_id<>s.campaign_id or t.membership_id<>actor_membership then raise exception 'Test key already used.';end if;
 return jsonb_build_object('id',t.public_id,'status',t.status,'providerMessageId',t.provider_message_id);end if;
 if c.updated_at<>s.campaign_version or c.status not in ('draft','ready') or s.created_at<now()-interval '15 minutes' then raise exception using errcode='40001',message='Campaign changed. Save and review again.';end if;
 if exists(select 1 from jsonb_object_keys(s.source->'studio_snapshot'->'assets') x where not exists(select 1 from public.studio_media_assets a where a.public_id=x and a.organization_id=c.organization_id and a.status='ready')) then raise exception 'Media publication status changed. Review again.';end if;
 if (select count(*) from public.studio_test_sends where membership_id=actor_membership and created_at>now()-interval '1 hour')>=5 then raise exception 'Test email limit reached. Try later.';end if;
 if payload->>'to' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or payload->>'to' ~* '(\.(example|test|invalid)$|@example\.(com|net|org)$)' or payload->>'senderName' is distinct from c.sender_name or payload->>'replyTo' is distinct from c.reply_to or payload->>'subject' not like '[TEST] %' or octet_length(payload->>'html') not between 1 and 110000 or length(payload->>'text')<1 or token_digest !~ '^[a-f0-9]{64}$' then raise exception 'Invalid test message.';end if;
 insert into public.studio_test_sends(organization_id,campaign_id,membership_id,stage_id,request_key) values(s.organization_id,s.campaign_id,actor_membership,s.id,request_key) returning * into t;
 insert into private.studio_test_payloads(test_id,payload,checksum,token_hash) values(t.id,payload||jsonb_build_object('deliveryKey',t.public_id),encode(extensions.digest((payload||jsonb_build_object('deliveryKey',t.public_id))::text,'sha256'),'hex'),token_digest);
 return jsonb_build_object('id',t.public_id,'status',t.status);
end $$;
create function public.claim_studio_test(target_test text) returns jsonb language plpgsql security definer set search_path='' as $$
declare t public.studio_test_sends;p jsonb;
begin
 select * into t from public.studio_test_sends where public_id=target_test for update;
 if t.id is null or t.status<>'prepared' then return null;end if;
 update public.studio_test_sends set status='processing' where id=t.id;
 select payload into p from private.studio_test_payloads where test_id=t.id;return p;
end $$;
create function public.complete_studio_test(target_test text,message_id text,failure_code text) returns void language plpgsql security definer set search_path='' as $$
begin
 update public.studio_test_sends set status=case when message_id is not null then 'accepted' else 'failed' end,provider_message_id=message_id,error_code=failure_code,completed_at=now() where public_id=target_test and status='processing';
end $$;
create function public.unsubscribe_studio_test(token_digest text) returns boolean language plpgsql security definer set search_path='' as $$
begin
 update private.studio_test_payloads set unsubscribe_used_at=coalesce(unsubscribe_used_at,now()) where token_hash=token_digest;return found;
end $$;

revoke all on function private.studio_immutable(),private.studio_test_payload_guard(),private.studio_run_guard(),private.studio_recipient_guard(),private.studio_audience_state(public.marketing_campaigns) from public,anon,authenticated;
revoke all on function public.review_studio_campaign(text),public.confirm_studio_campaign(text,uuid,text,boolean),public.confirm_campaign_send(text,text,boolean) from public,anon;
grant execute on function public.review_studio_campaign(text),public.confirm_studio_campaign(text,uuid,text,boolean),public.confirm_campaign_send(text,text,boolean) to authenticated;
revoke all on function public.stage_studio_campaign(text,uuid,timestamptz,text,text,text),public.studio_recipient_payload(text,uuid,jsonb,text),public.prepare_studio_test(uuid,uuid,text,jsonb,text),public.claim_studio_test(text),public.complete_studio_test(text,text,text) from public,anon,authenticated;
grant execute on function public.stage_studio_campaign(text,uuid,timestamptz,text,text,text),public.studio_recipient_payload(text,uuid,jsonb,text),public.prepare_studio_test(uuid,uuid,text,jsonb,text),public.claim_studio_test(text),public.complete_studio_test(text,text,text) to service_role;
revoke all on function public.unsubscribe_studio_test(text) from public;
grant execute on function public.unsubscribe_studio_test(text) to anon,authenticated;

-- Keep test events auditable without adding campaign analytics or changing consent.
alter function public.record_marketing_provider_event(text,text,text,public.marketing_delivery_event_type,timestamptz,jsonb) rename to record_campaign_provider_event_001c;
revoke all on function public.record_campaign_provider_event_001c(text,text,text,public.marketing_delivery_event_type,timestamptz,jsonb) from public,anon,authenticated,service_role;
create function public.record_marketing_provider_event(message_id text,event_provider text,event_id text,target_type public.marketing_delivery_event_type,event_time timestamptz,event_metadata jsonb default '{}'::jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
declare t public.studio_test_sends; inserted boolean;
begin
 if event_provider is distinct from 'resend' or coalesce(length(event_id),0) not between 1 and 255 or coalesce(length(message_id),0) not between 1 and 255 or event_time is null or target_type is null then raise exception using errcode='22023',message='Invalid provider event.';end if;
 perform pg_advisory_xact_lock(hashtextextended('studio-provider:'||message_id,0));
 select * into t from public.studio_test_sends where provider_message_id=message_id;
 if t.id is null then
  if exists(select 1 from public.marketing_send_recipients where provider_message_id=message_id) then return public.record_campaign_provider_event_001c(message_id,event_provider,event_id,target_type,event_time,event_metadata);end if;
  insert into private.studio_pending_provider_events(provider_event_id,provider_message_id,event_type,occurred_at,metadata)
  values(event_id,message_id,target_type,event_time,coalesce(event_metadata,'{}')) on conflict(provider_event_id) do nothing;
  return false;
 end if;
 insert into private.studio_test_events(provider_event_id,test_id,provider_message_id,event_type,occurred_at)
 values(event_id,t.id,message_id,target_type,event_time) on conflict(provider_event_id) do nothing;
 get diagnostics inserted=row_count;return inserted;
end $$;
revoke all on function public.record_marketing_provider_event(text,text,text,public.marketing_delivery_event_type,timestamptz,jsonb) from public,anon,authenticated;
grant execute on function public.record_marketing_provider_event(text,text,text,public.marketing_delivery_event_type,timestamptz,jsonb) to service_role;

create function private.reconcile_studio_pending_events() returns trigger language plpgsql security definer set search_path='' as $$
declare e private.studio_pending_provider_events;
begin
 if new.provider_message_id is null or new.provider_message_id is not distinct from old.provider_message_id then return new;end if;
 perform pg_advisory_xact_lock(hashtextextended('studio-provider:'||new.provider_message_id,0));
 for e in select * from private.studio_pending_provider_events where provider_message_id=new.provider_message_id order by occurred_at,provider_event_id for update loop
  perform public.record_marketing_provider_event(e.provider_message_id,'resend',e.provider_event_id,e.event_type,e.occurred_at,e.metadata);
  delete from private.studio_pending_provider_events where provider_event_id=e.provider_event_id;
 end loop;
 return new;
end $$;
revoke all on function private.reconcile_studio_pending_events() from public,anon,authenticated;
create trigger studio_test_pending_events after update of provider_message_id on public.studio_test_sends for each row execute function private.reconcile_studio_pending_events();
create trigger studio_campaign_pending_events after update of provider_message_id on public.marketing_send_recipients for each row execute function private.reconcile_studio_pending_events();

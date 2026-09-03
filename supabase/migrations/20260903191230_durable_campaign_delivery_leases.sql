-- Campaign delivery claims are leases. A crashed worker's work becomes
-- reclaimable after 15 minutes; the logical recipient ID remains unchanged so
-- provider retries retain the same idempotency key. A provider may accept a
-- request immediately before worker failure, so recovery still depends on the
-- provider honoring that key across the retry interval.

drop index if exists public.marketing_recipients_claim_idx;
create index marketing_recipients_claim_idx
on public.marketing_send_recipients(send_run_id,status,claimed_at,created_at)
where status in ('pending','processing');

create or replace function private.can_process_marketing_delivery(target_org uuid)
returns boolean language sql stable security invoker set search_path='' as $$
 select coalesce(auth.jwt()->>'role','')='service_role'
   or public.current_active_membership_id(target_org) is not null
$$;

create or replace function public.claim_campaign_recipients(target_send_public_id text,batch_size integer,claim_id uuid)
returns setof public.marketing_send_recipients language plpgsql security definer set search_path='' as $$
declare run public.marketing_send_runs;
begin
 select * into run from public.marketing_send_runs where public_id=target_send_public_id;
 if run.id is null or not private.can_process_marketing_delivery(run.organization_id) then
  raise exception using errcode='42501',message='Send run is unavailable.';
 end if;
 update public.marketing_send_runs set status='sending',started_at=coalesce(started_at,now()) where id=run.id and status='queued';
 return query
 with claimed as(
  select r.id from public.marketing_send_recipients r
  where r.send_run_id=run.id
    and (r.status='pending' or (r.status='processing' and r.claimed_at < now()-interval '15 minutes'))
  order by r.created_at,r.id
  for update skip locked
  limit least(greatest(batch_size,1),100)
 )
 update public.marketing_send_recipients r set
  status=case when c.marketing_email_status='opted-in' then 'processing'::public.marketing_recipient_status else 'suppressed'::public.marketing_recipient_status end,
  eligibility_reason=case when c.marketing_email_status='opted-in' then r.eligibility_reason else 'consent-changed-before-delivery' end,
  claim_token=claim_id,claimed_at=now(),completed_at=case when c.marketing_email_status='opted-in' then null else now() end
 from claimed x,public.contacts c where r.id=x.id and c.id=r.contact_id returning r.*;
end $$;

create or replace function public.complete_campaign_recipient(target_recipient_public_id text,target_claim uuid,result_status public.marketing_recipient_status,target_provider_message_id text,error_code text)
returns void language plpgsql security definer set search_path='' as $$
declare r public.marketing_send_recipients;
begin
 select * into r from public.marketing_send_recipients where public_id=target_recipient_public_id for update;
 if r.id is null or not private.can_process_marketing_delivery(r.organization_id) or r.status<>'processing' or r.claim_token<>target_claim then
  raise exception using errcode='42501',message='Recipient claim is unavailable.';
 end if;
 if result_status not in ('accepted','failed','suppressed') then raise exception using errcode='22023',message='Invalid delivery result.'; end if;
 update public.marketing_send_recipients set status=result_status,provider_message_id=target_provider_message_id,last_error_code=left(error_code,100),accepted_at=case when result_status='accepted' then now() end,completed_at=now() where id=r.id;
end $$;

create or replace function public.register_marketing_unsubscribe_token(target_recipient_public_id text,token_digest text)
returns void language plpgsql security definer set search_path='' as $$
declare r public.marketing_send_recipients;
begin
 select * into r from public.marketing_send_recipients where public_id=target_recipient_public_id;
 if r.id is null or not private.can_process_marketing_delivery(r.organization_id) then raise exception using errcode='42501',message='Recipient is unavailable.'; end if;
 insert into public.marketing_unsubscribe_tokens(token_hash,organization_id,contact_id,recipient_id) values(token_digest,r.organization_id,r.contact_id,r.id) on conflict(token_hash) do nothing;
end $$;

create or replace function public.finish_campaign_send(target_send_public_id text)
returns public.marketing_send_runs language plpgsql security definer set search_path='' as $$
declare run public.marketing_send_runs; pending_count integer; failed_count integer;
begin
 select * into run from public.marketing_send_runs where public_id=target_send_public_id for update;
 if run.id is null or not private.can_process_marketing_delivery(run.organization_id) then raise exception using errcode='42501',message='Send run is unavailable.'; end if;
 select count(*) filter(where status in ('pending','processing')),count(*) filter(where status in ('failed','bounced')) into pending_count,failed_count from public.marketing_send_recipients where send_run_id=run.id;
 if pending_count=0 then
  update public.marketing_send_runs set status=case when failed_count=0 then 'completed'::public.marketing_send_status when failed_count<eligible_count then 'partially-failed'::public.marketing_send_status else 'failed'::public.marketing_send_status end,completed_at=now() where id=run.id returning * into run;
  update public.marketing_campaigns set status=case when failed_count=0 then 'sent'::public.marketing_campaign_status else 'sending'::public.marketing_campaign_status end where id=run.campaign_id;
 end if;
 return run;
end $$;

revoke all on function private.can_process_marketing_delivery(uuid) from public,anon,authenticated;
revoke all on function public.claim_campaign_recipients(text,integer,uuid),public.complete_campaign_recipient(text,uuid,public.marketing_recipient_status,text,text),public.register_marketing_unsubscribe_token(text,text),public.finish_campaign_send(text) from public,anon;
grant execute on function public.claim_campaign_recipients(text,integer,uuid),public.complete_campaign_recipient(text,uuid,public.marketing_recipient_status,text,text),public.register_marketing_unsubscribe_token(text,text),public.finish_campaign_send(text) to authenticated,service_role;

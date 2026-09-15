
drop trigger if exists studio_run_guard on public.marketing_send_runs;
drop trigger if exists studio_recipient_guard on public.marketing_send_recipients;
drop trigger if exists studio_campaign_pending_events on public.marketing_send_recipients;
drop function if exists private.reconcile_studio_pending_events() cascade;
drop table if exists private.studio_pending_provider_events;
drop table if exists private.studio_test_events,private.studio_test_payloads,public.studio_test_sends,private.studio_recipient_payloads,private.studio_send_stages cascade;
drop function if exists public.review_studio_campaign(text),public.stage_studio_campaign(text,uuid,timestamptz,text,text,text),public.confirm_studio_campaign(text,uuid,text,boolean),public.studio_recipient_payload(text,uuid,jsonb,text),public.prepare_studio_test(uuid,uuid,text,jsonb,text),public.claim_studio_test(text),public.complete_studio_test(text,text,text),public.unsubscribe_studio_test(text);
drop function if exists private.studio_immutable(),private.studio_test_payload_guard(),private.studio_run_guard(),private.studio_recipient_guard(),private.studio_audience_state(public.marketing_campaigns);
drop function public.confirm_campaign_send(text,text,boolean);
alter function public.confirm_v1_campaign_send_001c(text,text,boolean) rename to confirm_campaign_send;
grant execute on function public.confirm_campaign_send(text,text,boolean) to authenticated;
alter table public.marketing_send_runs drop column studio_snapshot;
do $$begin if to_regprocedure('public.record_campaign_provider_event_001c(text,text,text,public.marketing_delivery_event_type,timestamptz,jsonb)') is not null then
drop function public.record_marketing_provider_event(text,text,text,public.marketing_delivery_event_type,timestamptz,jsonb);
alter function public.record_campaign_provider_event_001c(text,text,text,public.marketing_delivery_event_type,timestamptz,jsonb) rename to record_marketing_provider_event;
grant execute on function public.record_marketing_provider_event(text,text,text,public.marketing_delivery_event_type,timestamptz,jsonb) to service_role;
end if;end $$;

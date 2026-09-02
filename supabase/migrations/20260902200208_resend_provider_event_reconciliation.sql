create unique index marketing_recipients_provider_message_unique
on public.marketing_send_recipients(provider_message_id)
where provider_message_id is not null;

create function public.record_marketing_provider_event(
 message_id text,
 event_provider text,
 event_id text,
 target_type public.marketing_delivery_event_type,
 event_time timestamptz,
 event_metadata jsonb default '{}'::jsonb
) returns boolean language plpgsql security definer set search_path='' as $$
declare r public.marketing_send_recipients; inserted boolean;
begin
 if event_provider<>'resend' or length(event_id) not between 1 and 255 or length(message_id) not between 1 and 255 then
  raise exception using errcode='22023',message='Invalid provider event.';
 end if;
 select * into r from public.marketing_send_recipients where provider_message_id=message_id;
 if r.id is null then return false; end if;
 insert into public.marketing_delivery_events(organization_id,recipient_id,provider,provider_event_id,provider_message_id,event_type,occurred_at,metadata)
 values(r.organization_id,r.id,event_provider,event_id,message_id,target_type,event_time,coalesce(event_metadata,'{}'))
 on conflict(provider,provider_event_id) do nothing;
 get diagnostics inserted=row_count;
 if not inserted then return false; end if;
 update public.marketing_send_recipients set
  status=case
   when target_type='delivered' and status in ('accepted','processing') then 'delivered'::public.marketing_recipient_status
   when target_type='hard-bounce' then 'bounced'::public.marketing_recipient_status
   when target_type in ('rejected','provider-failure') and status not in ('delivered','bounced','suppressed') then 'failed'::public.marketing_recipient_status
   else status end,
  delivered_at=case when target_type='delivered' and status in ('accepted','processing') then event_time else delivered_at end,
  last_error_code=case when target_type in ('soft-bounce','hard-bounce','rejected','provider-failure') then left(target_type::text,100) else last_error_code end
 where id=r.id;
 if target_type in ('hard-bounce','complaint') then
  update public.contacts set marketing_email_status='suppressed' where id=r.contact_id and organization_id=r.organization_id;
 end if;
 return true;
end $$;

revoke all on function public.record_marketing_provider_event(text,text,text,public.marketing_delivery_event_type,timestamptz,jsonb) from public,anon,authenticated;
grant execute on function public.record_marketing_provider_event(text,text,text,public.marketing_delivery_event_type,timestamptz,jsonb) to service_role;

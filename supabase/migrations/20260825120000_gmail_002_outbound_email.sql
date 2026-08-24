-- GMAIL-002: canonical outbound messages and durable provider attempts.

create type public.outbound_email_status as enum (
  'pending', 'submitting', 'provider-accepted', 'failed-confirmed', 'ambiguous'
);
create type public.email_attempt_status as enum (
  'submitting', 'provider-accepted', 'failed-confirmed', 'ambiguous'
);
create type public.email_recipient_kind as enum ('to', 'cc', 'bcc');

alter table public.connected_email_accounts
  add constraint connected_email_accounts_id_org_owner_key
  unique (id, organization_id, owner_membership_id);

create table public.email_messages (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default ('email_' || replace(gen_random_uuid()::text, '-', '')),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  owner_membership_id uuid not null,
  connected_email_account_id uuid not null references public.connected_email_accounts (id) on delete restrict,
  candidate_id uuid not null,
  provider public.email_provider not null,
  provider_message_id text,
  provider_thread_id text,
  internet_message_id text not null,
  direction text not null default 'outbound' check (direction = 'outbound'),
  sender_name text,
  sender_email text not null,
  subject text not null check (length(btrim(subject)) between 1 and 998),
  text_body text not null check (length(btrim(text_body)) between 1 and 1000000),
  status public.outbound_email_status not null default 'pending',
  send_idempotency_key text not null check (length(send_idempotency_key) between 16 and 255),
  provenance text not null default 'frangroove-explicit-send' check (provenance = 'frangroove-explicit-send'),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint email_messages_public_id_key unique (public_id),
  constraint email_messages_send_idempotency_key unique (connected_email_account_id, send_idempotency_key),
  constraint email_messages_owner_same_organization_fk foreign key (owner_membership_id, organization_id)
    references public.organization_memberships (id, organization_id) on delete restrict,
  constraint email_messages_candidate_same_organization_fk foreign key (candidate_id, organization_id)
    references public.candidates (id, organization_id) on delete restrict,
  constraint email_messages_account_owner_fk foreign key (connected_email_account_id, organization_id, owner_membership_id)
    references public.connected_email_accounts (id, organization_id, owner_membership_id) on delete restrict
);
create index email_messages_owner_time_idx on public.email_messages (organization_id, owner_membership_id, created_at desc);
create index email_messages_candidate_time_idx on public.email_messages (organization_id, candidate_id, created_at desc);
create trigger email_messages_set_updated_at before update on public.email_messages for each row execute function public.set_updated_at();

create table public.email_recipients (
  id uuid primary key default gen_random_uuid(),
  email_message_id uuid not null references public.email_messages (id) on delete cascade,
  kind public.email_recipient_kind not null,
  display_name text,
  email_address text not null check (length(btrim(email_address)) between 3 and 320),
  recipient_order integer not null default 0 check (recipient_order >= 0),
  constraint email_recipients_message_kind_order_key unique (email_message_id, kind, recipient_order)
);

create table public.email_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  email_message_id uuid not null references public.email_messages (id) on delete restrict,
  attempt_number integer not null check (attempt_number > 0),
  status public.email_attempt_status not null,
  provider_request_started_at timestamptz not null default now(),
  completed_at timestamptz,
  provider_message_id text,
  provider_thread_id text,
  error_code text,
  retryable boolean not null default false,
  created_at timestamptz not null default now(),
  constraint email_delivery_attempts_message_number_key unique (email_message_id, attempt_number)
);

alter table public.email_messages enable row level security;
alter table public.email_recipients enable row level security;
alter table public.email_delivery_attempts enable row level security;

create policy email_messages_select_owner on public.email_messages for select to authenticated
using (owner_membership_id = public.current_active_membership_id(organization_id));
create policy email_recipients_select_message_owner on public.email_recipients for select to authenticated
using (exists (select 1 from public.email_messages message where message.id = email_message_id
  and message.owner_membership_id = public.current_active_membership_id(message.organization_id)));
create policy email_delivery_attempts_select_message_owner on public.email_delivery_attempts for select to authenticated
using (exists (select 1 from public.email_messages message where message.id = email_message_id
  and message.owner_membership_id = public.current_active_membership_id(message.organization_id)));

revoke all on public.email_messages, public.email_recipients, public.email_delivery_attempts from anon;
revoke all on public.email_messages, public.email_recipients, public.email_delivery_attempts from authenticated;
grant select on public.email_messages, public.email_recipients, public.email_delivery_attempts to authenticated;

create function public.begin_outbound_email_send(
  target_account_public_id text, target_candidate_public_id text, idempotency_key text,
  proposed_message_public_id text, proposed_internet_message_id text, proposed_subject text, proposed_body text
) returns public.email_messages
language plpgsql security definer set search_path = '' as $$
declare account public.connected_email_accounts; candidate public.candidates; message public.email_messages;
begin
  select * into account from public.connected_email_accounts a where a.public_id = target_account_public_id;
  if account.id is null or account.status <> 'connected'
    or account.owner_membership_id <> public.current_active_membership_id(account.organization_id)
    or not ('https://www.googleapis.com/auth/gmail.send' = any(account.granted_scopes)) then
    raise exception using errcode = '42501', message = 'A usable owned Google account is required.';
  end if;
  select * into candidate from public.candidates c where c.organization_id = account.organization_id
    and c.public_id = target_candidate_public_id and c.assigned_membership_id = account.owner_membership_id
    and c.status = 'active' and c.archived_at is null;
  if candidate.id is null then raise exception using errcode = '42501', message = 'An assigned active candidate is required.'; end if;
  insert into public.email_messages(public_id,organization_id,owner_membership_id,connected_email_account_id,candidate_id,
    provider,internet_message_id,sender_name,sender_email,subject,text_body,send_idempotency_key)
  values(proposed_message_public_id,account.organization_id,account.owner_membership_id,account.id,candidate.id,
    account.provider,proposed_internet_message_id,account.display_name,account.email_address,btrim(proposed_subject),btrim(proposed_body),idempotency_key)
  on conflict (connected_email_account_id,send_idempotency_key) do nothing;
  select * into message from public.email_messages m where m.connected_email_account_id=account.id and m.send_idempotency_key=idempotency_key;
  insert into public.email_recipients(email_message_id,kind,display_name,email_address,recipient_order)
  values(message.id,'to',btrim(candidate.first_name || ' ' || candidate.last_name),lower(btrim(candidate.email)),0)
  on conflict (email_message_id,kind,recipient_order) do nothing;
  return message;
end $$;

create function public.claim_outbound_email_attempt(target_message_public_id text, is_retry boolean)
returns public.email_delivery_attempts language plpgsql security definer set search_path = '' as $$
declare message public.email_messages; attempt public.email_delivery_attempts; next_attempt integer;
begin
  if result_status not in ('provider-accepted', 'failed-confirmed', 'ambiguous') then
    raise exception using errcode='22023', message='Invalid terminal outbound attempt status.';
  end if;
  select * into message from public.email_messages m where m.public_id=target_message_public_id for update;
  if message.id is null or message.owner_membership_id <> public.current_active_membership_id(message.organization_id) then
    raise exception using errcode='42501', message='Outbound message is unavailable.';
  end if;
  if (not is_retry and message.status <> 'pending') or (is_retry and message.status <> 'failed-confirmed') then return null; end if;
  select coalesce(max(a.attempt_number),0)+1 into next_attempt from public.email_delivery_attempts a where a.email_message_id=message.id;
  update public.email_messages set status='submitting' where id=message.id;
  insert into public.email_delivery_attempts(email_message_id,attempt_number,status) values(message.id,next_attempt,'submitting') returning * into attempt;
  return attempt;
end $$;

create function public.complete_outbound_email_attempt(
  target_message_public_id text, target_attempt_id uuid, result_status public.email_attempt_status,
  result_provider_message_id text default null, result_provider_thread_id text default null,
  result_error_code text default null, result_retryable boolean default false
) returns void language plpgsql security definer set search_path = '' as $$
declare message public.email_messages;
begin
  select * into message from public.email_messages m where m.public_id=target_message_public_id for update;
  if message.id is null or message.owner_membership_id <> public.current_active_membership_id(message.organization_id)
    or message.status <> 'submitting' then raise exception using errcode='42501', message='Outbound attempt cannot be completed.'; end if;
  update public.email_delivery_attempts set status=result_status,completed_at=now(),provider_message_id=result_provider_message_id,
    provider_thread_id=result_provider_thread_id,error_code=result_error_code,retryable=result_retryable
    where id=target_attempt_id and email_message_id=message.id and status='submitting';
  if not found then raise exception using errcode='42501', message='Outbound attempt cannot be completed.'; end if;
  update public.email_messages set status=case result_status when 'provider-accepted' then 'provider-accepted'::public.outbound_email_status
      when 'failed-confirmed' then 'failed-confirmed'::public.outbound_email_status else 'ambiguous'::public.outbound_email_status end,
    provider_message_id=result_provider_message_id,provider_thread_id=result_provider_thread_id,
    sent_at=case when result_status='provider-accepted' then now() else sent_at end where id=message.id;
end $$;

revoke all on function public.begin_outbound_email_send(text,text,text,text,text,text,text) from public,anon;
revoke all on function public.claim_outbound_email_attempt(text,boolean) from public,anon;
revoke all on function public.complete_outbound_email_attempt(text,uuid,public.email_attempt_status,text,text,text,boolean) from public,anon;
grant execute on function public.begin_outbound_email_send(text,text,text,text,text,text,text) to authenticated;
grant execute on function public.claim_outbound_email_attempt(text,boolean) to authenticated;
grant execute on function public.complete_outbound_email_attempt(text,uuid,public.email_attempt_status,text,text,text,boolean) to authenticated;

comment on function public.begin_outbound_email_send(text,text,text,text,text,text,text) is
  'Owner-only idempotent send intent. Sender and recipient are derived from owned account and assigned candidate.';

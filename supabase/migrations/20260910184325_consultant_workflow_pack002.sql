alter table public.candidates add constraint candidates_public_org_unique unique(public_id,organization_id);
-- Durable consultant workflow. No delivery integration, public document grants, or fixture data.

create table public.consultant_tasks (
id text primary key,
title text not null check(length(btrim(title)) between 1 and 300),
description text not null default '' check(length(description)<=10000),
due_at timestamptz not null,
status text not null check(status in ('open','completed','cancelled')),
priority text not null check(priority in ('low','normal','high','urgent')),
completed_at timestamptz,
source text not null default 'consultant',
source_reference_id text,
recommended_reason text,
check((status='completed')=(completed_at is not null)),
organization_id uuid not null references public.organizations(id),
consultant_membership_id uuid not null,
candidate_public_id text ,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
foreign key(consultant_membership_id,organization_id) references public.organization_memberships(id,organization_id),
foreign key(candidate_public_id,organization_id) references public.candidates(public_id,organization_id)
);
alter table public.consultant_tasks enable row level security;
alter table public.consultant_tasks force row level security;
revoke all on public.consultant_tasks from public,anon,authenticated;
grant select,insert,update,delete on public.consultant_tasks to authenticated;
grant all on public.consultant_tasks to service_role;
create policy consultant_tasks_owner on public.consultant_tasks for all to authenticated
using (consultant_membership_id=public.current_active_membership_id(organization_id)
 and (candidate_public_id is null or exists(select 1 from public.candidates c where c.public_id=candidate_public_id and c.organization_id=consultant_tasks.organization_id and public.can_access_candidate(c.id))))
with check (consultant_membership_id=public.current_active_membership_id(organization_id)
 and (candidate_public_id is null or exists(select 1 from public.candidates c where c.public_id=candidate_public_id and c.organization_id=consultant_tasks.organization_id and public.can_access_candidate(c.id))));
create index consultant_tasks_owner_idx on public.consultant_tasks(organization_id,consultant_membership_id);
create index consultant_tasks_candidate_idx on public.consultant_tasks(candidate_public_id,organization_id);
create trigger consultant_tasks_updated before update on public.consultant_tasks for each row execute function public.set_updated_at();

create table public.consultant_calendar_events (
id text primary key,
title text not null check(length(btrim(title)) between 1 and 300),
description text not null default '' check(length(description)<=10000),
start_at timestamptz not null,
end_at timestamptz not null check(end_at>start_at),
timezone text not null,
location text,
meeting_url text check(meeting_url is null or meeting_url ~ '^https?://'),
event_type text not null default 'Meeting' check(length(event_type) between 1 and 100),
status text not null check(status in ('scheduled','completed','cancelled','no-show')),
notes text,
source text not null default 'consultant-created',
organization_id uuid not null references public.organizations(id),
consultant_membership_id uuid not null,
candidate_public_id text ,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
foreign key(consultant_membership_id,organization_id) references public.organization_memberships(id,organization_id),
foreign key(candidate_public_id,organization_id) references public.candidates(public_id,organization_id)
);
alter table public.consultant_calendar_events enable row level security;
alter table public.consultant_calendar_events force row level security;
revoke all on public.consultant_calendar_events from public,anon,authenticated;
grant select,insert,update,delete on public.consultant_calendar_events to authenticated;
grant all on public.consultant_calendar_events to service_role;
create policy consultant_calendar_events_owner on public.consultant_calendar_events for all to authenticated
using (consultant_membership_id=public.current_active_membership_id(organization_id)
 and (candidate_public_id is null or exists(select 1 from public.candidates c where c.public_id=candidate_public_id and c.organization_id=consultant_calendar_events.organization_id and public.can_access_candidate(c.id))))
with check (consultant_membership_id=public.current_active_membership_id(organization_id)
 and (candidate_public_id is null or exists(select 1 from public.candidates c where c.public_id=candidate_public_id and c.organization_id=consultant_calendar_events.organization_id and public.can_access_candidate(c.id))));
create index consultant_calendar_events_owner_idx on public.consultant_calendar_events(organization_id,consultant_membership_id);
create index consultant_calendar_events_candidate_idx on public.consultant_calendar_events(candidate_public_id,organization_id);
create trigger consultant_calendar_events_updated before update on public.consultant_calendar_events for each row execute function public.set_updated_at();

create table public.consultant_reminders (
id text primary key,
remind_at timestamptz not null,
reference_type text not null check(reference_type in ('task','calendar-event','candidate')),
reference_id text not null,
status text not null check(status in ('pending','dismissed','completed')),
organization_id uuid not null references public.organizations(id),
consultant_membership_id uuid not null,
candidate_public_id text ,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
foreign key(consultant_membership_id,organization_id) references public.organization_memberships(id,organization_id),
foreign key(candidate_public_id,organization_id) references public.candidates(public_id,organization_id)
);
alter table public.consultant_reminders enable row level security;
alter table public.consultant_reminders force row level security;
revoke all on public.consultant_reminders from public,anon,authenticated;
grant select,insert,update,delete on public.consultant_reminders to authenticated;
grant all on public.consultant_reminders to service_role;
create policy consultant_reminders_owner on public.consultant_reminders for all to authenticated
using (consultant_membership_id=public.current_active_membership_id(organization_id)
 and (candidate_public_id is null or exists(select 1 from public.candidates c where c.public_id=candidate_public_id and c.organization_id=consultant_reminders.organization_id and public.can_access_candidate(c.id))))
with check (consultant_membership_id=public.current_active_membership_id(organization_id)
 and (candidate_public_id is null or exists(select 1 from public.candidates c where c.public_id=candidate_public_id and c.organization_id=consultant_reminders.organization_id and public.can_access_candidate(c.id))));
create index consultant_reminders_owner_idx on public.consultant_reminders(organization_id,consultant_membership_id);
create index consultant_reminders_candidate_idx on public.consultant_reminders(candidate_public_id,organization_id);
create trigger consultant_reminders_updated before update on public.consultant_reminders for each row execute function public.set_updated_at();

create table public.consultant_task_dismissals (
id text primary key,
organization_id uuid not null references public.organizations(id),
consultant_membership_id uuid not null,
candidate_public_id text ,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
foreign key(consultant_membership_id,organization_id) references public.organization_memberships(id,organization_id),
foreign key(candidate_public_id,organization_id) references public.candidates(public_id,organization_id)
);
alter table public.consultant_task_dismissals enable row level security;
alter table public.consultant_task_dismissals force row level security;
revoke all on public.consultant_task_dismissals from public,anon,authenticated;
grant select,insert,update,delete on public.consultant_task_dismissals to authenticated;
grant all on public.consultant_task_dismissals to service_role;
create policy consultant_task_dismissals_owner on public.consultant_task_dismissals for all to authenticated
using (consultant_membership_id=public.current_active_membership_id(organization_id)
 and (candidate_public_id is null or exists(select 1 from public.candidates c where c.public_id=candidate_public_id and c.organization_id=consultant_task_dismissals.organization_id and public.can_access_candidate(c.id))))
with check (consultant_membership_id=public.current_active_membership_id(organization_id)
 and (candidate_public_id is null or exists(select 1 from public.candidates c where c.public_id=candidate_public_id and c.organization_id=consultant_task_dismissals.organization_id and public.can_access_candidate(c.id))));
create index consultant_task_dismissals_owner_idx on public.consultant_task_dismissals(organization_id,consultant_membership_id);
create index consultant_task_dismissals_candidate_idx on public.consultant_task_dismissals(candidate_public_id,organization_id);
create trigger consultant_task_dismissals_updated before update on public.consultant_task_dismissals for each row execute function public.set_updated_at();

create table public.candidate_brand_considerations (
id text primary key,
brand_public_id text not null references public.brand_identities(public_id),
state text not null check(state in ('considering','selected','removed')),
consultant_note text not null default '' check(length(consultant_note)<=10000),
unique(organization_id,candidate_public_id,brand_public_id),
organization_id uuid not null references public.organizations(id),
consultant_membership_id uuid not null,
candidate_public_id text not null,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
foreign key(consultant_membership_id,organization_id) references public.organization_memberships(id,organization_id),
foreign key(candidate_public_id,organization_id) references public.candidates(public_id,organization_id)
);
alter table public.candidate_brand_considerations enable row level security;
alter table public.candidate_brand_considerations force row level security;
revoke all on public.candidate_brand_considerations from public,anon,authenticated;
grant select,insert,update,delete on public.candidate_brand_considerations to authenticated;
grant all on public.candidate_brand_considerations to service_role;
create policy candidate_brand_considerations_owner on public.candidate_brand_considerations for all to authenticated
using (consultant_membership_id=public.current_active_membership_id(organization_id)
 and (candidate_public_id is null or exists(select 1 from public.candidates c where c.public_id=candidate_public_id and c.organization_id=candidate_brand_considerations.organization_id and public.can_access_candidate(c.id))))
with check (consultant_membership_id=public.current_active_membership_id(organization_id)
 and (candidate_public_id is null or exists(select 1 from public.candidates c where c.public_id=candidate_public_id and c.organization_id=candidate_brand_considerations.organization_id and public.can_access_candidate(c.id))));
create index candidate_brand_considerations_owner_idx on public.candidate_brand_considerations(organization_id,consultant_membership_id);
create index candidate_brand_considerations_candidate_idx on public.candidate_brand_considerations(candidate_public_id,organization_id);
create trigger candidate_brand_considerations_updated before update on public.candidate_brand_considerations for each row execute function public.set_updated_at();
create unique index consultant_tasks_source_idx on public.consultant_tasks(organization_id,consultant_membership_id,source_reference_id) where source_reference_id is not null and status<>'cancelled';
create index consultant_tasks_due_idx on public.consultant_tasks(organization_id,consultant_membership_id,due_at) where status='open';
create index consultant_events_start_idx on public.consultant_calendar_events(organization_id,consultant_membership_id,start_at);
-- One selection per candidate; considering brands coexist.
create unique index candidate_one_selected_brand on public.candidate_brand_considerations(organization_id,candidate_public_id) where state='selected';
-- Selection replacement is atomic and runs with the caller's RLS privileges.
create function public.set_candidate_brand_consideration(target_candidate text,target_brand text,next_state text)
returns void language plpgsql security invoker set search_path='' as $$
declare org uuid; owner_id uuid;
begin
 if next_state not in ('considering','selected','removed') then raise exception 'Invalid consideration state'; end if;
 select c.organization_id into org from public.candidates c where c.public_id=target_candidate and public.can_access_candidate(c.id);
 owner_id:=public.current_active_membership_id(org);
 if org is null or owner_id is null then raise exception 'Candidate unavailable' using errcode='42501'; end if;
 if not exists(select 1 from public.brand_identities b where b.public_id=target_brand) then raise exception 'Brand unavailable' using errcode='42501'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(org::text||target_candidate,0));
 if next_state='selected' then
  update public.candidate_brand_considerations set state='considering' where organization_id=org and candidate_public_id=target_candidate and state='selected' and brand_public_id<>target_brand;
 end if;
 insert into public.candidate_brand_considerations(id,organization_id,consultant_membership_id,candidate_public_id,brand_public_id,state)
 values('consideration-'||gen_random_uuid()::text,org,owner_id,target_candidate,target_brand,next_state)
 on conflict(organization_id,candidate_public_id,brand_public_id) do update set state=excluded.state;
end $$;
revoke all on function public.set_candidate_brand_consideration(text,text,text) from public,anon;
grant execute on function public.set_candidate_brand_consideration(text,text,text) to authenticated;
create function private.guard_consultant_workflow_identity() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.id<>old.id or new.organization_id<>old.organization_id or new.consultant_membership_id<>old.consultant_membership_id or new.created_at<>old.created_at then
  raise exception 'Workflow identity and ownership are immutable' using errcode='23514';
 end if;
 return new;
end $$;
revoke all on function private.guard_consultant_workflow_identity() from public,anon,authenticated;
create trigger consultant_tasks_identity before update on public.consultant_tasks for each row execute function private.guard_consultant_workflow_identity();
create trigger consultant_calendar_events_identity before update on public.consultant_calendar_events for each row execute function private.guard_consultant_workflow_identity();
create trigger consultant_reminders_identity before update on public.consultant_reminders for each row execute function private.guard_consultant_workflow_identity();
create trigger consultant_task_dismissals_identity before update on public.consultant_task_dismissals for each row execute function private.guard_consultant_workflow_identity();
create trigger candidate_brand_considerations_identity before update on public.candidate_brand_considerations for each row execute function private.guard_consultant_workflow_identity();

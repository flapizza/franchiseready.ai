create type public.assessment_session_status as enum ('created','invited','in-progress','submitted','analyzed','expired','cancelled');

create table public.assessment_sessions (
  id uuid primary key default gen_random_uuid(), public_id text not null unique default ('asmt_'||replace(gen_random_uuid()::text,'-','')),
  organization_id uuid not null references public.organizations(id), candidate_id uuid not null references public.candidates(id),
  owning_membership_id uuid not null, created_by_membership_id uuid not null,
  instrument_version text not null default 'franchise-ownership-assessment-v1', status public.assessment_session_status not null default 'invited',
  token_hash text not null unique check(token_hash~'^[0-9a-f]{64}$'), current_section smallint not null default 0 check(current_section between 0 and 6),
  progress_snapshot jsonb, started_at timestamptz, last_saved_at timestamptz, submitted_at timestamptz, completed_at timestamptz,
  expires_at timestamptz not null, revoked_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key(candidate_id,organization_id) references public.candidates(id,organization_id),
  foreign key(owning_membership_id,organization_id) references public.organization_memberships(id,organization_id),
  foreign key(created_by_membership_id,organization_id) references public.organization_memberships(id,organization_id), unique(id,organization_id)
);
create index assessment_sessions_candidate_idx on public.assessment_sessions(candidate_id,created_at desc);

create table public.assessment_submissions (
  id uuid primary key default gen_random_uuid(), session_id uuid not null unique references public.assessment_sessions(id), organization_id uuid not null references public.organizations(id),
  instrument_version text not null, intake_snapshot jsonb not null, response_snapshot jsonb not null, submitted_at timestamptz not null default now(),
  foreign key(session_id,organization_id) references public.assessment_sessions(id,organization_id), unique(id,organization_id)
);
create table public.assessment_analyses (
  id uuid primary key default gen_random_uuid(), session_id uuid not null references public.assessment_sessions(id), submission_id uuid not null references public.assessment_submissions(id),
  organization_id uuid not null references public.organizations(id), instrument_version text not null, analysis_version integer not null check(analysis_version>0),
  analysis_snapshot jsonb not null, generated_at timestamptz not null default now(), superseded_at timestamptz,
  foreign key(session_id,organization_id) references public.assessment_sessions(id,organization_id), foreign key(submission_id,organization_id) references public.assessment_submissions(id,organization_id)
);
create unique index assessment_current_analysis_idx on public.assessment_analyses(session_id) where superseded_at is null;

alter table public.assessment_sessions enable row level security; alter table public.assessment_sessions force row level security;
alter table public.assessment_submissions enable row level security; alter table public.assessment_submissions force row level security;
alter table public.assessment_analyses enable row level security; alter table public.assessment_analyses force row level security;
create policy assessment_sessions_read on public.assessment_sessions for select to authenticated using(public.can_access_candidate(candidate_id));
create policy assessment_submissions_read on public.assessment_submissions for select to authenticated using(exists(select 1 from public.assessment_sessions s where s.id=session_id and public.can_access_candidate(s.candidate_id)));
create policy assessment_analyses_read on public.assessment_analyses for select to authenticated using(exists(select 1 from public.assessment_sessions s where s.id=session_id and public.can_access_candidate(s.candidate_id)));
revoke all on public.assessment_sessions,public.assessment_submissions,public.assessment_analyses from anon,authenticated;
grant select on public.assessment_sessions,public.assessment_submissions,public.assessment_analyses to authenticated;

create function public.create_assessment_invitation(target_candidate_public_id text,presented_token_hash text,invitation_expires_at timestamptz) returns setof public.assessment_sessions
language plpgsql security definer set search_path='' as $$ declare c public.candidates; m uuid; begin
 select * into c from public.candidates where public_id=target_candidate_public_id and public.can_access_candidate(id); if c.id is null then raise exception 'candidate unavailable' using errcode='42501'; end if;
 m:=public.current_active_membership_id(c.organization_id); if m is null or invitation_expires_at<=now() or presented_token_hash!~'^[0-9a-f]{64}$' then raise exception 'invalid invitation'; end if;
 update public.assessment_sessions set status='cancelled',revoked_at=now(),updated_at=now() where candidate_id=c.id and instrument_version='franchise-ownership-assessment-v1' and status in('created','invited','in-progress');
 return query insert into public.assessment_sessions(organization_id,candidate_id,owning_membership_id,created_by_membership_id,token_hash,expires_at) values(c.organization_id,c.id,c.assigned_membership_id,m,presented_token_hash,invitation_expires_at) returning *; end $$;

create function public.get_candidate_assessment(target_candidate_public_id text) returns table(id uuid,public_id text,candidate_public_id text,status public.assessment_session_status,current_section smallint,started_at timestamptz,last_saved_at timestamptz,submitted_at timestamptz,completed_at timestamptz,expires_at timestamptz,revoked_at timestamptz,progress_snapshot jsonb,analysis_snapshot jsonb)
language sql security definer set search_path='' as $$ select s.id,s.public_id,c.public_id,s.status,s.current_section,s.started_at,s.last_saved_at,s.submitted_at,s.completed_at,s.expires_at,s.revoked_at,s.progress_snapshot,a.analysis_snapshot from public.assessment_sessions s join public.candidates c on c.id=s.candidate_id left join public.assessment_analyses a on a.session_id=s.id and a.superseded_at is null where c.public_id=target_candidate_public_id and public.can_access_candidate(c.id) order by s.created_at desc limit 1 $$;

create function public.load_assessment_by_token(presented_token_hash text) returns table(id uuid,public_id text,candidate_public_id text,status public.assessment_session_status,current_section smallint,started_at timestamptz,last_saved_at timestamptz,submitted_at timestamptz,completed_at timestamptz,expires_at timestamptz,revoked_at timestamptz,progress_snapshot jsonb,analysis_snapshot jsonb)
language sql security definer set search_path='' as $$ select s.id,s.public_id,c.public_id,case when s.expires_at<=now() and s.status in('created','invited','in-progress') then 'expired'::public.assessment_session_status else s.status end,s.current_section,s.started_at,s.last_saved_at,s.submitted_at,s.completed_at,s.expires_at,s.revoked_at,s.progress_snapshot,case when s.status='analyzed' then a.analysis_snapshot else null end from public.assessment_sessions s join public.candidates c on c.id=s.candidate_id left join public.assessment_analyses a on a.session_id=s.id and a.superseded_at is null where s.token_hash=presented_token_hash limit 1 $$;

create function public.save_assessment_progress(presented_token_hash text,progress_snapshot jsonb) returns setof public.assessment_sessions
language plpgsql security definer set search_path='' as $$ begin return query update public.assessment_sessions s set progress_snapshot=save_assessment_progress.progress_snapshot,current_section=least(6,greatest(0,coalesce((save_assessment_progress.progress_snapshot->>'section')::smallint,0))),status='in-progress',started_at=coalesce(started_at,now()),last_saved_at=now(),updated_at=now() where token_hash=presented_token_hash and revoked_at is null and expires_at>now() and status in('created','invited','in-progress') returning s.*; if not found then raise exception 'assessment unavailable' using errcode='42501'; end if; end $$;

create function public.submit_assessment(presented_token_hash text,submitted_intake jsonb,submitted_answers jsonb,submitted_analysis jsonb,submitted_analysis_version integer) returns setof public.assessment_sessions
language plpgsql security definer set search_path='' as $$ declare s public.assessment_sessions; sub uuid; begin select * into s from public.assessment_sessions where token_hash=presented_token_hash for update; if s.id is null or s.revoked_at is not null or s.expires_at<=now() or s.status not in('created','invited','in-progress') then raise exception 'assessment unavailable' using errcode='42501'; end if;
 insert into public.assessment_submissions(session_id,organization_id,instrument_version,intake_snapshot,response_snapshot) values(s.id,s.organization_id,s.instrument_version,submitted_intake,submitted_answers) returning id into sub;
 insert into public.assessment_analyses(session_id,submission_id,organization_id,instrument_version,analysis_version,analysis_snapshot) values(s.id,sub,s.organization_id,s.instrument_version,submitted_analysis_version,submitted_analysis);
 return query update public.assessment_sessions x set status='analyzed',progress_snapshot=null,submitted_at=now(),completed_at=now(),last_saved_at=now(),updated_at=now() where x.id=s.id returning x.*; end $$;

create function public.regenerate_assessment_analysis(target_candidate_public_id text,replacement_analysis jsonb,replacement_analysis_version integer) returns void language plpgsql security definer set search_path='' as $$ declare sid uuid; sub uuid; org uuid; inst text; begin select s.id,s.organization_id,s.instrument_version into sid,org,inst from public.assessment_sessions s join public.candidates c on c.id=s.candidate_id where c.public_id=target_candidate_public_id and public.can_access_candidate(c.id) and s.status='analyzed' order by s.completed_at desc limit 1; if sid is null then raise exception 'assessment unavailable' using errcode='42501'; end if; select id into sub from public.assessment_submissions where session_id=sid; update public.assessment_analyses set superseded_at=now() where session_id=sid and superseded_at is null; insert into public.assessment_analyses(session_id,submission_id,organization_id,instrument_version,analysis_version,analysis_snapshot) values(sid,sub,org,inst,replacement_analysis_version,replacement_analysis); end $$;
create function public.revoke_assessment_invitation(target_candidate_public_id text) returns void language sql security definer set search_path='' as $$ update public.assessment_sessions s set status='cancelled',revoked_at=now(),updated_at=now() from public.candidates c where c.id=s.candidate_id and c.public_id=target_candidate_public_id and public.can_access_candidate(c.id) and s.status in('created','invited','in-progress') $$;

revoke all on function public.create_assessment_invitation(text,text,timestamptz),public.get_candidate_assessment(text),public.load_assessment_by_token(text),public.save_assessment_progress(text,jsonb),public.submit_assessment(text,jsonb,jsonb,jsonb,integer),public.regenerate_assessment_analysis(text,jsonb,integer),public.revoke_assessment_invitation(text) from public;
grant execute on function public.create_assessment_invitation(text,text,timestamptz),public.get_candidate_assessment(text),public.regenerate_assessment_analysis(text,jsonb,integer),public.revoke_assessment_invitation(text) to authenticated;
grant execute on function public.load_assessment_by_token(text),public.save_assessment_progress(text,jsonb),public.submit_assessment(text,jsonb,jsonb,jsonb,integer) to anon,authenticated;

create function public.prevent_assessment_submission_mutation() returns trigger language plpgsql set search_path='' as $$ begin raise exception 'submitted assessment evidence is immutable' using errcode='55000'; end $$;
create trigger assessment_submissions_immutable before update or delete on public.assessment_submissions for each row execute function public.prevent_assessment_submission_mutation();

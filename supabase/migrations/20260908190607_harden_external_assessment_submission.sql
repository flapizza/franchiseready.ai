-- Candidate-controlled evidence is distinct from trusted analysis. No unsafe overload survives.
drop function if exists public.submit_assessment(text,jsonb,jsonb,jsonb,integer);
drop function if exists public.load_assessment_by_token(text);
drop function if exists public.save_assessment_progress(text,jsonb);

-- Contract snapshot is generated from the existing questionnaire, not a second scoring engine.
create or replace function private.assessment_response_contract() returns jsonb language sql immutable set search_path='' as $contract$ select '{"intakeFields":["firstName","preferredName","lastName","email","mobilePhone","streetAddress","addressLine2","city","stateProvince","postalCode","country","occupationTitle","currentEmployer","linkedInProfile","ownedBusinessBefore","ownershipExperience","exploredFranchiseBefore","preferredContactMethod","bestContactTime"],"intakeEnums":{"ownedBusinessBefore":["yes","no"],"exploredFranchiseBefore":["yes","no"],"preferredContactMethod":["phone","text","email"],"bestContactTime":["morning","afternoon","evening"]},"responses":{"q1":{"kind":"multi","options":["Build long-term wealth","Replace or exceed my current income","Gain greater control over my career","Create more flexibility in my life","Build an asset I could eventually sell","Create opportunities for my family","Make a greater impact in my community","Diversify my income or investments","Leave corporate employment","Put my experience and skills to work for myself","Build something I can be proud of","I''m still figuring that out"],"exclusive":["I''m still figuring that out"]},"q2":{"kind":"single","primaryOf":"q1"},"q3":{"kind":"multi","options":["I''m earning the income I wanted","I''ve built meaningful business equity","I have greater control over my schedule","I''ve built a strong team","The business can operate without me handling everything","I''ve expanded into additional territories, locations, or revenue streams","I''m doing work I find meaningful","My family has greater financial security","I''ve created something I could eventually sell","I have more control over the direction of my career"]},"q4":{"kind":"single","options":["Not important","Somewhat important","Important","Very important","Essential"]},"q5":{"kind":"single","options":["Closely involved in day-to-day operations","Lead the team while remaining involved in key operations","Spend most of my time developing customers and growing the business","Build a management team that handles most daily operations","Ultimately provide strategic oversight rather than manage daily activity","I''m not sure yet"]},"q6":{"kind":"single","options":["I''d welcome it if I were building something of my own","I''d be comfortable with it for a defined period","I''d accept it, but work-life balance would remain important","I''d be reluctant to make that tradeoff","That would probably make the opportunity unattractive"]},"q7":{"kind":"single","options":["I want clear ownership and prefer to be personally accountable for the outcome","I naturally organize people and resources around the objective","I establish the process and monitor execution","I focus on the highest-impact pieces and delegate the rest","I prefer shared responsibility rather than carrying the result personally"]},"q8":{"kind":"single","options":["Step in and handle the work myself","Clarify expectations and coach them toward improvement","Ask questions to understand what''s preventing performance","Give them additional time to solve the problem independently","Reassign the responsibility to someone better suited","Begin considering whether they''re the right person for the role"]},"q9":{"kind":"multi","options":["Developing employees","Building customer relationships","Finding new customers","Negotiating","Improving processes","Managing financial performance","Solving difficult problems","Developing strategy","Managing projects","Recruiting and hiring","Networking","Leading managers","Working directly with customers","Analyzing performance data"]},"q10":{"kind":"multi","options":["Developing employees","Building customer relationships","Finding new customers","Negotiating","Improving processes","Managing financial performance","Solving difficult problems","Developing strategy","Managing projects","Recruiting and hiring","Networking","Leading managers","Working directly with customers","Analyzing performance data"]},"q11":{"kind":"single","options":["Understand the reasoning and consider whether I should adjust","Compare the feedback against the results I''m getting","Try the recommendation before deciding whether I agree","Listen, but generally trust my own judgment","Resist changing something I believe is already working"]},"q12":{"kind":"single","options":["Follow the system as designed until I understand it thoroughly","Follow it while discussing my idea with the franchisor","Ask experienced franchisees how they handle it","Test my idea carefully while monitoring results","Use my approach if I''m confident it will perform better"]},"q13":{"kind":"single","options":["Very uncomfortable","Somewhat uncomfortable","Neutral","Comfortable","Very comfortable"]},"q14":{"kind":"single","options":["Energized by it","Comfortable with it","Willing because it''s necessary","I''d do it but want to delegate it as soon as practical","I''d strongly prefer a business that doesn''t depend on me doing that"]},"q15":{"kind":"multi","options":["Networking and referrals","Building long-term professional relationships","Consultative/solution selling","Presenting to groups","One-on-one consumer sales","Digital/online lead follow-up","Community involvement","Strategic partnerships","Managing a sales team","Negotiating and closing","None particularly appeal to me"],"exclusive":["None particularly appeal to me"]},"q16":{"kind":"single","options":["Give them space and wait","Ask questions to understand what''s holding them back","Continue following up periodically","Provide information addressing their concerns","Ask directly what would need to happen for them to move forward","Focus my attention on more immediate opportunities"]},"q17":{"kind":"single","options":["Very uncomfortable","Somewhat uncomfortable","Neutral","Comfortable","Very comfortable"]},"q18":{"kind":"single","options":["Build one strong business that provides excellent income","Build one business first and decide about expansion later","Develop multiple territories or locations over time","Build an organization led by managers","Build a business or portfolio I could eventually sell","I''m not sure yet"]},"q19":{"kind":"single","options":["Continue researching until most uncertainty is eliminated","Define the important criteria and evaluate the evidence","Speak with people who have already made a similar decision","Trust my judgment once I have enough information","Wait until circumstances make the decision clearer","Walk away unless I feel highly certain"]},"q20":{"kind":"multi","options":["Detailed financial analysis","Understanding downside risk","Talking with people who have already done it","Advice from trusted professionals","Understanding the operating model","Evidence of successful outcomes","Having adequate cash reserves","My own experience and judgment","Support from spouse/partner/family"]},"q21":{"kind":"single","primaryOf":"q20"},"q22":{"kind":"single","options":["Analyze what happened and adjust my approach","Follow up later while immediately moving to other opportunities","Ask for feedback about why I lost","Increase my effort on the next opportunity","Take some time to recover before re-engaging","Question whether I''m approaching the market correctly"]},"q23":{"kind":"single","options":["Study the numbers, identify the problem and adjust","Increase activity and work through it","Seek advice from the franchisor or experienced operators","Reconsider assumptions behind the business plan","Become concerned about whether I made the right decision","Give the strategy more time before changing anything"]},"q24":{"kind":"single","options":["Prefer predictability even if it limits upside","Accept modest risk when the downside is well understood","Comfortable with calculated risk when opportunity justifies it","Comfortable with significant uncertainty when I believe in the upside","Tend to act on opportunities before all information is available"]},"q25":{"kind":"multi","options":["Businesses and executives","Individual consumers","Families","Children","Seniors","Homeowners","Professional practices","Local small businesses","Large companies","No strong preference"],"exclusive":["No strong preference"]},"q26":{"kind":"multi","options":["Home-based or remote","Professional office","Retail storefront","Service business operating in the field","Industrial/warehouse","Mobile business","Health/wellness","Food/hospitality","No strong preference"],"exclusive":["No strong preference"]},"q27":{"kind":"single","options":["Enjoy building and leading larger teams","Comfortable managing a moderate-sized team","Prefer a small professional team","Prefer as few employees as practical","Prefer managing managers rather than frontline employees","I''m not sure"]},"q28":{"kind":"multi","options":["Professional salaried employees","Salespeople","Skilled technicians","Hourly employees","Part-time employees","Managers","High-turnover workforces","I strongly prefer a low-employee model"],"exclusive":["I strongly prefer a low-employee model"]},"q29":{"kind":"multi","options":["Primarily weekday/business hours","Ability to work from home","Limited evenings","Limited weekends","Ability to travel periodically","Flexibility around family commitments","I''m comfortable working whenever the business requires it","Schedule isn''t a major consideration"],"exclusive":["Schedule isn''t a major consideration"]},"q30":{"kind":"single","options":["Selling would remain a major part of my role","Remain involved in important sales","Some selling is fine","Want most selling handled by employees","Strongly prefer little owner selling"]},"q31":{"kind":"multi","options":["Large number of employees","Significant owner selling","Retail hours","Nights/weekends","High fixed overhead","Large physical location","Heavy inventory","Significant travel","Highly seasonal revenue","Long ramp before meaningful income","Highly transactional customer relationships","Complex operations","None automatically rule an opportunity out"],"exclusive":["None automatically rule an opportunity out"]},"q32":{"kind":"single","options":["Under $100,000","$100,000–$249,999","$250,000–$499,999","$500,000–$999,999","$1,000,000–$1,999,999","$2,000,000–$4,999,999","$5,000,000+","Prefer to discuss with my consultant"]},"q33":{"kind":"single","options":["Under $25,000","$25,000–$49,999","$50,000–$99,999","$100,000–$149,999","$150,000–$249,999","$250,000–$499,999","$500,000–$999,999","$1,000,000+","Prefer to discuss with my consultant"]},"q34":{"kind":"multi","options":["Under $50,000","$50,000–$99,999","$100,000–$149,999","$150,000–$249,999","$250,000–$499,999","$500,000–$749,999","$750,000–$999,999","$1,000,000+","I need more guidance before setting an investment range"],"exclusive":["I need more guidance before setting an investment range"]},"q35":{"kind":"single","options":["Less than 3 months","3–6 months","6–12 months","12–18 months","18–24 months","More than 24 months","I''m not sure"]},"q36-geography":{"kind":"single","options":["Need to remain near my current location","Open to a broader local/regional territory","Open to serving a large territory","Open to remote/home-based ownership","Willing to relocate","Have specific requirements to discuss"]},"q36-stakeholders":{"kind":"multi","options":["Spouse/partner","Family","Business partner","Financial advisor/accountant","Attorney","Lender","Other trusted advisor","Decision is primarily mine"],"exclusive":["Decision is primarily mine"]},"q36-stage":{"kind":"single","options":["Exploring whether ownership is right for me","Committed to ownership but evaluating paths","Actively researching franchises","Comparing specific opportunities","Prepared to move forward when I find the right one","Already working on financial/funding preparation"]},"concerns":{"kind":"multi","options":["Losing financial security","Making the wrong investment","Generating enough customers","Managing employees","Replacing my income","Learning an unfamiliar business","Having enough time for family/personal life","Being personally responsible for the outcome","Following someone else''s franchise system","Financing the investment","Choosing the wrong franchise","I don''t have a major concern right now"],"exclusive":["I don''t have a major concern right now"]},"primary-concern":{"kind":"single","primaryOf":"concerns"}},"concernExclusive":"I don''t have a major concern right now"}'::jsonb $contract$;
revoke all on function private.assessment_response_contract() from public,anon,authenticated;

create or replace function private.validate_assessment_progress(payload jsonb, final_submission boolean default false)
returns boolean language plpgsql immutable set search_path='' as $$
declare k text; v jsonb; rule jsonb; allowed jsonb; item jsonb; contract jsonb := private.assessment_response_contract();
begin
 if validate_assessment_progress.payload is null or jsonb_typeof(validate_assessment_progress.payload)<>'object' or octet_length(validate_assessment_progress.payload::text)>32000
 or (select array_agg(key order by key) from jsonb_object_keys(validate_assessment_progress.payload) key) is distinct from array['answers','consent','intake','section','stage','startedAt']
 or coalesce(validate_assessment_progress.payload->>'stage','') not in ('intake','intro','assessment','concerns')
 or jsonb_typeof(validate_assessment_progress.payload->'section')<>'number' or (validate_assessment_progress.payload->>'section') !~ '^[1-6]$'
 or jsonb_typeof(validate_assessment_progress.payload->'consent')<>'boolean' or jsonb_typeof(validate_assessment_progress.payload->'startedAt')<>'string'
 or length(validate_assessment_progress.payload->>'startedAt')>40 or jsonb_typeof(validate_assessment_progress.payload->'intake')<>'object' or jsonb_typeof(validate_assessment_progress.payload->'answers')<>'object' then return false; end if;
 perform (validate_assessment_progress.payload->>'startedAt')::timestamptz;
 for k,v in select * from jsonb_each(validate_assessment_progress.payload->'intake') loop
  if not (contract->'intakeFields' ? k) or jsonb_typeof(v)<>'string' or length(v #>> '{}')>500 then return false; end if;
  if contract->'intakeEnums' ? k and not (contract->'intakeEnums'->k @> jsonb_build_array(v)) then return false; end if;
 end loop;
 for k,v in select * from jsonb_each(validate_assessment_progress.payload->'answers') loop
  rule := contract->'responses'->k;
  if rule is null or jsonb_typeof(v)<>'array' or jsonb_array_length(v)>20 then return false; end if;
  if rule->>'kind'='single' and jsonb_array_length(v)>1 then return false; end if;
  if (select count(*) from jsonb_array_elements(v))<>(select count(distinct x) from jsonb_array_elements(v) x) then return false; end if;
  allowed := case when rule ? 'primaryOf' then validate_assessment_progress.payload->'answers'->(rule->>'primaryOf') else rule->'options' end;
  for item in select * from jsonb_array_elements(v) loop
   if jsonb_typeof(item)<>'string' or allowed is null or not (allowed @> jsonb_build_array(item)) then return false; end if;
   if jsonb_array_length(v)>1 and coalesce(rule->'exclusive' @> jsonb_build_array(item),false) then return false; end if;
  end loop;
 end loop;
 if validate_assessment_progress.final_submission then
  if validate_assessment_progress.payload->'consent'<>'true'::jsonb then return false; end if;
  foreach k in array array['firstName','lastName','email','mobilePhone','streetAddress','city','stateProvince','postalCode','country','occupationTitle','ownedBusinessBefore','exploredFranchiseBefore','preferredContactMethod','bestContactTime'] loop
   if coalesce(btrim(validate_assessment_progress.payload->'intake'->>k),'')='' then return false; end if;
  end loop;
  if validate_assessment_progress.payload->'intake'->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then return false; end if;
  for k,rule in select * from jsonb_each(contract->'responses') loop
   if k='primary-concern' and validate_assessment_progress.payload->'answers'->'concerns'=jsonb_build_array(contract->>'concernExclusive') then continue; end if;
   if rule ? 'primaryOf' and validate_assessment_progress.payload->'answers'->(rule->>'primaryOf')='["I''m still figuring that out"]'::jsonb then continue; end if;
   if coalesce(jsonb_array_length(validate_assessment_progress.payload->'answers'->k),0)=0 then return false; end if;
  end loop;
 end if;
 return true;
exception when others then return false;
end $$;
revoke all on function private.validate_assessment_progress(jsonb,boolean) from public,anon,authenticated;

create function public.load_assessment_by_token(presented_token_hash text)
returns jsonb language sql security definer set search_path='' as $$
 select jsonb_build_object('public_id',s.public_id,'status',s.status,'last_saved_at',s.last_saved_at,
  'completed_at',s.completed_at,'progress_snapshot',case when s.status<>'analyzed' then s.progress_snapshot end,
  'candidate_analysis',case when s.status='analyzed' then jsonb_build_object(
   'ownershipProfile',a.analysis_snapshot->'ownershipProfile','financial',a.analysis_snapshot->'financial',
   'instrumentVersion',a.analysis_snapshot->'instrumentVersion','analysisVersion',a.analysis_snapshot->'analysisVersion') end)
 from public.assessment_sessions s left join public.assessment_analyses a on a.session_id=s.id and a.superseded_at is null
 where s.token_hash=load_assessment_by_token.presented_token_hash and load_assessment_by_token.presented_token_hash~'^[0-9a-f]{64}$'
 and s.revoked_at is null and s.expires_at>now() and s.status in ('created','invited','in-progress','analyzed')
$$;
revoke all on function public.load_assessment_by_token(text) from public,anon,authenticated;
grant execute on function public.load_assessment_by_token(text) to anon,authenticated;

create function public.save_assessment_progress(presented_token_hash text, progress_snapshot jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not private.validate_assessment_progress(save_assessment_progress.progress_snapshot,false) then raise exception 'invalid assessment progress' using errcode='22023'; end if;
 update public.assessment_sessions s set progress_snapshot=save_assessment_progress.progress_snapshot,
 current_section=(save_assessment_progress.progress_snapshot->>'section')::smallint,status='in-progress',
 started_at=coalesce(s.started_at,now()),last_saved_at=now(),updated_at=now()
 where s.token_hash=save_assessment_progress.presented_token_hash and s.revoked_at is null and s.expires_at>now() and s.status in ('created','invited','in-progress');
 if not found then raise exception 'assessment unavailable' using errcode='42501'; end if;
 return public.load_assessment_by_token(save_assessment_progress.presented_token_hash);
end $$;
revoke all on function public.save_assessment_progress(text,jsonb) from public,anon,authenticated;
grant execute on function public.save_assessment_progress(text,jsonb) to anon,authenticated;

create or replace function public.finalize_assessment_trusted(presented_token_hash text, candidate_progress jsonb, authoritative_analysis jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare s public.assessment_sessions; sub public.assessment_submissions;
begin
 if not private.validate_assessment_progress(finalize_assessment_trusted.candidate_progress,true) then raise exception 'invalid assessment submission' using errcode='22023'; end if;
 select session.* into s from public.assessment_sessions session where session.token_hash=finalize_assessment_trusted.presented_token_hash for update;
 if s.id is null or s.revoked_at is not null or s.expires_at<=now() then raise exception 'assessment unavailable' using errcode='42501'; end if;
 if s.status='analyzed' then
  select * into sub from public.assessment_submissions where session_id=s.id;
  if sub.intake_snapshot is distinct from finalize_assessment_trusted.candidate_progress->'intake' or sub.response_snapshot is distinct from finalize_assessment_trusted.candidate_progress->'answers' then
   raise exception 'submitted assessment evidence is immutable' using errcode='55000';
  end if;
  return public.load_assessment_by_token(finalize_assessment_trusted.presented_token_hash);
 end if;
 if s.status not in ('created','invited','in-progress') then raise exception 'assessment unavailable' using errcode='42501'; end if;
 if jsonb_typeof(finalize_assessment_trusted.authoritative_analysis) is distinct from 'object' or finalize_assessment_trusted.authoritative_analysis->>'version' is distinct from 'franchise-ownership-v1'
 or finalize_assessment_trusted.authoritative_analysis->>'analysisVersion' is distinct from '2' or jsonb_typeof(finalize_assessment_trusted.authoritative_analysis->'ownershipProfile') is distinct from 'object'
 or jsonb_typeof(finalize_assessment_trusted.authoritative_analysis->'consultantBrief') is distinct from 'object' then raise exception 'trusted analysis required' using errcode='22023'; end if;
 insert into public.assessment_submissions(session_id,organization_id,instrument_version,intake_snapshot,response_snapshot)
 values(s.id,s.organization_id,s.instrument_version,finalize_assessment_trusted.candidate_progress->'intake',finalize_assessment_trusted.candidate_progress->'answers') returning * into sub;
 insert into public.assessment_analyses(session_id,submission_id,organization_id,instrument_version,analysis_version,analysis_snapshot)
 values(s.id,sub.id,s.organization_id,s.instrument_version,2,finalize_assessment_trusted.authoritative_analysis);
 update public.assessment_sessions set status='analyzed',progress_snapshot=null,started_at=coalesce(started_at,now()),submitted_at=now(),completed_at=now(),last_saved_at=now(),updated_at=now() where id=s.id;
 return public.load_assessment_by_token(finalize_assessment_trusted.presented_token_hash);
end $$;
revoke all on function public.finalize_assessment_trusted(text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.finalize_assessment_trusted(text,jsonb,jsonb) to service_role;

-- Serialize normal intake retries without broadening visibility or changing duplicate policy.
create or replace function public.create_assessment_candidate(target_organization_id uuid, proposed_first_name text, proposed_last_name text, proposed_email text, proposed_phone text)
returns setof public.candidates language plpgsql security invoker set search_path='' as $$
declare actor uuid; normalized text := lower(btrim(create_assessment_candidate.proposed_email)); matches integer;
begin
 actor := public.current_active_membership_id(create_assessment_candidate.target_organization_id);
 if actor is null then raise exception 'workspace unavailable' using errcode='42501'; end if;
 if coalesce(btrim(create_assessment_candidate.proposed_first_name),'')='' or coalesce(btrim(create_assessment_candidate.proposed_last_name),'')='' or coalesce(normalized,'') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'invalid candidate' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(create_assessment_candidate.target_organization_id::text||':'||normalized,190607));
 select count(*) into matches from public.candidates where organization_id=create_assessment_candidate.target_organization_id and lower(btrim(email))=normalized and archived_at is null;
 if matches>1 then raise exception 'candidate identity requires review' using errcode='22023'; end if;
 if matches=1 then return query select * from public.candidates where organization_id=create_assessment_candidate.target_organization_id and lower(btrim(email))=normalized and archived_at is null; return; end if;
 return query insert into public.candidates(organization_id,assigned_membership_id,created_by_membership_id,first_name,last_name,email,phone,status,pipeline_stage_id)
 values(create_assessment_candidate.target_organization_id,actor,actor,btrim(create_assessment_candidate.proposed_first_name),btrim(create_assessment_candidate.proposed_last_name),normalized,nullif(btrim(create_assessment_candidate.proposed_phone),''),'active','lead') returning *;
end $$;
revoke all on function public.create_assessment_candidate(uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.create_assessment_candidate(uuid,text,text,text,text) to authenticated;

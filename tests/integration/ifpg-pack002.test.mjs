import '../fixtures/register-typescript.mjs';import test from 'node:test';import assert from 'node:assert/strict';import{execFileSync}from'node:child_process';import{createClient}from'@supabase/supabase-js';
const {SupabaseConsultantScheduleRepository}=await import('../../feature/tasks/repositories/SupabaseConsultantScheduleRepository.ts');
const {SupabaseCandidateRepository}=await import('../../feature/crm/repositories/SupabaseCandidateRepository.ts');
const {TaskService}=await import('../../feature/tasks/services/TaskService.ts');
const {CalendarService}=await import('../../feature/calendar/services/CalendarService.ts');
const {TaskRuntime}=await import('../../feature/tasks/runtime/TaskRuntime.ts');
test('real local RLS: task and calendar CRUD, associations, foreign access, and atomic brand selection',async()=>{
 const status=JSON.parse(execFileSync('cmd.exe',['/d','/s','/c','npx supabase status --workdir .next-dev/checkpoint14a/local --output json'],{encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']}));assert.equal(new URL(status.API_URL).hostname,'127.0.0.1');
 const options={auth:{persistSession:false,autoRefreshToken:false}},owner=createClient(status.API_URL,status.ANON_KEY,options),foreign=createClient(status.API_URL,status.ANON_KEY,options);
 const login=await owner.auth.signInWithPassword({email:'ifpg001-local-owner@example.test',password:'Local-IFPG-2026-only!'});assert.equal(login.error,null);
 assert.equal((await foreign.auth.signInWithPassword({email:'assessment-other@example.test',password:'Local-assessment-only-2026!'})).error,null);
 const membership=await owner.from('organization_memberships').select('id,organization_id').eq('user_id',login.data.user.id).single();assert.equal(membership.error,null);
 const ctx={organization:{id:membership.data.organization_id},membership:{id:membership.data.id}};
 const repo=new SupabaseConsultantScheduleRepository(owner,ctx),candidateRepo=new SupabaseCandidateRepository(owner,ctx),tasks=new TaskService(repo,candidateRepo),calendar=new CalendarService(repo,candidateRepo);
 const candidates=await candidateRepo.getAll(),candidate=candidates.find(c=>c.firstName==='Daniel');assert.ok(candidate);let task,event;
 try{
  task=await tasks.create(ctx.membership.id,{title:'Pack002 integration task',candidateId:candidate.id,dueAt:'2026-09-09T15:00:00Z',priority:'high'});
  assert.equal((await repo.getById(task.taskId)).title,task.title);
  assert.equal((await new TaskRuntime(repo,candidateRepo).build(ctx.membership.id,new Date('2026-09-10T15:00:00Z'))).tasks.find(t=>t.taskId===task.taskId).overdue,true);
  await tasks.update(ctx.membership.id,task.taskId,{title:'Updated task',candidateId:candidate.id,dueAt:'2026-09-11T15:00:00Z',priority:'normal'});await tasks.complete(ctx.membership.id,task.taskId);assert.equal((await repo.getById(task.taskId)).status,'completed');await tasks.reopen(ctx.membership.id,task.taskId);assert.equal((await repo.getById(task.taskId)).status,'open');
  event=await calendar.create(ctx.membership.id,{title:'Pack002 integration meeting',candidateId:candidate.id,startAt:'2026-09-11T16:00:00Z',endAt:'2026-09-11T17:00:00Z',timezone:'America/New_York'});
  await calendar.update(ctx.membership.id,event.id,{title:'Updated meeting',candidateId:candidate.id,startAt:'2026-09-11T17:00:00Z',endAt:'2026-09-11T18:00:00Z',timezone:'America/New_York'});assert.equal((await repo.getEvent(event.id)).title,'Updated meeting');await calendar.transition(ctx.membership.id,event.id,'cancelled');assert.equal((await repo.getEvent(event.id)).status,'cancelled');
  for(const table of ['consultant_tasks','consultant_calendar_events','candidate_brand_considerations','assessment_submissions','assessment_analyses','discovery_sessions','discovery_observations']){const r=await foreign.from(table).select('*').eq('organization_id',ctx.organization.id);assert.equal(r.error,null);assert.deepEqual(r.data,[],table);}
  const forged=new SupabaseConsultantScheduleRepository(foreign,ctx);await assert.rejects(()=>forged.save({...task,taskId:'forged-'+crypto.randomUUID()}));assert.equal(await forged.getById(task.taskId),null);
  const {data:brands}=await owner.from('brand_identities').select('public_id').limit(2);assert.equal(brands.length,2);
  for(const b of brands){const r=await owner.rpc('set_candidate_brand_consideration',{target_candidate:candidate.id,target_brand:b.public_id,next_state:'selected'});assert.equal(r.error,null);}
  const selections=await owner.from('candidate_brand_considerations').select('*').eq('candidate_public_id',candidate.id).eq('state','selected');assert.equal(selections.data.length,1);assert.equal(selections.data[0].brand_public_id,brands[1].public_id);
  assert.ok((await foreign.rpc('set_candidate_brand_consideration',{target_candidate:candidate.id,target_brand:brands[0].public_id,next_state:'selected'})).error);
  await repo.delete(task.taskId);task=null;await repo.deleteEvent(event.id);event=null;
 }finally{if(task)await repo.delete(task.taskId);if(event)await repo.deleteEvent(event.id);await owner.from('candidate_brand_considerations').delete().eq('candidate_public_id',candidate.id).eq('organization_id',ctx.organization.id);await owner.auth.signOut();await foreign.auth.signOut();}
});

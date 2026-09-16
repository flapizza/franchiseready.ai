import '../fixtures/register-typescript.mjs';
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { randomUUID, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const { ConferenceAssessmentAnalysisService } = await import('../../feature/assessment-engine/conference/ConferenceAssessmentAnalysisService.ts');
const { TrustedAssessmentSubmission } = await import('../../feature/assessment-engine/production/TrustedAssessmentSubmission.ts');
const { SupabaseAssessmentRepository } = await import('../../feature/assessment-engine/production/SupabaseAssessmentRepository.ts');
const { personaIntake, baselineAnswers } = await import('../fixtures/conference-assessment-personas.mjs');

// Fixed local Docker target; no environment files, hosted URLs, or credentials.
// Clone schema only into a disposable database. Never copy local person data.
const container = 'supabase_db_franchiseready-web';
const database = `assessment_foundation_${randomUUID().replaceAll('-', '')}`;
const org = randomUUID(), otherOrg = randomUUID(), member = randomUUID(), otherMember = randomUUID();
const user = randomUUID(), otherUser = randomUUID(), hiddenUser = randomUUID(), hiddenMember = randomUUID();
const q = value => value == null ? 'null' : `'${String(value).replaceAll("'", "''")}'`;
const json = value => `${q(JSON.stringify(value))}::jsonb`;
const args = (db, owner = 'postgres') => ['exec', '-i', container, 'psql', '-X', '-U', owner, '-d', db, '-v', 'ON_ERROR_STOP=1', '-qAt'];
function execute(input, db = database, owner = 'postgres') {
  try { return execFileSync('docker', args(db,owner), { input, encoding: 'utf8', windowsHide: true, maxBuffer: 20e6, stdio: ['pipe', 'pipe', 'pipe'] }).trim(); }
  catch (error) { throw new Error(String(error.stderr || error.message)); }
}
const claims = actor => `set local role authenticated; set local request.jwt.claims=${q(JSON.stringify({sub:actor,role:'authenticated'}))};`;
function transaction(query, actor = user, role = 'authenticated') {
  return `\\set VERBOSITY verbose\nbegin; set local statement_timeout='8s'; ${role === 'authenticated' ? claims(actor) : role === 'service_role' ? 'set local role service_role;' : ''} ${query}; commit;`;
}
const value = output => JSON.parse(output.split('\n').filter(Boolean).at(-1));
const query = (sql, actor = user, role = 'authenticated') => value(execute(transaction(`select ${sql}`, actor, role)));
const hash = token => createHash('sha256').update(token).digest('hex');
const token = () => Buffer.from(randomUUID() + randomUUID()).toString('base64url').slice(0,43);
const progress = () => ({stage:'concerns',section:6,intake:{...personaIntake},answers:baselineAnswers(),consent:true,startedAt:'2026-09-16T12:00:00Z'});
const analysis = p => new ConferenceAssessmentAnalysisService().analyze(p.intake,p.answers);
function contact(options = {}) {
  const id = randomUUID(), email = options.email ?? `${id}@example.test`;
  const data = value(execute(`insert into public.contacts(organization_id,created_by_membership_id,assigned_membership_id,first_name,last_name,primary_email,primary_phone)
    values(${q(options.org ?? org)},${q(options.member ?? member)},${q(options.member ?? member)},'Explicit','Contact',${q(email)},${q(options.phone)}) returning row_to_json(contacts);`));
  return data;
}
function candidate(options = {}) {
  return value(execute(`insert into public.candidates(organization_id,created_by_membership_id,assigned_membership_id,first_name,last_name,email,phone)
    values(${q(options.org ?? org)},${q(options.member ?? member)},${q(options.member ?? member)},'Legacy','Candidate',${q(options.email ?? `${randomUUID()}@example.test`)},${q(options.phone)}) returning row_to_json(candidates);`));
}
const inviteSql = (p,t,expected = null) => `public.create_contact_assessment_invitation(${q(p.public_id)},${q(hash(t))},now()+interval '14 days',${q(expected)})`;
const invite = (p,t = token(),expected = null) => ({t,s:query(inviteSql(p,t,expected))});
const finalizeSql = (t,p = progress()) => `public.finalize_assessment_trusted(${q(hash(t))},${json(p)},${json(analysis(p))})`;
const finish = (t,p) => query(finalizeSql(t,p),user,'service_role');
const session = id => value(execute(`select row_to_json(s) from public.assessment_sessions s where id=${q(id)};`));
const count = (table,where) => Number(execute(`select count(*) from public.${table} where ${where};`));
function concurrent(sql, actor=user, role='authenticated', hold=false) {
  return new Promise(resolve => {
    const child = spawn('docker', args(database), {windowsHide:true,stdio:['pipe','pipe','pipe']});
    let stdout='',stderr=''; child.stdout.on('data',data=>stdout+=data); child.stderr.on('data',data=>stderr+=data);
    child.on('error',error=>resolve({error:String(error)}));
    child.on('close',code=>resolve(code ? {error:stderr} : {output:stdout.trim()}));
    child.stdin.end(transaction(`select ${sql}${hold ? '; select pg_sleep(0.25)' : ''}`,actor,role));
  });
}
// Exercise repository and trusted-service code against real RPC SQL and role grants.
const client = role => ({rpc: async (name, parameters) => {
  assert.match(name,/^[a-z_]+$/);
  const fields=Object.entries(parameters).filter(([,v])=>v!==undefined).map(([k,v])=>{
    assert.match(k,/^[a-z_]+$/); return `${k} => ${typeof v==='object' && v!==null ? json(v) : q(v)}`;
  }).join(',');
  try {
    const set = name==='create_assessment_invitation' || name==='get_candidate_assessment';
    const expression = set ? `(select coalesce(jsonb_agg(row_to_json(r)),'[]'::jsonb) from public.${name}(${fields}) r)` : name==='create_assessment_contact' ? `to_jsonb(public.${name}(${fields}))` : `public.${name}(${fields})`;
    const result=execute(transaction(`select ${expression}`,user,role));
    return {data:result ? value(result) : null,error:null};
  } catch(error) { return {data:null,error:{message:error.message,code:error.message.match(/ERROR:\s+(\w+):/)?.[1]}}; }
}});

before(() => {
  assert.match(database,/^assessment_foundation_[a-f0-9]{32}$/);
  const schema=execFileSync('docker',['exec',container,'pg_dump','-U','postgres','-d','postgres','--schema-only'],{encoding:'utf8',windowsHide:true,maxBuffer:30e6,stdio:['ignore','pipe','pipe']});
  execute(`create database ${database};`,'postgres');
  execute(schema,database,'supabase_admin');
  // A browser run may already have applied this migration to the local source DB.
  if (execute("select to_regprocedure('public.create_assessment_contact(uuid,text,text,text,text)') is not null;") !== 't')
    execute(readFileSync(new URL('../../supabase/migrations/20260916151344_assessment_contact_invitations.sql',import.meta.url),'utf8'));
  execute(`insert into auth.users(id,email) values(${q(user)},'foundation-owner@example.test'),(${q(otherUser)},'foundation-other@example.test'),(${q(hiddenUser)},'foundation-hidden@example.test');
    insert into public.organizations(id,name) values(${q(org)},'Foundation local'),(${q(otherOrg)},'Other local');
    insert into public.organization_memberships(id,organization_id,user_id,role,status) values
      (${q(member)},${q(org)},${q(user)},'consultant','active'),(${q(otherMember)},${q(otherOrg)},${q(otherUser)},'consultant','active'),(${q(hiddenMember)},${q(org)},${q(hiddenUser)},'consultant','active');`);
});
after(() => { execute(`drop database if exists ${database} with (force);`,'postgres'); });

test('candidate-bound A flow persists existing authoritative analysis and immutable evidence', () => {
  const c=candidate(),t=token(),p=progress();
  const s=query(`(select row_to_json(r) from public.create_assessment_invitation(${q(c.public_id)},${q(hash(t))},now()+interval '14 days') r)`);
  assert.equal(s.candidate_id,c.id);assert.equal(s.contact_id,null);
  assert.equal(finish(t,p).status,'analyzed');
  assert.equal(session(s.id).candidate_id,c.id);
  assert.deepEqual(value(execute(`select analysis_snapshot from public.assessment_analyses where session_id=${q(s.id)};`)),analysis(p));
});
test('contact repository creates explicit identity without a candidate or recoverable token', async () => {
  const p=contact(),t=token(),repo=new SupabaseAssessmentRepository(client('authenticated'),{organization:{id:org}});
  const s=await repo.createContactInvitation(p.public_id,hash(t),new Date(Date.now()+864e5).toISOString());
  assert.equal(s.contactId,p.public_id);assert.equal(s.candidateId,null);
  assert.equal((await repo.getForContact(p.public_id)).id,s.id);
  assert.equal(count('candidates',`contact_id=${q(p.id)}`),0);
  assert.equal(session(s.id).token_hash,hash(t));assert.equal(JSON.stringify(s).includes(hash(t)),false);
  assert.equal('token_hash' in query(`public.get_contact_assessment(${q(p.public_id)})`),false);
});
test('trusted service completion promotes explicit contact despite participant identity differences', async () => {
  const p=contact(),{t,s}=invite(p),answers=progress();
  const result=await new TrustedAssessmentSubmission(client('service_role')).complete(t,answers);
  assert.equal(result.ok,true);assert.equal(result.id,s.public_id);
  const c=value(execute(`select row_to_json(c) from public.candidates c where contact_id=${q(p.id)};`));
  assert.equal(c.email,p.primary_email);assert.notEqual(c.email,answers.intake.email);
  assert.equal(c.first_name,p.first_name);assert.equal(session(s.id).candidate_id,c.id);
  assert.equal(count('assessment_submissions',`session_id=${q(s.id)}`),1);
  assert.equal(count('assessment_analyses',`session_id=${q(s.id)}`),1);
  const saved=value(execute(`select row_to_json(p) from public.contacts p where id=${q(p.id)};`));
  assert.equal(saved.lifecycle_status,'active-candidate');assert.equal(saved.marketing_email_status,p.marketing_email_status);
});
test('completion reuses candidate explicitly promoted after invitation', () => {
  const p=contact(),{t,s}=invite(p);
  const id=query(`(select to_jsonb(candidate_public_id) from public.promote_contact_to_candidate(${q(p.public_id)}))`);
  assert.equal(query(`(select to_jsonb(id) from public.get_candidate_assessment(${q(id)}))`),s.id);
  finish(t);
  assert.equal(count('candidates',`contact_id=${q(p.id)}`),1);
  assert.equal(query(`public.get_contact_assessment(${q(p.public_id)})`).candidate_public_id,id);
});
test('already-linked contact invitation binds both identities consistently', () => {
  const p=contact();query(`(select to_jsonb(candidate_public_id) from public.promote_contact_to_candidate(${q(p.public_id)}))`);
  const {t,s}=invite(p);assert.ok(s.candidate_public_id);assert.ok(session(s.id).candidate_id);finish(t);
  assert.equal(count('candidates',`contact_id=${q(p.id)}`),1);
});
test('cross-tenant and inaccessible contact RPCs fail without revealing status', () => {
  const p=contact({org:otherOrg,member:otherMember}),hidden=contact({member:hiddenMember});
  for(const target of [p,hidden]) {
    assert.throws(()=>invite(target),/42501/);
    assert.equal(query(`coalesce(public.get_contact_assessment(${q(target.public_id)}),'null'::jsonb)`),null);
  }
  const c=candidate({org:otherOrg,member:otherMember});
  assert.throws(()=>query(`(select row_to_json(r) from public.create_assessment_invitation(${q(c.public_id)},${q(hash(token()))},now()+interval '1 day') r)`),/42501/);
});
test('schema rejects missing identity, cross-organization identity, and inconsistent dual binding', () => {
  const p=contact(),foreign=contact({org:otherOrg,member:otherMember}),c=candidate();
  for(const [cid,pid] of [[null,null],[null,foreign.id],[c.id,p.id]]) {
    assert.throws(()=>execute(`insert into public.assessment_sessions(organization_id,candidate_id,contact_id,owning_membership_id,created_by_membership_id,token_hash,expires_at)
      values(${q(org)},${q(cid)},${q(pid)},${q(member)},${q(member)},${q(hash(token()))},now()+interval '1 day');`),/identity|required|foreign key/);
  }
});
for (const mode of ['email','phone','ambiguous','inaccessible']) test(`legacy ${mode} conflict rolls back promotion and completion without silent association`, () => {
  const p=contact({phone:mode==='phone'?'(407) 555-0123':null});
  candidate({email:mode==='phone'?undefined:p.primary_email,phone:mode==='phone'?'4075550123':null,member:mode==='inaccessible'?hiddenMember:member});
  if(mode==='ambiguous')candidate({email:p.primary_email});
  const {t,s}=invite(p);
  assert.throws(()=>finish(t),/P0001:.*candidate identity requires review/);
  assert.equal(session(s.id).candidate_id,null);assert.equal(session(s.id).status,'invited');
  assert.equal(count('assessment_submissions',`session_id=${q(s.id)}`),0);
  assert.equal(count('candidates',`contact_id=${q(p.id)}`),0);
  assert.throws(()=>query(`(select to_jsonb(candidate_public_id) from public.promote_contact_to_candidate(${q(p.public_id)}))`),/P0001/);
});
test('matching identity in a different tenant cannot redirect or block explicit contact', () => {
  const p=contact();candidate({org:otherOrg,member:otherMember,email:p.primary_email});
  const {t,s}=invite(p);finish(t);assert.ok(session(s.id).candidate_id);
  assert.equal(count('candidates',`contact_id=${q(p.id)} and organization_id=${q(org)}`),1);
});
test('concurrent explicit promotion and completion converge on one candidate', async () => {
  const p=contact(),{t,s}=invite(p);
  const results=await Promise.all([concurrent(`(select to_jsonb(candidate_public_id) from public.promote_contact_to_candidate(${q(p.public_id)}))`,user,'authenticated',true),concurrent(finalizeSql(t),user,'service_role')]);
  for(const r of results)assert.equal(r.error,undefined,r.error);
  assert.equal(count('candidates',`contact_id=${q(p.id)}`),1);assert.ok(session(s.id).candidate_id);
});
test('concurrent identical completion persists exactly one submission and candidate', async () => {
  const p=contact(),{t,s}=invite(p),f=finalizeSql(t);
  const results=await Promise.all([concurrent(f,user,'service_role',true),concurrent(f,user,'service_role')]);
  for(const r of results)assert.equal(r.error,undefined,r.error);
  assert.equal(count('candidates',`contact_id=${q(p.id)}`),1);assert.equal(count('assessment_submissions',`session_id=${q(s.id)}`),1);
});
test('concurrent first invitations produce one active session and a stale-state error', async () => {
  const p=contact();const results=await Promise.all([concurrent(inviteSql(p,token()),user,'authenticated',true),concurrent(inviteSql(p,token()))]);
  assert.equal(results.filter(r=>!r.error).length,1);assert.match(results.find(r=>r.error).error,/40001/);
  assert.equal(count('assessment_sessions',`contact_id=${q(p.id)} and status='invited'`),1);
});
test('concurrent replacements require the same expected session and only one wins', async () => {
  const p=contact(),{s,t}=invite(p);query(`public.save_assessment_progress(${q(hash(t))},${json(progress())})`);
  const results=await Promise.all([concurrent(inviteSql(p,token(),s.id),user,'authenticated',true),concurrent(inviteSql(p,token(),s.id))]);
  assert.equal(results.filter(r=>!r.error).length,1);assert.match(results.find(r=>r.error).error,/40001/);
  assert.equal(count('assessment_sessions',`contact_id=${q(p.id)}`),2);
  assert.equal(session(s.id).status,'cancelled');assert.ok(session(s.id).progress_snapshot);
  assert.equal(query(`coalesce(public.load_assessment_by_token(${q(hash(t))}),'null'::jsonb)`),null);
});
test('replacement racing completion either completes old session or revokes it, never both', async () => {
  const p=contact(),{s,t}=invite(p);
  const results=await Promise.all([concurrent(finalizeSql(t),user,'service_role',true),concurrent(inviteSql(p,token(),s.id))]);
  assert.equal(results.filter(r=>!r.error).length,1);
  const current=session(s.id);
  assert.ok(['analyzed','cancelled'].includes(current.status));
  assert.equal(count('assessment_submissions',`session_id=${q(s.id)}`),current.status==='analyzed'?1:0);
});
test('completed history blocks new invitations via either explicit association', () => {
  const p=contact(),{s,t}=invite(p);finish(t);
  assert.throws(()=>invite(p,token(),s.id),/55000/);
  const c=query(`public.get_contact_assessment(${q(p.public_id)})`).candidate_public_id;
  assert.throws(()=>query(`(select row_to_json(r) from public.create_assessment_invitation(${q(c)},${q(hash(token()))},now()+interval '1 day',${q(s.id)}) r)`),/55000/);
  assert.equal(count('assessment_sessions',`contact_id=${q(p.id)}`),1);
  assert.throws(()=>execute(`update public.assessment_submissions set intake_snapshot='{}' where session_id=${q(s.id)};`),/immutable/);
});
test('expired and revoked tokens cannot load, save, or finalize', () => {
  for(const expired of [true,false]) {
    const p=contact(),{s,t}=invite(p);
    if(expired)execute(`update public.assessment_sessions set expires_at=now()-interval '1 second' where id=${q(s.id)};`);
    else query(`to_jsonb(public.revoke_contact_assessment_invitation(${q(p.public_id)}))`);
    assert.equal(query(`coalesce(public.load_assessment_by_token(${q(hash(t))}),'null'::jsonb)`),null);
    assert.throws(()=>query(`public.save_assessment_progress(${q(hash(t))},${json(progress())})`),/42501/);
    assert.throws(()=>finish(t),/42501/);
  }
});
test('identical retry returns the same result and changed answers cannot mutate evidence', () => {
  const p=contact(),{s,t}=invite(p),answers=progress();const first=finish(t,answers);
  assert.deepEqual(finish(t,answers),first);
  const changed=progress();changed.intake.firstName='Changed';
  assert.throws(()=>finish(t,changed),/55000/);
  assert.equal(count('assessment_submissions',`session_id=${q(s.id)}`),1);
});
test('anonymous/authenticated callers cannot finalize, promote anonymously, or invoke private helpers', () => {
  const p=contact(),{t}=invite(p);
  assert.throws(()=>query(finalizeSql(t)),/42501/);
  assert.throws(()=>execute(`set role anon; select ${finalizeSql(t)};`),/permission denied/);
  assert.throws(()=>execute(`set role anon; select * from public.promote_contact_to_candidate(${q(p.public_id)});`),/permission denied/);
  assert.throws(()=>query(`to_jsonb(private.assessment_candidate_for_contact(${q(p.id)},${q(member)}))`),/42501/);
});
test('public response contains only candidate-safe analysis and no person linkage or consultant brief', () => {
  const p=contact(),{t}=invite(p);const result=finish(t);
  for(const key of ['candidate_id','contact_id','organization_id','token_hash','analysis_snapshot'])assert.equal(key in result,false);
  assert.equal('consultantBrief' in result.candidate_analysis,false);
  assert.deepEqual(Object.keys(result.candidate_analysis).sort(),['analysisVersion','financial','instrumentVersion','ownershipProfile']);
});
test('contact reassignment after invitation fails safely and does not promote', () => {
  const p=contact(),{t,s}=invite(p);execute(`update public.contacts set assigned_membership_id=${q(hiddenMember)} where id=${q(p.id)};`);
  assert.throws(()=>finish(t),/P0001/);assert.equal(session(s.id).candidate_id,null);
});
test('existing candidate repository supports create, status, and replacement without changing public IDs', async () => {
  const c=candidate(),repo=new SupabaseAssessmentRepository(client('authenticated'),{organization:{id:org}});
  const expires=new Date(Date.now()+864e5).toISOString(),t=token();
  const first=await repo.createInvitation(c.public_id,hash(t),expires);
  assert.equal(first.candidateId,c.public_id);
  const second=await repo.createInvitation(c.public_id,hash(token()),expires,first.id);
  assert.notEqual(second.id,first.id);assert.equal((await repo.getForCandidate(c.public_id)).id,second.id);
  await assert.rejects(()=>repo.createInvitation(c.public_id,hash(token()),expires,first.id),error=>error.code==='40001');
  assert.equal(session(first.id).status,'cancelled');
});
test('contact repository exposes typed stale replacement conflict and explicit revocation', async () => {
  const p=contact(),repo=new SupabaseAssessmentRepository(client('authenticated'),{organization:{id:org}}),expires=new Date(Date.now()+864e5).toISOString();
  const first=await repo.createContactInvitation(p.public_id,hash(token()),expires);
  await assert.rejects(()=>repo.createContactInvitation(p.public_id,hash(token()),expires),error=>error.code==='40001');
  const second=await repo.createContactInvitation(p.public_id,hash(token()),expires,first.id);
  await repo.revokeForContact(p.public_id);assert.equal(session(second.id).status,'cancelled');
});
test('schema prevents reassociating an issued session or submitting without a candidate', () => {
  const p=contact(),other=contact(),{s}=invite(p),foreign=candidate({org:otherOrg,member:otherMember});
  for(const assignment of [`contact_id=${q(other.id)}`,`candidate_id=${q(foreign.id)}`,`contact_id=null`,`status='analyzed'`,`token_hash=${q(hash(token()))}`])
    assert.throws(()=>execute(`update public.assessment_sessions set ${assignment} where id=${q(s.id)};`),/identity|candidate|constraint/);
});
test('invalid hash, expired invitation, and invalid authoritative analysis leave no partial promotion', () => {
  const p=contact();
  assert.throws(()=>query(`public.create_contact_assessment_invitation(${q(p.public_id)},'not-a-hash',now()+interval '1 day')`),/22023/);
  assert.throws(()=>query(`public.create_contact_assessment_invitation(${q(p.public_id)},${q(hash(token()))},now()-interval '1 day')`),/22023/);
  const {t,s}=invite(p);
  assert.throws(()=>query(`public.finalize_assessment_trusted(${q(hash(t))},${json(progress())},'{}'::jsonb)`,user,'service_role'),/22023/);
  assert.equal(count('candidates',`contact_id=${q(p.id)}`),0);assert.equal(session(s.id).status,'invited');
});
test('archived contact, missing email, and inactive issuing membership fail closed', () => {
  const missing=contact();execute(`update public.contacts set primary_email=null where id=${q(missing.id)};`);
  assert.throws(()=>invite(missing),/42501/);
  const p=contact(),{t}=invite(p);execute(`update public.contacts set archived_at=now() where id=${q(p.id)};`);
  assert.throws(()=>finish(t),/P0001/);
  const active=contact({member:hiddenMember}),t2=token();query(inviteSql(active,t2),hiddenUser);
  execute(`update public.organization_memberships set status='suspended' where id=${q(hiddenMember)};`);
  try { assert.throws(()=>finish(t2),/42501/); }
  finally { execute(`update public.organization_memberships set status='active' where id=${q(hiddenMember)};`); }
});
test('multiple replacements in one transaction return the actual newest session', () => {
  const p=contact(),first=token(),second=token(),third=token();
  const current=value(execute(transaction(`
    select ${inviteSql(p,first)};
    select public.create_contact_assessment_invitation(${q(p.public_id)},${q(hash(second))},now()+interval '1 day',
      (public.get_contact_assessment(${q(p.public_id)})->>'id')::uuid);
    select public.create_contact_assessment_invitation(${q(p.public_id)},${q(hash(third))},now()+interval '1 day',
      (public.get_contact_assessment(${q(p.public_id)})->>'id')::uuid);
    select public.get_contact_assessment(${q(p.public_id)})`)));
  assert.equal(session(current.id).token_hash,hash(third));
  assert.equal(count('assessment_sessions',`contact_id=${q(p.id)} and status='invited'`),1);
});
test('completed candidate-bound history is found from its permanent contact', () => {
  const p=contact();const publicId=query(`(select to_jsonb(candidate_public_id) from public.promote_contact_to_candidate(${q(p.public_id)}))`);
  // Represents pre-migration candidate-bound history (without contact_id).
  const c=value(execute(`select row_to_json(c) from public.candidates c where public_id=${q(publicId)};`)),t=token();
  const s=value(execute(`insert into public.assessment_sessions(organization_id,candidate_id,owning_membership_id,created_by_membership_id,token_hash,expires_at)
    values(${q(org)},${q(c.id)},${q(member)},${q(member)},${q(hash(t))},now()+interval '1 day') returning row_to_json(assessment_sessions);`));
  finish(t);assert.equal(query(`public.get_contact_assessment(${q(p.public_id)})`).id,s.id);
  assert.throws(()=>invite(p,token(),s.id),/55000/);
});
test('normal same-email intake racing completion cannot create a duplicate person', async () => {
  const p=contact(),{t,s}=invite(p);
  const intake=`(select jsonb_agg(row_to_json(c)) from public.create_assessment_candidate(${q(org)},'Explicit','Contact',${q(p.primary_email)},'') c)`;
  const results=await Promise.all([concurrent(intake,user,'authenticated',true),concurrent(finalizeSql(t),user,'service_role')]);
  assert.equal(results[0].error,undefined,results[0].error);
  assert.equal(count('candidates',`organization_id=${q(org)} and lower(btrim(email))=${q(p.primary_email)}`),1);
  if(results[1].error) {
    assert.match(results[1].error,/P0001/);assert.equal(session(s.id).candidate_id,null);
    assert.equal(count('assessment_submissions',`session_id=${q(s.id)}`),0);
  } else assert.ok(session(s.id).candidate_id);
});
test('completed contact evidence is readable through candidate RLS and existing intelligence RPC', () => {
  const p=contact(),{t,s}=invite(p);finish(t);
  const id=query(`public.get_contact_assessment(${q(p.public_id)})`).candidate_public_id;
  const data=query(`(select row_to_json(r) from public.get_candidate_assessment(${q(id)}) r)`);
  assert.deepEqual(data.analysis_snapshot,analysis(progress()));
  assert.equal(query(`(select to_jsonb(count(*)) from public.assessment_submissions where session_id=${q(s.id)})`),1);
  assert.equal(query(`(select to_jsonb(count(*)) from public.assessment_analyses where session_id=${q(s.id)})`,otherUser),0);
});
test('a linked candidate with diverged assignment cannot expose intelligence or accept completion', () => {
  const p=contact();query(`(select to_jsonb(candidate_public_id) from public.promote_contact_to_candidate(${q(p.public_id)}))`);
  const {t,s}=invite(p);
  execute(`begin; set local request.jwt.claims=${q(JSON.stringify({sub:user,role:'authenticated'}))};
    update public.candidates set assigned_membership_id=${q(hiddenMember)} where contact_id=${q(p.id)}; commit;`);
  assert.equal(query(`coalesce(public.get_contact_assessment(${q(p.public_id)}),'null'::jsonb)`),null);
  assert.throws(()=>finish(t),/P0001/);assert.equal(session(s.id).status,'invited');
  assert.throws(()=>query(`to_jsonb(public.revoke_contact_assessment_invitation(${q(p.public_id)}))`),/42501/);
  assert.equal(session(s.id).revoked_at,null);
});

test('observed A cannot authorize replacement of B, including when expectation is omitted', async () => {
  const c=candidate(),repo=new SupabaseAssessmentRepository(client('authenticated'),{organization:{id:org}});
  const expires=new Date(Date.now()+864e5).toISOString();
  const a=await repo.createInvitation(c.public_id,hash(token()),expires);
  const observed=(await repo.getForCandidate(c.public_id)).id;
  const b=await repo.createInvitation(c.public_id,hash(token()),expires,a.id);
  await assert.rejects(()=>repo.createInvitation(c.public_id,hash(token()),expires,observed),error=>error.code==='40001');
  await assert.rejects(()=>repo.createInvitation(c.public_id,hash(token()),expires),error=>error.code==='40001');
  assert.equal((await repo.getForCandidate(c.public_id)).id,b.id);
  assert.equal(session(b.id).status,'invited');assert.equal(session(b.id).revoked_at,null);
  assert.equal(count('assessment_sessions',`candidate_id=${q(c.id)}`),2);
});

test('contact status and revocation resolve the same legacy candidate-bound invitation', () => {
  const p=contact();const id=query(`(select to_jsonb(candidate_public_id) from public.promote_contact_to_candidate(${q(p.public_id)}))`);
  const c=value(execute(`select row_to_json(c) from public.candidates c where public_id=${q(id)};`)),t=token();
  const s=value(execute(`insert into public.assessment_sessions(organization_id,candidate_id,owning_membership_id,created_by_membership_id,token_hash,expires_at)
    values(${q(org)},${q(c.id)},${q(member)},${q(member)},${q(hash(t))},now()+interval '1 day') returning row_to_json(assessment_sessions);`));
  const unrelated=contact(),unrelatedInvitation=invite(unrelated);
  assert.equal(query(`public.get_contact_assessment(${q(p.public_id)})`).id,s.id);
  assert.throws(()=>query(`to_jsonb(public.revoke_contact_assessment_invitation(${q(p.public_id)}))`,otherUser),/42501/);
  assert.equal(session(s.id).revoked_at,null);
  query(`to_jsonb(public.revoke_contact_assessment_invitation(${q(p.public_id)}))`);
  assert.equal(session(s.id).status,'cancelled');assert.ok(session(s.id).revoked_at);
  assert.equal(session(unrelatedInvitation.s.id).revoked_at,null);
  assert.equal(query(`coalesce(public.load_assessment_by_token(${q(hash(t))}),'null'::jsonb)`),null);
  assert.throws(()=>query(`public.save_assessment_progress(${q(hash(t))},${json(progress())})`),/42501/);
  assert.throws(()=>finish(t),/42501/);
  query(`to_jsonb(public.revoke_contact_assessment_invitation(${q(p.public_id)}))`); // Repeat-safe acknowledgement.
  assert.equal(count('assessment_submissions',`session_id=${q(s.id)}`),0);
});

test('contact revocation fails explicitly when no invitation exists or history is completed', () => {
  const p=contact();assert.throws(()=>query(`to_jsonb(public.revoke_contact_assessment_invitation(${q(p.public_id)}))`),/42501/);
  const {t,s}=invite(p);finish(t);
  assert.throws(()=>query(`to_jsonb(public.revoke_contact_assessment_invitation(${q(p.public_id)}))`),/55000/);
  assert.equal(session(s.id).status,'analyzed');assert.equal(session(s.id).revoked_at,null);
});

for(const start of ['intake','completion']) test(`different-email same-phone intake/completion race (${start} started first) fails safely`, async () => {
  const phone=`407${String(Math.floor(Math.random()*1e7)).padStart(7,'0')}`;
  const p=contact({phone}),{t,s}=invite(p);
  const intake=`(select jsonb_agg(row_to_json(c)) from public.create_assessment_candidate(${q(org)},'Normal','Intake',${q(`${randomUUID()}@example.test`)},${q(`(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6)}`)}) c)`;
  const operations=start==='intake'
    ? [concurrent(intake,user,'authenticated',true),concurrent(finalizeSql(t),user,'service_role')]
    : [concurrent(finalizeSql(t),user,'service_role',true),concurrent(intake)];
  const results=await Promise.all(operations);
  assert.equal(results.filter(r=>!r.error).length,1,JSON.stringify(results));
  assert.match(results.find(r=>r.error).error,/(22023|P0001):.*candidate identity requires review/);
  assert.equal(count('candidates',`organization_id=${q(org)} and regexp_replace(coalesce(phone,''),'[^0-9]+','','g')=${q(phone)}`),1);
  const current=session(s.id);
  if(current.status==='analyzed') {
    assert.ok(current.candidate_id);assert.equal(count('candidates',`contact_id=${q(p.id)}`),1);
    assert.equal(count('assessment_submissions',`session_id=${q(s.id)}`),1);
  } else {
    assert.equal(current.status,'invited');assert.equal(current.candidate_id,null);
    assert.equal(count('candidates',`contact_id=${q(p.id)}`),0);
    assert.equal(count('assessment_submissions',`session_id=${q(s.id)}`),0);
    assert.equal(count('assessment_analyses',`session_id=${q(s.id)}`),0);
  }
});

test('normal intake retains normalized exact-email retry without overwriting identity', () => {
  const email=`${randomUUID()}@example.test`;
  const call=(first,e)=>`(select row_to_json(c) from public.create_assessment_candidate(${q(org)},${q(first)},'Intake',${q(e)},'') c)`;
  const first=query(call('Original',` ${email.toUpperCase()} `)),again=query(call('Different',email));
  assert.equal(first.id,again.id);assert.equal(again.first_name,'Original');assert.equal(again.contact_id,null);
  assert.equal(first.created_by_membership_id,member);assert.equal(first.assigned_membership_id,member);
});

test('normal intake rejects phone conflicts and inaccessible email matches without returning people', () => {
  const c=candidate({member:hiddenMember,phone:'4075557654'});
  for(const [email,phone] of [[c.email,''],[`${randomUUID()}@example.test`,'(407) 555-7654']]) {
    assert.throws(()=>query(`(select row_to_json(c) from public.create_assessment_candidate(${q(org)},'Normal','Intake',${q(email)},${q(phone)}) c)`),/22023:.*candidate identity requires review/);
  }
  assert.equal(count('candidates',`organization_id=${q(org)} and phone='4075557654'`),1);
});

test('normal intake still rejects foreign organizations, invalid input and anonymous callers', () => {
  const sql=orgId=>`(select row_to_json(c) from public.create_assessment_candidate(${q(orgId)},'Normal','Intake','valid@example.test','') c)`;
  assert.throws(()=>query(sql(otherOrg)),/42501/);
  assert.throws(()=>query(`(select row_to_json(c) from public.create_assessment_candidate(${q(org)},'Normal','Intake','invalid','') c)`),/22023/);
  assert.throws(()=>execute(`set role anon; select ${sql(org)};`),/permission denied/);
});

test('new-person invitation entry creates only a permanent contact and rejects repeated identity', async () => {
  const repo=new SupabaseAssessmentRepository(client('authenticated'),{organization:{id:org}});
  const input={firstName:'New',lastName:'Person',email:`${randomUUID()}@example.test`,phone:'4075558899'};
  const id=await repo.createContactForInvitation(input);
  const p=value(execute(`select row_to_json(p) from public.contacts p where public_id=${q(id)};`));
  assert.equal(p.lifecycle_status,'prospect');assert.equal(p.marketing_email_status,'unknown');
  assert.equal(count('candidates',`contact_id=${q(p.id)}`),0);
  await assert.rejects(()=>repo.createContactForInvitation(input),error=>error.code==='P0001');
  await assert.rejects(()=>repo.createContactForInvitation({...input,email:`${randomUUID()}@example.test`}),error=>error.code==='P0001');
});
test('new-person entry fails safely on inaccessible legacy identities and foreign tenants', () => {
  const c=candidate({member:hiddenMember});
  const sql=(o,email)=>`public.create_assessment_contact(${q(o)},'New','Person',${q(email)},'')`;
  assert.throws(()=>query(sql(org,c.email)),/P0001/);
  assert.throws(()=>query(sql(otherOrg,`${randomUUID()}@example.test`)),/42501/);
});
test('contact status exposes a safe conflict indicator for consultant follow-up', () => {
  const p=contact(),{s}=invite(p);candidate({email:p.primary_email,member:hiddenMember});
  const status=query(`public.get_contact_assessment(${q(p.public_id)})`);
  assert.equal(status.id,s.id);assert.equal(status.identity_conflict,true);
  assert.equal(status.candidate_public_id,null);assert.equal('token_hash' in status,false);
});

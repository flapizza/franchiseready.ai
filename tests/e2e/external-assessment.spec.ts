import { test, expect, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { ConferenceAssessmentAnalysisService } from '../../feature/assessment-engine/conference/ConferenceAssessmentAnalysisService';
import type { AssessmentProgress } from '../../feature/assessment-engine/production/types';

const endpoint=process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const password='Local-assessment-only-2026!';
const client=()=>createClient(endpoint,key,{auth:{persistSession:false,autoRefreshToken:false}});
async function login(page:Page,email:string){await page.goto('/login');await page.getByLabel('Email address').fill(email);await page.getByLabel('Password').fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page).toHaveURL(/\/crm$/);}
async function answer(page:Page){const groups=page.locator('fieldset');for(let i=0;i<await groups.count();i++){const group=groups.nth(i);if(!await group.locator('input:checked').count())await group.locator('input').first().check();}}

test('local Production invitation, anonymous resume, trusted atomic completion and tenant isolation',async({page,browser},testInfo)=>{
 test.setTimeout(180_000);
 expect(process.env.PERSISTENCE_MODE).toBe('supabase');expect(process.env.CONFERENCE_DEMO_ACCESS).toBe('false');
 expect(['127.0.0.1','localhost']).toContain(new URL(endpoint).hostname);
 const errors:string[]=[];const assets=new Set<string>();const watch=(p:Page)=>{p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('response',r=>{if(new URL(r.url()).pathname.endsWith('.js'))assets.add(r.url());});};watch(page);
 const email=`candidate-${Date.now()}@example.test`;
 await login(page,'assessment-consultant@example.test');await page.goto('/crm/candidates/new');
 await page.getByLabel('First Name').fill('External');await page.getByLabel('Last Name').fill('Candidate');await page.getByLabel('Email').fill(email);await page.getByRole('button',{name:'Create Candidate',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Candidate created'})).toBeVisible();
 const candidatePath=(await page.getByRole('link',{name:'Open candidate record'}).getAttribute('href'))!;
 await expect(page.getByText(/This action does not send email/)).toBeVisible();
 await page.getByRole('button',{name:'Generate Assessment Link'}).click();
 const invitation=(await page.getByRole('link',{name:'Open Assessment'}).getAttribute('href'))!;
 expect(invitation).toMatch(/^http:\/\/127\.0\.0\.1:3100\/assessment\/invitation\/[A-Za-z0-9_-]{43}$/);
 const token=invitation.split('/').at(-1)!;const hash=createHash('sha256').update(token).digest('hex');
 // Repeated consultant intake resolves the persisted candidate rather than creating a duplicate.
 await page.goto('/crm/candidates/new');await page.getByLabel('First Name').fill('External');await page.getByLabel('Last Name').fill('Candidate');await page.getByLabel('Email').fill(email.toUpperCase());await page.getByRole('button',{name:'Create Candidate',exact:true}).click();
 await expect(page.getByText('Duplicate review')).toBeVisible();await expect(page.getByRole('link',{name:'Open External Candidate'})).toHaveAttribute('href',candidatePath);
 const context=await browser.newContext();const candidate=await context.newPage();watch(candidate);
 for(const path of ['/assessment','/assessment/start','/assessment/invitation','/assessment/other/results',`/assessment/invitation/${token}/private`]){
  const response=await candidate.request.get(path,{maxRedirects:0});expect(response.status(),path).toBe(307);expect(response.headers().location).toContain('/login');
 }
 await candidate.goto(invitation);await expect(candidate.getByRole('heading',{name:'Tell us a little about yourself'})).toBeVisible();
 await expect(candidate.locator('body')).not.toContainText('Conference assessment data');
 const anon=client();const load=async()=>{const result=await anon.rpc('load_assessment_by_token',{presented_token_hash:hash});expect(result.error).toBeNull();return result.data;};
 expect(Object.keys(await load()).sort()).toEqual(['candidate_analysis','completed_at','last_saved_at','progress_snapshot','public_id','status']);
 for(const [label,value] of [['First name','External'],['Last name','Candidate'],['Email',email],['Mobile phone','407-555-0199'],['Street address','1 Local Way'],['City','Orlando'],['State/Province','FL'],['ZIP/Postal code','32801'],['Current occupation/title','Executive']]) await candidate.getByLabel(label,{exact:true}).fill(value);
 await candidate.getByRole('button',{name:'Continue',exact:true}).click();await candidate.getByLabel('I understand and wish to continue.').check();await candidate.getByRole('button',{name:'Begin assessment'}).click();
 await answer(candidate);await candidate.getByRole('button',{name:'Continue',exact:true}).click();await expect(candidate.getByText('Step 2 of 6')).toBeVisible();
 const saved=await load();expect(saved.progress_snapshot.section).toBe(2);expect(saved.candidate_analysis).toBeNull();
 await candidate.reload();await expect(candidate.getByText('Step 2 of 6')).toBeVisible();
 for(let section=2;section<=6;section++){
  await expect(candidate.getByText(`Step ${section} of 6`,{exact:true})).toBeVisible();
  await answer(candidate);await candidate.getByRole('button',{name:'Continue',exact:true}).click();
  if(section<6)await expect(candidate.getByText(`Step ${section+1} of 6`,{exact:true})).toBeVisible();
  else await expect(candidate.getByRole('heading',{name:'What concerns you most about business ownership?'})).toBeVisible();
 }
 await candidate.getByLabel("I don't have a major concern right now").check();
 const requestPromise=candidate.waitForRequest(r=>r.method()==='POST'&&!!r.headers()['next-action']);
 await candidate.getByRole('button',{name:'Build my profile'}).click();const submission=await requestPromise;
 const body=submission.postData()!;expect(body).not.toMatch(/authoritative_analysis|consultantBrief|analysis_snapshot|service_role/);
 const payload=JSON.parse(body).find((v:unknown)=>v&&typeof v==='object'&&'answers' in v) as AssessmentProgress;
 expect(payload).toBeTruthy();expect(Object.keys(payload).sort()).toEqual(['answers','consent','intake','section','stage','startedAt']);
 await expect(candidate.getByRole('heading',{name:'Your Franchise Ownership Profile'})).toBeVisible({timeout:20_000});
 await expect(candidate).toHaveURL(`${invitation}/results`);
 const completed=await load();expect(completed.status).toBe('analyzed');expect(completed.progress_snapshot).toBeNull();
 expect(Object.keys(completed.candidate_analysis).sort()).toEqual(['analysisVersion','financial','instrumentVersion','ownershipProfile']);
 const html=await candidate.content();expect(html).not.toMatch(/consultantBrief|discoveryPriorities|analysis_snapshot/);expect(html.includes(process.env.SUPABASE_SERVICE_ROLE_KEY!)).toBe(false);
 const consultant=client();expect((await consultant.auth.signInWithPassword({email:'assessment-consultant@example.test',password})).error).toBeNull();
 const read=async()=>{const r=await consultant.rpc('get_candidate_assessment',{target_candidate_public_id:candidatePath.split('/').at(-1)!});expect(r.error).toBeNull();return r.data[0];};
 const persisted=await read();expect(persisted.analysis_snapshot).toEqual(new ConferenceAssessmentAnalysisService().analyze(payload.intake,payload.answers));
 const root=await consultant.from('candidates').select('organization_id').eq('public_id',candidatePath.split('/').at(-1)!).single();expect(root.error).toBeNull();
 const createArgs={target_organization_id:root.data!.organization_id,proposed_first_name:'Concurrent',proposed_last_name:'Candidate',proposed_email:`concurrent-${Date.now()}@example.test`,proposed_phone:''};
 const concurrent=await Promise.all([consultant.rpc('create_assessment_candidate',createArgs),consultant.rpc('create_assessment_candidate',{...createArgs,proposed_email:createArgs.proposed_email.toUpperCase()})]);
 for(const r of concurrent)expect(r.error).toBeNull();expect(concurrent[0].data[0].public_id).toBe(concurrent[1].data[0].public_id);
 const duplicateCount=await consultant.from('candidates').select('id',{count:'exact',head:true}).eq('email',createArgs.proposed_email);expect(duplicateCount.count).toBe(1);
 const replay=await candidate.request.post(invitation,{headers:{'next-action':submission.headers()['next-action'],'content-type':submission.headers()['content-type'],origin:new URL(invitation).origin},data:body});expect(replay.ok()).toBe(true);
 expect((await read()).completed_at).toBe(persisted.completed_at);expect((await read()).analysis_snapshot).toEqual(persisted.analysis_snapshot);
 await candidate.reload();await expect(candidate.getByRole('heading',{name:'Your Franchise Ownership Profile'})).toBeVisible();
 for(const width of [1440,390]){await candidate.setViewportSize({width,height:900});expect(await candidate.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await candidate.screenshot({path:testInfo.outputPath(`candidate-${width}.png`),fullPage:true});}
 const pdf=await candidate.request.get(`${invitation}/report`);expect(pdf.ok()).toBe(true);expect(pdf.headers()['content-type']).toContain('application/pdf');expect((await pdf.body()).toString('latin1')).not.toContain('INTERNAL CONSULTANT USE');
 await candidate.goto(invitation);await expect(candidate.getByRole('heading',{name:'Assessment complete'})).toBeVisible();
 await page.goto(candidatePath);await expect(page.getByRole('heading',{name:'Consultant Brief'})).toBeVisible();await page.screenshot({path:testInfo.outputPath('consultant-desktop.png'),fullPage:true});
 const other=client();expect((await other.auth.signInWithPassword({email:'assessment-other@example.test',password})).error).toBeNull();
 const isolated=await other.rpc('get_candidate_assessment',{target_candidate_public_id:candidatePath.split('/').at(-1)!});expect(isolated.error).toBeNull();expect(isolated.data).toEqual([]);
 expect((await other.rpc('create_assessment_candidate',createArgs)).error?.code).toBe('42501');
 // Local-only fixture mutations exercise public expired/revoked handling.
 for(const change of ["expires_at=now()-interval '1 second'","expires_at=now()+interval '1 day',revoked_at=now()"]){
  // Table writes remain denied to API roles; fixture setup uses only local psql.
  execFileSync('docker',['exec','supabase_db_franchiseready-web','psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-c',`update public.assessment_sessions set ${change} where token_hash='${hash}'`],{stdio:['ignore','pipe','pipe'],windowsHide:true});
  await candidate.goto(invitation);await expect(candidate.getByRole('heading',{name:'Assessment link unavailable'})).toBeVisible();expect(await load()).toBeNull();
 }
 await candidate.goto('/assessment/invitation/'+ 'z'.repeat(43));await expect(candidate.getByRole('heading',{name:'Assessment link unavailable'})).toBeVisible();
 expect(assets.size).toBeGreaterThan(0);
 for(const url of assets){const response=await candidate.request.get(url);expect(response.ok()).toBe(true);expect((await response.text()).includes(process.env.SUPABASE_SERVICE_ROLE_KEY!)).toBe(false);}
 expect(errors).toEqual([]);await context.close();
});

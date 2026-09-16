import {test,expect,type Page} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const password='Local-assessment-only-2026!';
const endpoint=process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const controls=(page:Page)=>page.getByRole('region',{name:'Share assessment controls'});
async function login(page:Page){await page.goto('/login');await page.getByLabel('Email address').fill('assessment-consultant@example.test');await page.getByLabel('Password').fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page).toHaveURL(/\/crm$/,{timeout:30000});}
async function consultant(){
  expect(['127.0.0.1','localhost']).toContain(new URL(endpoint).hostname);
  const api=createClient(endpoint,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const signed=await api.auth.signInWithPassword({email:'assessment-consultant@example.test',password});expect(signed.error).toBeNull();
  const member=await api.from('organization_memberships').select('id,organization_id').eq('user_id',signed.data.user!.id).single();expect(member.error).toBeNull();
  return {api,member:member.data!};
}
function localSql(sql:string){expect(['127.0.0.1','localhost']).toContain(new URL(endpoint).hostname);return execFileSync('docker',['exec','-i','supabase_db_franchiseready-web','psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'],{input:sql,encoding:'utf8',windowsHide:true,stdio:['pipe','pipe','pipe']}).trim();}
async function complete(page:Page,invitation:string,onProgress:()=>Promise<void>){
  await page.goto(invitation);await expect(page.getByRole('heading',{name:'Tell us a little about yourself'})).toBeVisible();
  for(const [label,value] of [['First name','Different'],['Last name','Participant'],['Email','participant-identity@example.test'],['Mobile phone','4075550199'],['Street address','1 Test Way'],['City','Orlando'],['State/Province','FL'],['ZIP/Postal code','32801'],['Current occupation/title','Executive']])await page.getByLabel(label,{exact:true}).fill(value);
  await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByLabel('I understand and wish to continue.').check();await page.getByRole('button',{name:'Begin assessment'}).click();
  for(let section=1;section<=6;section++){
    await expect(page.getByText(`Step ${section} of 6`,{exact:true})).toBeVisible();
    if(section===2){await page.reload();await expect(page.getByText('Step 2 of 6',{exact:true})).toBeVisible();await onProgress();}
    const groups=page.locator('fieldset');for(let i=0;i<await groups.count();i++){const group=groups.nth(i);if(!await group.locator('input:checked').count())await group.locator('input').first().check();}
    await page.getByRole('button',{name:'Continue',exact:true}).click();
  }
  await page.getByLabel("I don't have a major concern right now").check();await page.getByRole('button',{name:'Build my profile'}).click();
  await expect(page.getByRole('heading',{name:'Your Franchise Ownership Profile'})).toBeVisible({timeout:30000});
}

test('C: new person to anonymous completion and automatic Candidate Intelligence at 390px',async({page,browser},info)=>{
  test.setTimeout(240000);await page.setViewportSize({width:390,height:900});const {api}=await consultant();await login(page);
  await page.goto('/crm/contacts');await page.getByRole('link',{name:'Invite Candidate',exact:true}).click();
  const email=`new-person-${Date.now()}@example.test`;
  await page.getByLabel('First name',{exact:true}).fill('Conference');await page.getByLabel('Last name',{exact:true}).fill('Person');await page.getByLabel('Email',{exact:true}).fill(email);
  await page.getByRole('button',{name:'Create Contact & Share Assessment'}).click();
  const saved=page.getByRole('link',{name:'Open saved Contact'});await expect(saved).toBeVisible();
  const contactPath=(await saved.getAttribute('href'))!;const invitation=(await controls(page).getByRole('link',{name:'Open Assessment'}).getAttribute('href'))!;
  await page.context().grantPermissions(['clipboard-read','clipboard-write']);
  await controls(page).getByRole('button',{name:'Copy Assessment Link'}).click();
  await expect(controls(page).getByRole('status')).toContainText('Assessment link copied');
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(new URL(invitation,page.url()).toString());
  const opened=page.context().waitForEvent('page');await controls(page).getByRole('link',{name:'Open Assessment'}).click();
  const popup=await opened;await expect(popup.getByRole('heading',{name:'Tell us a little about yourself'})).toBeVisible({timeout:30000});await popup.close();
  const p=await api.from('contacts').select('id,public_id,primary_email,marketing_email_status,candidates(public_id)').eq('primary_email',email).single();expect(p.error).toBeNull();expect(p.data!.candidates).toHaveLength(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath('invite-ready-390.png'),fullPage:true});
  await saved.click();await expect(page).toHaveURL(new URL(contactPath,page.url()).toString(),{timeout:30000});await expect(controls(page)).toContainText('Invitation ready');
  const anon=await browser.newContext();const participant=await anon.newPage();
  await complete(participant,invitation,async()=>{await controls(page).getByRole('button',{name:'Refresh assessment status'}).click();await expect(controls(page)).toContainText('In progress');});
  await controls(page).getByRole('button',{name:'Refresh assessment status'}).click();await expect(controls(page)).toContainText('Completed');
  const view=controls(page).getByRole('link',{name:'View Candidate Intelligence'});await expect(view).toBeVisible();
  const updated=await api.from('contacts').select('primary_email,marketing_email_status,candidates(public_id,email)').eq('id',p.data!.id).single();expect(updated.data!.candidates).toHaveLength(1);expect(updated.data!.candidates[0].email).toBe(email);expect(updated.data!.marketing_email_status).toBe(p.data!.marketing_email_status);
  await view.click();await expect(page).toHaveURL(/cand_.*#assessment-intelligence/,{timeout:30000});await expect(page.getByRole('heading',{name:'Consultant Brief'})).toBeVisible({timeout:30000});
  await page.goto(contactPath);await expect(controls(page).getByRole('button',{name:'Replace Assessment Link'})).toHaveCount(0);await anon.close();
});

test('B: existing contact invitation, explicit candidate reuse, anonymous resume and intelligence',async({page,browser})=>{
  test.setTimeout(240000);const {api,member}=await consultant();
  const created=await api.from('contacts').insert({organization_id:member.organization_id,created_by_membership_id:member.id,assigned_membership_id:member.id,first_name:'Existing',last_name:'Contact',primary_email:`contact-flow-${Date.now()}@example.test`}).select('id,public_id').single();expect(created.error).toBeNull();const p=created.data!;
  await login(page);await page.goto(`/crm/contacts/${p.public_id}`);await controls(page).getByRole('button',{name:'Share Assessment',exact:true}).click();
  const invitation=(await controls(page).getByRole('link',{name:'Open Assessment'}).getAttribute('href'))!;expect(invitation).toBeTruthy();
  expect((await api.from('candidates').select('public_id').eq('contact_id',p.id)).data).toHaveLength(0);
  const promoted=await api.rpc('promote_contact_to_candidate',{target_contact_public_id:p.public_id});expect(promoted.error).toBeNull();
  const anon=await browser.newContext();await complete(await anon.newPage(),invitation,async()=>{await page.reload();await expect(controls(page)).toContainText('In progress');});
  await controls(page).getByRole('button',{name:'Refresh assessment status'}).click();await expect(controls(page).getByRole('link',{name:'View Candidate'})).toHaveAttribute('href',`/crm/candidates/${promoted.data[0].candidate_public_id}`);
  await controls(page).getByRole('link',{name:'View Candidate'}).click();await expect(page).toHaveURL(new RegExp(`/crm/candidates/${promoted.data[0].candidate_public_id}$`),{timeout:30000});
  await page.goto(`/crm/contacts/${p.public_id}`);
  await controls(page).getByRole('link',{name:'View Candidate Intelligence'}).click();await expect(page.getByRole('heading',{name:'Consultant Brief'})).toBeVisible({timeout:30000});
  expect((await api.from('candidates').select('public_id').eq('contact_id',p.id)).data).toHaveLength(1);await anon.close();
});

test('duplicate person, consultant identity conflict and stale replacement are explicit',async({page})=>{
  test.setTimeout(120000);const {api,member}=await consultant();const email=`review-${Date.now()}@example.test`;
  const c=await api.rpc('create_assessment_candidate',{target_organization_id:member.organization_id,proposed_first_name:'Legacy',proposed_last_name:'Person',proposed_email:email,proposed_phone:''});expect(c.error).toBeNull();
  await login(page);await page.goto('/crm/contacts/invite');await page.getByLabel('First name',{exact:true}).fill('Other');await page.getByLabel('Last name',{exact:true}).fill('Person');await page.getByLabel('Email',{exact:true}).fill(email);await page.getByRole('button',{name:'Create Contact & Share Assessment'}).click();await expect(page.locator('form').getByRole('alert')).toContainText('No new person was created');
  const p=await api.from('contacts').insert({organization_id:member.organization_id,created_by_membership_id:member.id,assigned_membership_id:member.id,first_name:'Existing',last_name:'Review',primary_email:email}).select('public_id').single();expect(p.error).toBeNull();
  await page.goto(`/crm/contacts/${p.data!.public_id}`);await controls(page).getByRole('button',{name:'Share Assessment',exact:true}).click();await expect(controls(page).getByRole('alert').first()).toContainText('may match an existing candidate');await expect(controls(page).getByRole('link',{name:'Open Assessment'})).toHaveCount(0);
  await page.goto(`/crm/candidates/${c.data[0].public_id}`);await controls(page).getByRole('button',{name:'Share Assessment',exact:true}).click();await expect(controls(page).getByRole('link',{name:'Open Assessment'})).toBeVisible();await page.reload();await controls(page).getByRole('checkbox').check();
  const a=await api.rpc('get_candidate_assessment',{target_candidate_public_id:c.data[0].public_id});const b=await api.rpc('create_assessment_invitation',{target_candidate_public_id:c.data[0].public_id,presented_token_hash:createHash('sha256').update(`new-${Date.now()}`).digest('hex'),invitation_expires_at:new Date(Date.now()+864e5).toISOString(),expected_replacement_id:a.data[0].id});expect(b.error).toBeNull();
  await controls(page).getByRole('button',{name:'Replace Assessment Link'}).click();await expect(controls(page).getByRole('alert')).toContainText('invitation changed');expect((await api.rpc('get_candidate_assessment',{target_candidate_public_id:c.data[0].public_id})).data[0].id).toBe(b.data[0].id);
});

test('saved contact survives invitation failure and can resume without duplicating the person',async({page})=>{
  test.setTimeout(120000);const {api}=await consultant();const email=`recover-${Date.now()}@example.test`;
  // Local-only database fault on this fixture's invitation INSERT, not mocked identity/completion.
  localSql(`create function private.test_invitation_failure() returns trigger language plpgsql as $$ begin if exists(select 1 from public.contacts where id=new.contact_id and primary_email='${email}') then raise exception 'local invitation fault'; end if; return new; end $$; create trigger test_invitation_failure before insert on public.assessment_sessions for each row execute function private.test_invitation_failure();`);
  try {
    await login(page);await page.goto('/crm/contacts/invite');await page.getByLabel('First name',{exact:true}).fill('Recover');await page.getByLabel('Last name',{exact:true}).fill('Person');await page.getByLabel('Email',{exact:true}).fill(email);await page.getByRole('button',{name:'Create Contact & Share Assessment'}).click();
    await expect(page.getByRole('status')).toContainText('Contact saved, but');await expect(page.getByRole('button',{name:'Create Contact & Share Assessment'})).toHaveCount(0);
  } finally {localSql('drop trigger test_invitation_failure on public.assessment_sessions; drop function private.test_invitation_failure();');}
  await page.getByRole('link',{name:'Open saved Contact'}).click();await controls(page).getByRole('button',{name:'Share Assessment',exact:true}).click();await expect(controls(page).getByRole('link',{name:'Open Assessment'})).toBeVisible();expect((await api.from('contacts').select('id').eq('primary_email',email)).data).toHaveLength(1);
});

import { localStatus } from './local-brand-intelligence.mjs';
import { createClient } from '@supabase/supabase-js';
import { execFileSync, spawn } from 'node:child_process';
// Alternate local ports can be used without modifying the repository configuration.
const workdir=process.env.FG_LOCAL_SUPABASE_WORKDIR;
const status = workdir ? JSON.parse(execFileSync(process.execPath,['node_modules/supabase/dist/supabase.js','status','--workdir',workdir,'--output','json'],{encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']})) : localStatus();
if(!['127.0.0.1','localhost'].includes(new URL(status.API_URL).hostname))throw new Error('Local Supabase required');
const auth = { persistSession: false, autoRefreshToken: false };
const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, {auth});
for (const name of ['consultant','other']) {
 const credentials = {email:`assessment-${name}@example.test`,password:'Local-assessment-only-2026!'};
 const client=createClient(status.API_URL,status.ANON_KEY,{auth});
 let login=await client.auth.signInWithPassword(credentials);
 if(login.error) {
  const created=await admin.auth.admin.createUser({...credentials,email_confirm:true});
  if(created.error) throw new Error('Local fixture user creation failed.');
  login=await client.auth.signInWithPassword(credentials);
 }
 if(login.error) throw new Error('Local fixture login failed.');
 const result=await client.rpc('bootstrap_first_workspace',{proposed_organization_name:`Assessment ${name} local`,proposed_consultant_display_name:`Assessment ${name}`});
 if(result.error) throw new Error('Local fixture workspace failed.');
}
const env={...process.env,PERSISTENCE_MODE:'supabase',NEXT_PUBLIC_SUPABASE_URL:status.API_URL,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:status.ANON_KEY,SUPABASE_SERVICE_ROLE_KEY:status.SERVICE_ROLE_KEY,APP_URL:'http://127.0.0.1:3100',CONFERENCE_DEMO_ACCESS:'false',PLAYWRIGHT_TEST_MODE:'true',RESEND_API_KEY:'',RESEND_FROM_EMAIL:'',RESEND_WEBHOOK_SECRET:''};
const run=(module,args)=>new Promise((resolve,reject)=>{const child=spawn(process.execPath,[module,...args],{env,stdio:'inherit',windowsHide:true});child.on('error',reject);child.on('exit',code=>resolve(code??1));});
if(process.argv[2]!=='--skip-build') {const code=await run('node_modules/next/dist/bin/next',['build']);if(code)process.exit(code);}
process.exit(await run('node_modules/@playwright/test/cli.js',['test','tests/e2e/external-assessment.spec.ts','--project=chromium']));

import { execFileSync, spawn } from 'node:child_process';
const status=JSON.parse(execFileSync('cmd.exe',['/d','/s','/c','npx supabase status --output json'],{encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']}));
if(!['localhost','127.0.0.1'].includes(new URL(status.API_URL).hostname))throw Error('Only the local Docker Supabase instance is authorized.');
const mapping=execFileSync('docker',['port','supabase_kong_franchiseready-web','8000/tcp'],{encoding:'utf8',windowsHide:true});
const port=mapping.match(/:(\d+)\s*$/m)?.[1];
if(!port)throw Error('The local Supabase API port could not be verified.');
status.API_URL=`http://127.0.0.1:${port}`;
const env={...process.env,PLAYWRIGHT_TEST_MODE:'true',CONFERENCE_DEMO_ACCESS:'false',PERSISTENCE_MODE:'supabase',APP_URL:'http://127.0.0.1:3116',NEXT_PUBLIC_SUPABASE_URL:status.API_URL,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:status.ANON_KEY,SUPABASE_SERVICE_ROLE_KEY:status.SERVICE_ROLE_KEY,RESEND_API_KEY:'',RESEND_FROM_EMAIL:'',RESEND_WEBHOOK_SECRET:'',CAMPAIGN_DELIVERY_WORKER_SECRET:'',PACK2A_TEST_PASSWORD:'Local-Studio-001A-proof!'};
const run=(file,args)=>new Promise((resolve,reject)=>{const child=spawn(process.execPath,[file,...args],{env,stdio:'inherit',windowsHide:true});child.once('error',reject);child.once('exit',code=>resolve(code??1));});
if(!process.argv.includes('--skip-build')){const code=await run('node_modules/next/dist/bin/next',['build']);if(code)process.exit(code);}
for(const [i,file]of ['marketing-production-persistence.spec.ts','marketing-provider-unavailable.spec.ts'].entries()){
 env.PACK2A_TEST_EMAIL=`studio-001a-${Date.now()}-${i}@example.test`;
 const code=await run('node_modules/@playwright/test/cli.js',['test','--config=tests/marketing-studio-persistence.config.ts',file]);if(code)process.exit(code);
}

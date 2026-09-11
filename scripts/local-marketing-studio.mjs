import { spawn } from 'node:child_process';
// Explicit local/demo boundaries override any .env.local hosted credentials.
const env={...process.env,PLAYWRIGHT_TEST_MODE:'true',CONFERENCE_DEMO_ACCESS:'true',PERSISTENCE_MODE:'demo',APP_URL:'http://127.0.0.1:3115',NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54321',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'local-studio-not-a-hosted-key',SUPABASE_SERVICE_ROLE_KEY:'',RESEND_API_KEY:'',RESEND_FROM_EMAIL:'',RESEND_WEBHOOK_SECRET:'',CAMPAIGN_DELIVERY_WORKER_SECRET:''};
const run=(file,args)=>new Promise((resolve,reject)=>{const child=spawn(process.execPath,[file,...args],{env,stdio:'inherit',windowsHide:true});child.once('error',reject);child.once('exit',code=>resolve(code??1));});
if(!process.argv.includes('--skip-build')) {const code=await run('node_modules/next/dist/bin/next',['build']);if(code)process.exit(code);}
if(!process.argv.includes('--build-only'))process.exit(await run('node_modules/@playwright/test/cli.js',['test','--config=tests/marketing-studio.config.ts',...process.argv.slice(2).filter(x=>!['--skip-build','--build-only'].includes(x))]));

import fs from 'node:fs';
import {execFileSync,spawn} from 'node:child_process';
fs.mkdirSync('.next-dev/marketing-studio-001c',{recursive:true});
const status=JSON.parse(execFileSync(process.execPath,['node_modules/supabase/dist/supabase.js','status','--output','json'],{encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']}));
const port=execFileSync('docker',['port','supabase_kong_franchiseready-web','8000/tcp'],{encoding:'utf8',windowsHide:true}).match(/:(\d+)\s*$/m)?.[1];if(!port)throw Error('Local API unavailable');
const env={...process.env,STUDIO_LOCAL_MOCK:'1',NODE_OPTIONS:'--import ./tests/helpers/marketing-provider-mock.mjs',PLAYWRIGHT_TEST_MODE:'true',CONFERENCE_DEMO_ACCESS:'false',PERSISTENCE_MODE:'supabase',APP_URL:'http://127.0.0.1:3117',MARKETING_PUBLIC_URL:'https://demo.example.test',NEXT_PUBLIC_SUPABASE_URL:`https://127.0.0.1:${port}`,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:status.ANON_KEY,SUPABASE_SERVICE_ROLE_KEY:status.SERVICE_ROLE_KEY,RESEND_API_KEY:'local-mock-only',RESEND_FROM_EMAIL:'local@fixture-mail.net',RESEND_WEBHOOK_SECRET:'whsec_bG9jYWwtbW9jay1vbmx5LXNlY3JldA==',CAMPAIGN_DELIVERY_WORKER_SECRET:'local-mock-worker-secret-with-enough-characters',PACK2A_TEST_EMAIL:`studio-delivery-${Date.now()}@example.test`,PACK2A_TEST_PASSWORD:'Local-Studio-001C-proof!'};
const run=(args)=>new Promise(resolve=>{const child=spawn(process.execPath,args,{env,stdio:'inherit',windowsHide:true});child.once('exit',code=>resolve(code??1));});
if(!process.argv.includes('--skip-build')){const code=await run(['node_modules/next/dist/bin/next','build']);if(code)process.exit(code);}
process.exit(await run(['node_modules/@playwright/test/cli.js','test','--config=tests/marketing-studio-delivery.config.ts']));

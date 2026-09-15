import fs from 'node:fs';
import cp from 'node:child_process';
const container='supabase_db_franchiseready-web';
const docker=args=>cp.execFileSync('docker',args,{encoding:'utf8',windowsHide:true,maxBuffer:20e6});
const name='studio_001c_validation_'+Date.now();
const sql=(database,input)=>cp.execFileSync('docker',['exec','-i',container,'psql','-X','-U','supabase_admin','-d',database,'-v','ON_ERROR_STOP=1','-At'],{input,encoding:'utf8',windowsHide:true,maxBuffer:20e6});
fs.mkdirSync('.next-dev/marketing-studio-001c',{recursive:true});
// Clone schema only into a uniquely named scratch database. Existing local
// users, campaigns and immutable delivery evidence are never reset or removed.
const schema=docker(['exec',container,'pg_dump','-U','postgres','-d','postgres','--schema-only','--no-owner']);
sql('postgres',`create database ${name};`);
try{
 sql(name,schema);
 console.log('Isolated local database:',name);
 const undo=fs.readFileSync('tests/helpers/studio-001c-local-baseline.sql','utf8');
 if(!undo)throw Error('Local replay preparation unavailable');
 sql(name,'begin;'+undo+fs.readFileSync('supabase/migrations/20260911185613_marketing_studio_001c.sql','utf8')+'commit;');
 let assertions=0,failed=0;
 for(const file of fs.readdirSync('supabase/tests/database').filter(f=>/^(015|016|017|018|019|026|027|028)_/.test(f))){
  const result=sql(name,fs.readFileSync('supabase/tests/database/'+file,'utf8'));
  fs.writeFileSync('.next-dev/marketing-studio-001c/'+file+'.log',result);
  const count=Number(result.match(/^1\.\.(\d+)/m)?.[1]??0);assertions+=count;
  const failures=result.split('\n').filter(x=>/^not ok|^#/.test(x));failed+=failures.filter(x=>x.startsWith('not ok')).length;
  console.log(file,`${count} assertions`,failures.length?failures:'PASS');
 }
 console.log(JSON.stringify({assertions,failed}));if(failed)process.exitCode=1;
 if(!failed&&process.argv.includes('--sync-local')){
  const migration=fs.readFileSync('supabase/migrations/20260911185613_marketing_studio_001c.sql','utf8');
  const pieces=['begin;'];
  if(!sql('postgres',"select to_regclass('private.studio_pending_provider_events');").trim()){
   pieces.push(migration.slice(migration.indexOf('create table private.studio_pending_provider_events'),migration.indexOf('alter table private.studio_test_events')));
  }
  for(const fn of ['public.stage_studio_campaign','public.confirm_studio_campaign','public.prepare_studio_test','public.record_marketing_provider_event','private.reconcile_studio_pending_events','private.studio_run_guard','private.studio_recipient_guard']){
   const start=migration.indexOf('create function '+fn+'('),end=migration.indexOf('\nend $$;',start);
   if(start<0||end<0)throw Error('Missing local function '+fn);
   pieces.push(migration.slice(start,end+8).replace('create function','create or replace function'));
  }
  pieces.push('grant select on public.marketing_send_runs,public.marketing_send_recipients to service_role;');
  pieces.push(migration.slice(migration.indexOf('revoke all on function private.reconcile_studio_pending_events'))
   .replace('create trigger studio_test_pending_events','drop trigger if exists studio_test_pending_events on public.studio_test_sends;create trigger studio_test_pending_events')
   .replace('create trigger studio_campaign_pending_events','drop trigger if exists studio_campaign_pending_events on public.marketing_send_recipients;create trigger studio_campaign_pending_events'));
  pieces.push("notify pgrst, 'reload schema';commit;");
  sql('postgres',pieces.join('\n'));console.log('Updated local functions and additive event storage; preserved existing local artifacts.');
 }
}finally{sql('postgres',`drop database ${name};`);}

import fs from 'node:fs';
import crypto from 'node:crypto';
if(process.env.STUDIO_LOCAL_MOCK!=='1'||!/^https:\/\/127\.0\.0\.1:\d+$/.test(process.env.NEXT_PUBLIC_SUPABASE_URL??''))throw Error('Local mock requires explicit loopback configuration');
const original=globalThis.fetch;
globalThis.fetch=async(input,init)=>{
 const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
 if(url.startsWith('https://api.resend.com/')){
  if(url!=='https://api.resend.com/emails'||init?.method!=='POST')throw Error('Unexpected mock provider operation');
  const body=JSON.parse(init.body),key=new Headers(init.headers).get('idempotency-key');
  const id='mock-'+crypto.createHash('sha256').update(key).digest('hex').slice(0,24);
  fs.appendFileSync('.next-dev/marketing-studio-001c/mock-submissions.jsonl',JSON.stringify({id,key,body})+'\n');
  return Response.json({id});
 }
 if(url.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL+'/'))return original(url.replace('https:','http:'),init);
 if(!/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(url))throw Error('External network blocked by local certification mock');
 return original(input,init);
};

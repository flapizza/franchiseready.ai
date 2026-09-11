import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks, stripTypeScriptTypes } from 'node:module';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { emptyEmailDocument, emailDocumentSchema, parseEmailDocument, serializeEmailDocument, deserializeEmailDocument, fontStacks } from '../../feature/marketing/studio/document.ts';
import { renderStudioEmail } from '../../feature/marketing/studio/render.ts';
import { visualCopy } from '../../feature/marketing/studio/legacy.ts';

registerHooks({resolve(specifier, context, next) {
  if (specifier === 'server-only') return {url:'data:text/javascript,export{}',shortCircuit:true};
  if(specifier==='next/cache')return{url:'data:text/javascript,export function revalidatePath(){}',shortCircuit:true};
  if(specifier==='@/feature/platform/composition/resolveWorkspaceComposition')return{url:'data:text/javascript,export async function resolveWorkspaceComposition(){return globalThis.__studioActionFixture}',shortCircuit:true};
  if(specifier.startsWith('@/'))return next(new URL('../../'+specifier.slice(2)+'.ts',import.meta.url).href,context);
  try { return next(specifier, context); } catch (error) { if(specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) return next(specifier+'.ts',context); throw error; }
},load(url,context,next){if(url.endsWith('/SupabaseMarketingRepository.ts'))return{format:'module',source:stripTypeScriptTypes(readFileSync(new URL(url),'utf8'),{mode:'transform'}),shortCircuit:true};return next(url,context);}});
const {SeedMarketingRepository,markSeedCampaignDelivery}=await import('../../feature/marketing/repositories/SeedMarketingRepository.ts');
const {SupabaseMarketingRepository}=await import('../../feature/marketing/repositories/SupabaseMarketingRepository.ts');
const {readContent,assertV1Delivery}=await import('../../feature/marketing/studio/persistence.ts');
const {parseCampaignSave}=await import('../../feature/marketing/studio/save.ts');
const {saveCampaignAction,saveStudioDraftAction}=await import('../../feature/marketing/actions/marketing-actions.ts');
const {studioExtensions}=await import('../../feature/marketing/studio/extensions.ts');
const {getSchema}=await import('@tiptap/core');
const ctx={subject:'Hello {{first_name}}',preheader:'News',personalization:{first_name:'<img onerror=alert(1)>',preferred_name:'',consultant_name:'Alex'},compliance:{sender:'Consulting & Co',postalAddress:'123 Main Street',unsubscribeUrl:'https://example.test/unsubscribe/token'},preview:true};
const para=text=>({type:'paragraph',attrs:{textAlign:'left'},content:[{type:'text',text}]});
const full=()=>({...emptyEmailDocument(),document:{type:'doc',content:[
 {type:'heading',attrs:{level:1,textAlign:'center'},content:[{type:'text',text:'Welcome',marks:[{type:'bold'},{type:'italic'},{type:'underline'},{type:'emailStyle',attrs:{font:'georgia',size:24,color:'#2563EB'}},{type:'link',attrs:{href:'https://example.test'}}]}]},
 {type:'paragraph',attrs:{textAlign:'right'},content:[{type:'mergeField',attrs:{field:'preferred_name'}},{type:'hardBreak'},{type:'text',text:'Next line'}]},
 {type:'bulletList',content:[{type:'listItem',content:[para('One')]}]},
 {type:'orderedList',attrs:{start:2},content:[{type:'listItem',content:[para('Two')]}]},
 {type:'button',attrs:{label:'Explore',href:'https://example.test',alignment:'center'}},{type:'divider'},{type:'spacer',attrs:{height:24}},
 {type:'signature',attrs:{name:'Alex',title:'Consultant',company:'Co',email:'alex@example.test',phone:'555-0100'}},
 {type:'imageText',content:[{type:'emailImage',attrs:{assetId:null,alt:'Logo',width:240,alignment:'left',href:null}},{type:'emailColumn',content:[para('Story')]}]},
]}});
test('V2 round trip preserves all blocks, marks and typed attributes',()=>assert.deepEqual(deserializeEmailDocument(serializeEmailDocument(full())),full()));
test('actual Tiptap node defaults conform to the FranGroove contract',()=>{const schema=getSchema(studioExtensions());for(const name of ['paragraph','heading','bulletList','orderedList','button','divider','spacer','signature','emailImage','imageText']){const node=schema.nodes[name].createAndFill();assert.ok(node,name);const doc=emptyEmailDocument();doc.document.content=[node.toJSON()];assert.doesNotThrow(()=>parseEmailDocument(doc),name);}});
test('SQL and application share exactly the same V2 JSON schema',()=>{const sql=readFileSync(new URL('../../supabase/migrations/20260911164031_marketing_studio_001a.sql',import.meta.url),'utf8');assert.deepEqual(JSON.parse(sql.split('$schema$')[1]),z.toJSONSchema(emailDocumentSchema));});
test('schema rejects unsafe, unsupported and oversized content',()=>{
 const bad=[{...full(),version:3},{...full(),html:'<script/>'},{...full(),theme:{...full().theme,fontFamily:'url(evil)'}}, {...full(),document:{type:'doc',content:[{type:'html',content:'unsafe'}]}}];
 for(const href of ['javascript:alert(1)','data:text/html,test','http://example.test','https://example.test/" onclick="evil','https://user:pass@example.test','https://example.test/\\evil']) bad.push({...emptyEmailDocument(),document:{type:'doc',content:[{type:'button',attrs:{label:'X',href,alignment:'left'}}]}});
 for(const extra of [{style:'color:red'},{onclick:'evil'},{src:'data:image/png;base64,a'}]) bad.push({...emptyEmailDocument(),document:{type:'doc',content:[{type:'emailImage',attrs:{assetId:null,alt:'X',width:100,alignment:'left',href:null,...extra}}]}});
 bad.push({...emptyEmailDocument(),document:{type:'doc',content:[{type:'paragraph',attrs:{textAlign:'left'},content:[{type:'mergeField',attrs:{field:'password'}}]}]}});
 bad.push({...emptyEmailDocument(),document:{type:'doc',content:Array.from({length:101},()=>para('x'))}});
 bad.push({...emptyEmailDocument(),document:{type:'doc',content:Array.from({length:30},()=>para('x'.repeat(20000)))}});
 for(const value of bad) assert.throws(()=>parseEmailDocument(value));
 const cyclic={};cyclic.self=cyclic;assert.throws(()=>parseEmailDocument(cyclic));
});
test('renderer escapes personalization, renders HTML and independent text, protects footer',()=>{
 const output=renderStudioEmail(full(),ctx);
 assert.match(output.html,/&lt;img onerror=alert\(1\)&gt;/);assert.doesNotMatch(output.html,/<img|<script|<a\s|onclick=|display:flex|display:grid/);
 for(const term of ['<strong>','<em>','<u>','font-size:24px','text-align:right','<ul','<ol start="2"','height="24"','max-width:600px','email-column','123 Main Street','Consulting &amp; Co','Unsubscribe'])assert.ok(output.html.includes(term),term);
 assert.match(output.text,/2\. Two/);assert.match(output.text,/Explore: https:\/\/example.test/);assert.match(output.text,/\[Image: Logo\]/);assert.match(output.text,/Unsubscribe: https:/);assert.doesNotMatch(output.text,/<strong>/);
 assert.throws(()=>renderStudioEmail(full(),{...ctx,compliance:{...ctx.compliance,postalAddress:''}}));
});
test('all six font identifiers map to controlled fallback stacks',()=>{for(const [font,stack]of Object.entries(fontStacks)){const d=emptyEmailDocument();d.theme.fontFamily=font;const r=renderStudioEmail(d,ctx);assert.ok(r.html.includes(stack.replaceAll('"','&quot;')));}});
test('V1 visual copy preserves original, lines, envelope-independent content and merge tokens',()=>{
 const v1={version:1,heading:'Hello',body:'Hi {{ first_name }}\nNext',ctaLabel:'Explore',ctaUrl:'https://example.test',footer:'Original footer'};const original=JSON.stringify(v1);const converted=visualCopy(v1);assert.equal(JSON.stringify(v1),original);const r=renderStudioEmail(converted,ctx);assert.match(r.text,/\nNext/);assert.match(r.text,/Original footer/);assert.match(r.html,/<br>/);assert.throws(()=>visualCopy({...v1,ctaUrl:'http://example.test'}));
 assert.equal(readContent({...v1,body:''}).version,1);assert.deepEqual(readContent({version:99,secret:'retained'}),{version:-1,original:{version:99,secret:'retained'}});
});
const draft=()=>({id:'',name:'Studio draft',description:'',subject:'Subject',previewText:'Preview',senderName:'Alex',replyTo:'alex@example.test',audienceType:'list',audienceId:'list_demo_newsletter',content:full(),status:'draft'});
test('V2 saves drafts only; direct delivery and Ready parsing fail closed',()=>{assert.throws(()=>assertV1Delivery(full()),/not enabled/);assert.throws(()=>parseCampaignSave({...draft(),status:'ready'}),/not enabled/);});
test('repository draft persistence, duplication and optimistic concurrency',async()=>{
 const repo=new SeedMarketingRepository();const first=await repo.saveCampaign(draft());const updated=await repo.saveCampaign({...first,expectedUpdatedAt:first.updatedAt,name:'Updated'});assert.notEqual(first.updatedAt,updated.updatedAt);await assert.rejects(repo.saveCampaign({...first,expectedUpdatedAt:first.updatedAt,name:'Stale'}),/another tab/);await assert.rejects(repo.saveCampaign({...updated,name:'Missing revision'}),/another tab/);const copy=await repo.duplicateCampaign(updated.id);assert.notEqual(copy.id,updated.id);assert.deepEqual(copy.content,updated.content);await repo.saveCampaign({...copy,expectedUpdatedAt:copy.updatedAt,name:'Independent'});assert.equal((await repo.getCampaign(updated.id)).name,'Updated');
});
test('direct production repository calls cannot edit sent/sending, missing or cross-tenant campaigns',async()=>{
 let writes=0;const db={rpc:()=>{writes++;throw Error('unexpected mutation')}};const repo=new SupabaseMarketingRepository(db,{organization:{id:'tenant-a'},membership:{id:'member-a'}});
 for(const status of ['sent','sending']){repo.getCampaign=async()=>({...draft(),id:'historical',status,updatedAt:'revision'});await assert.rejects(repo.saveCampaign({...draft(),id:'historical',expectedUpdatedAt:'revision'}),/read-only/);}
 repo.getCampaign=async()=>undefined;await assert.rejects(repo.saveCampaign({...draft(),id:'other-tenant',expectedUpdatedAt:'revision'}),/not found/);assert.equal(writes,0);
});
test('simulated historical campaigns reject direct saves and allow independent duplication',async()=>{const repo=new SeedMarketingRepository();const first=await repo.saveCampaign(draft());for(const status of ['sending','sent']){markSeedCampaignDelivery(first.id,status);const current=await repo.getCampaign(first.id);await assert.rejects(repo.saveCampaign({...current,status:'draft',expectedUpdatedAt:current.updatedAt}),/read-only/);}const copy=await repo.duplicateCampaign(first.id);assert.equal(copy.status,'draft');assert.equal((await repo.getCampaign(first.id)).status,'sent');});
test('direct server action rejects historical writes before repository mutation',async()=>{
 let writes=0;globalThis.__studioActionFixture={status:'resolved',composition:{dependencies:{marketing:{getCampaign:async()=>({...draft(),id:'sent',status:'sent',updatedAt:'revision'}),saveCampaign:async()=>{writes++;}}}}};
 try{await assert.rejects(saveCampaignAction({...draft(),id:'sent',expectedUpdatedAt:'revision'}),/read-only/);assert.equal(writes,0);}finally{delete globalThis.__studioActionFixture;}
});
test('expected action errors remain readable in the production transport result',async()=>{globalThis.__studioActionFixture={status:'resolved',composition:{dependencies:{marketing:{getCampaign:async()=>({...draft(),id:'draft',updatedAt:'newer'})}}}};try{const result=await saveStudioDraftAction({...draft(),id:'draft',expectedUpdatedAt:'older'});assert.equal(result.ok,false);assert.match(result.error,/another tab/);}finally{delete globalThis.__studioActionFixture;}});

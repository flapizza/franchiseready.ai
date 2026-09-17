import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import JSZip from 'jszip';
import sharp from 'sharp';
import {BrandIntelligenceRuntime} from '../../feature/brand-library/runtime/BrandIntelligenceRuntime.ts';
import {buildPresentation,defaultOptions,presentationScene} from '../../feature/brand-presentation/buildPresentation.ts';
import {renderPptx} from '../../feature/brand-presentation/renderPptx.ts';
import {prepareExport as preparePresentationExport} from '../../feature/brand-presentation/buildPresentation.ts';
import {demoPresentationMedia} from '../../feature/brand-presentation/demoMedia.ts';
import {defaultDisclaimer,disclaimerText} from '../../feature/brand-presentation/model.ts';
const branding={version:1,name:'Synthetic Consultant',company:'Example Advisory',title:'Franchise Consultant',email:'consultant@studio.example',phone:'202-555-0100',website:'https://studio.example',postalAddress:'',linkedIn:'',scheduling:'',logo:null,headshot:null,primaryColor:'#172033',accentColor:'#2563EB',font:'arial'};
const profiles=await new BrandIntelligenceRuntime().getAll();
const profile=profiles.sort((a,b)=>b.completeness.knownFields-a.completeness.knownFields)[0];
const options=()=>defaultOptions(profile,branding);
test('persisted ERA preview and shared export receive photos while retaining authorized branding',()=>{
 const output=execFileSync(process.execPath,['--import','./tests/fixtures/register-typescript.mjs','--input-type=module','-e',`
  import assert from 'node:assert/strict';
  import {registerHooks} from 'node:module';
  const profile=JSON.parse(process.env.ERA_PROFILE),branding=JSON.parse(process.env.ERA_BRANDING);
  const logo={public_id:branding.logo,deliveryUrl:'authorized-logo',width:100,height:100};
  globalThis.eraComposition={status:'resolved',composition:{dependencies:{brandIntelligence:{getById:async id=>({...profile,id})}}}};
  globalThis.eraBranding=branding;
  globalThis.eraMedia=async ids=>{assert.ok(ids.every(id=>id===branding.logo),'foreign media rejected');return Object.fromEntries(ids.map(id=>[id,logo]));};
  registerHooks({resolve(specifier,context,next){
   if(context.parentURL?.endsWith('/brand-presentation/server.ts')){
    const source=specifier==='../platform/composition/resolveWorkspaceComposition'?'export const resolveWorkspaceComposition=async()=>globalThis.eraComposition':specifier==='../marketing/media/server'?'export const resolveBranding=async()=>globalThis.eraBranding;export const resolveMediaAssets=globalThis.eraMedia':null;
    if(source)return {url:'data:text/javascript,'+encodeURIComponent(source),shortCircuit:true};
   }
   return next(specifier,context);
  }});
  const {loadPresentationWorkspace,preparePresentationExport}=await import('./feature/brand-presentation/server.ts');
  const {defaultOptions}=await import('./feature/brand-presentation/buildPresentation.ts');
  for(const id of ['era-group','other-brand']){
   const preview=await loadPresentationWorkspace(id),exported=await preparePresentationExport(id,preview.options);
   assert.deepEqual(preview.options.branding,defaultOptions(preview.profile,branding).branding);
   assert.deepEqual(preview.options.visualIdentity,defaultOptions(preview.profile,branding).visualIdentity);
   assert.equal(preview.options.assets.companyLogo,branding.logo);
   assert.deepEqual(preview.assets[branding.logo],logo);
   assert.deepEqual(exported.assets,preview.assets);
   assert.deepEqual(exported.presentation.options,preview.options);
   if(id==='era-group'){
    assert.equal(Object.keys(preview.demoAssets).length,8);assert.ok(preview.options.assets.hero);
    assert.equal(Object.keys(preview.assets).length,9);
    await assert.rejects(preparePresentationExport(id,{...preview.options,assets:{...preview.options.assets,hero:'asset_'+'f'.repeat(32)}}),/foreign media rejected/);
   }else{assert.equal(preview.demoAssets,undefined);assert.equal(preview.options.assets.hero,null);}
  }
  console.log('passed');
 `],{encoding:'utf8',windowsHide:true,env:{...process.env,ERA_PROFILE:JSON.stringify(profiles.find(p=>p.id==='era-group')),ERA_BRANDING:JSON.stringify({...branding,name:'Alex Morgan',company:'FranGroove Demo',logo:'asset_'+'c'.repeat(32)})}});
 assert.equal(output.trim(),'passed');
});
test('demo media imports and loads with Sharp unavailable',()=>{
 const output=execFileSync(process.execPath,['--import','./tests/fixtures/register-typescript.mjs','--input-type=module','-e',`
  import {registerHooks} from 'node:module';
  registerHooks({resolve(specifier,context,next){if(specifier==='sharp'||specifier.startsWith('@img/'))throw Error('Native image processing forbidden');return next(specifier,context);}});
  const {demoPresentationMedia}=await import('./feature/brand-presentation/demoMedia.ts');
  const assets=Object.values(await demoPresentationMedia());
  for(const asset of assets){const png=Buffer.from(asset.deliveryUrl.split(',')[1],'base64');if(png.toString('hex',0,8)!=='89504e470d0a1a0a'||png.readUInt32BE(16)!==asset.width||png.readUInt32BE(20)!==asset.height)throw Error('Invalid static PNG');}
  console.log(assets.length);
 `],{encoding:'utf8',windowsHide:true});
 assert.equal(output.trim(),'8');
});
test('demo media is deterministic, export allowlisted and does not call workspace media',async()=>{
 const demoAssets=await demoPresentationMedia(),again=await demoPresentationMedia();assert.deepEqual(demoAssets,again);assert.equal(Object.keys(demoAssets).length,8);
 const o=options();[o.assets.brandLogo,o.assets.hero,o.assets.image2,o.assets.image3]=Object.keys(demoAssets);
 const dependencies={load:async()=>({profile,mediaAvailable:true,demoAssets}),media:async()=>{throw Error('Real library must not be called')}};
 const result=await preparePresentationExport(profile.id,o,dependencies);assert.equal(Object.keys(result.assets).length,4);
 const bytes=await renderPptx(result.presentation,result.assets);const zip=await JSZip.loadAsync(bytes);
 assert.match(await zip.file('ppt/slides/slide5.xml').async('string'),/not an offer to sell a franchise/);
 assert.match(await zip.file('ppt/notesSlides/notesSlide5.xml').async('string'),/Franchise Disclosure Document/);
 await assert.rejects(preparePresentationExport(profile.id,{...o,assets:{...o.assets,hero:'asset_'+'f'.repeat(32)}},dependencies),/Real library must not be called/);
});
test('disclaimer is presentation metadata with replacement and supplement semantics',()=>{
 const p=buildPresentation(profile,options());assert.equal(disclaimerText(p.disclaimer),defaultDisclaimer);
 assert.ok(!p.slides.some(s=>s.facts.some(f=>f.value.includes(defaultDisclaimer))));
 assert.equal(disclaimerText({...p.disclaimer,mode:'replace',brandSpecificText:'Required brand copy'}),'Required brand copy');
 assert.equal(disclaimerText({...p.disclaimer,brandSpecificText:'Additional copy'}),defaultDisclaimer+' Additional copy');
});
test('five governed slides retain demo qualifications, unknowns and full provenance',()=>{
 const p=buildPresentation(profile,options());assert.equal(p.slides.length,5);assert.match(p.label,/DEMO/);
 assert.ok(p.slides.every(s=>s.notes.includes(profile.version.id)));
 assert.match(p.slides[0].notes,/unverified/i);
 assert.ok(!p.slides[2].facts.some(f=>f.label==='Franchise fee'));
 const edited=structuredClone(profile);edited.economics.initialInvestment.value={minimum:10000,maximum:null,currency:'USD'};
 assert.match(buildPresentation(edited,options()).slides[2].facts.find(f=>f.label==='Initial investment').value,/Unknown/);
});
test('internal, conflicting and unknown facts cannot leak through derived summaries',()=>{
 const p=structuredClone(profile);p.description.approval='internal-only';p.description.value='FORBIDDEN';p.differentiators.verification='conflicting';p.differentiators.value=['FORBIDDEN'];p.consultantIntelligence.businessSummary.value='FORBIDDEN';
 assert.ok(!JSON.stringify(buildPresentation(p,options())).includes('FORBIDDEN'));
});
test('bounded edits and optional sections never accept client facts or arbitrary URLs',()=>{
 assert.throws(()=>buildPresentation(profile,{...options(),facts:['invented']}));
 assert.throws(()=>buildPresentation(profile,{...options(),title:'x'.repeat(71)}));
 assert.throws(()=>buildPresentation(profile,{...options(),assets:{...options().assets,hero:'https://other.example/image'}}));
 const p=buildPresentation(profile,{...options(),showFees:false,showSupport:false,showConsiderations:false});
 assert.ok(!p.slides[2].facts.some(f=>f.label==='Royalty'));assert.ok(!p.slides[3].facts.some(f=>f.label.includes('support')));
});
test('export reauthorization, stale version and foreign media fail closed',async()=>{
 const workspace={profile,options:options(),assets:{},mediaAvailable:true};let reads=0;
 const dependencies={load:async()=>{reads++;return workspace},media:async()=>{throw Error('foreign media')}};
 await assert.rejects(preparePresentationExport(profile.id,{...options(),expectedVersion:'stale'},dependencies),/changed/);assert.equal(reads,1);
 await assert.rejects(preparePresentationExport(profile.id,options(),{...dependencies,load:async()=>{throw Error('unauthorized')}}),/unauthorized/);
 await assert.rejects(preparePresentationExport(profile.id,{...options(),assets:{...options().assets,hero:'asset_'+'a'.repeat(32)}},dependencies),/foreign media/);
});
test('editable PPTX contains five slides, embedded image and source notes',async()=>{
 const id='asset_'+'a'.repeat(32),o=options();o.assets.hero=id;o.assets.brandLogo=id;o.assets.companyLogo=id;o.assets.image2=id;o.assets.image3=id;
 const png=await sharp({create:{width:800,height:400,channels:3,background:'#2563EB'}}).png().toBuffer();
 const p=buildPresentation(profile,o),bytes=await renderPptx(p,{[id]:{public_id:id,deliveryUrl:'fixture',width:800,height:400}},async()=>`image/png;base64,${png.toString('base64')}`);
 const zip=await JSZip.loadAsync(bytes);assert.equal(zip.file(/^ppt\/slides\/slide\d+\.xml$/).length,5);assert.equal(zip.file(/^ppt\/notesSlides\/notesSlide\d+\.xml$/).length,5);
 const cover=await zip.file('ppt/slides/slide1.xml').async('string');assert.match(cover,/<a:t>/);assert.match(cover,/Synthetic Consultant/);assert.match(cover,/<p:pic>/);
 assert.match(await zip.file('ppt/notesSlides/notesSlide1.xml').async('string'),/Internal demo material/);
 for(let i=0;i<5;i++)for(const e of presentationScene(p,i).elements){assert.ok(e.x>=0&&e.y>=0&&e.x+e.w<=13.334&&e.y+e.h<=7.5);if(e.kind==='image'&&[o.assets.brandLogo,o.assets.companyLogo].includes(e.assetId))assert.ok(['contain','cover'].includes(e.fit));}
});

test('brand-only narrative, purpose imagery and varied shared compositions',async()=>{
 const edited=structuredClone(profile);edited.discoveryQuestions.value=['DISCOVERY MUST NOT APPEAR'];
 const o=defaultOptions(edited,branding),assets=await demoPresentationMedia();
 const slots=['brandLogo','hero','image2','image3','location','productService','operations','customerExperience','team','marketing'];
 slots.forEach((slot,i)=>o.assets[slot]=Object.keys(assets)[i%8]);
 const p=buildPresentation(edited,o);
 assert.deepEqual(p.slides.map(s=>s.title),['Brand Overview','The Business & Ownership Model','Investment & Financial Structure','Training, Support & Brand Advantages','The Franchise Opportunity']);
 assert.ok(!JSON.stringify(p).includes('DISCOVERY MUST NOT APPEAR'));
 assert.ok(p.slides[4].facts.some(f=>f.provenance.startsWith('website')));
 edited.website.approval='internal-only';edited.characteristics.territoryModel.verification='unknown';
 assert.ok(!buildPresentation(edited,o).slides[4].facts.some(f=>['Website','Territory model'].includes(f.label)));
 const scenes=p.slides.map((_,i)=>presentationScene(p,i));
 assert.deepEqual(scenes.map(s=>s.elements.filter(e=>e.kind==='image').length),[4,3,0,3,3]);
 assert.equal(new Set(scenes.map(s=>s.background)).size,3);
 for(const scene of scenes)for(const e of scene.elements)assert.ok(e.x>=0&&e.y>=0&&e.x+e.w<=13.334&&e.y+e.h<=7.5);
 const zip=await JSZip.loadAsync(await renderPptx(p,assets));
 for(let i=0;i<5;i++){const xml=await zip.file('ppt/slides/slide'+(i+1)+'.xml').async('string');assert.equal((xml.match(/<p:pic>/g)||[]).length,scenes[i].elements.filter(e=>e.kind==='image').length);assert.match(xml,/<a:t>/);}
 assert.throws(()=>buildPresentation(profile,{...o,visualIdentity:{...o.visualIdentity,secondaryColor:'red'}}));
});

 test('ERA defaults embed all eight supplied PNGs and preserve presentation governance',async()=>{
 const {applyEraDemoPhotography}=await import('../../feature/brand-presentation/eraDemoPhotography.ts');
 const {readFile,writeFile}=await import('node:fs/promises');
 const {default:fixtures}=await import('../../feature/brand-presentation/demoMediaData.json',{with:{type:'json'}});
 const era=profiles.find(p=>p.id==='era-group');assert.ok(era);
 const o=defaultOptions(era,{...branding,name:'Jim Wood',company:'FranGroove AI',title:'Senior Franchise Consultant',email:'jim@frangroove.ai'});
 const original=buildPresentation(era,o);applyEraDemoPhotography(era.id,o);
 const other=options(),before=structuredClone(other);applyEraDemoPhotography('other-brand',other);assert.deepEqual(other,before);
 const assets=await demoPresentationMedia(),p=buildPresentation(era,o);
 assert.deepEqual(p.slides.map(s=>s.facts),original.slides.map(s=>s.facts));assert.equal(o.imageFit,'contain');assert.equal(o.assets.brandLogo,null);
 const scenes=p.slides.map((_,i)=>presentationScene(p,i));
 assert.deepEqual(scenes.map(s=>s.elements.filter(e=>e.kind==='image').length),[3,3,0,3,3]);
 assert.equal(new Set(scenes.flatMap(s=>s.elements.filter(e=>e.kind==='image').map(e=>e.assetId))).size,8);
 for(const scene of scenes)assert.ok(!scene.elements.some(e=>e.kind==='shape'&&e.color===o.visualIdentity.secondaryColor&&e.w*e.h>1));
 const cleared=structuredClone(o);for(const slot of Object.keys(cleared.assets))cleared.assets[slot]=null;
 for(let i=0;i<5;i++)assert.ok(!presentationScene(buildPresentation(era,cleared),i).elements.some(e=>e.kind==='shape'&&e.color===o.visualIdentity.secondaryColor&&e.w*e.h>1));
 const bytes=await renderPptx(p,assets),zip=await JSZip.loadAsync(bytes);
 assert.equal(zip.file(/^ppt\/slides\/slide\d+\.xml$/).length,5);
 const embedded=await Promise.all(zip.file(/^ppt\/media\//).filter(f=>!f.dir).map(f=>f.async('nodebuffer')));
 for(const f of fixtures){const supplied=await readFile(new URL('../../feature/brand-presentation/demo-assets/'+f.file,import.meta.url));assert.ok(embedded.some(b=>b.equals(supplied)),f.file);}
 for(let i=1;i<=5;i++){
 const xml=await zip.file(`ppt/slides/slide${i}.xml`).async('string');assert.match(xml,/<a:t>/);assert.match(xml,/Jim Wood/);
 const notes=await zip.file(`ppt/notesSlides/notesSlide${i}.xml`).async('string');assert.ok(notes.includes(era.version.id));assert.match(notes,/OpenAI image generation/);assert.match(notes,/Not governed ERA media/);
 const rels=await zip.file(`ppt/slides/_rels/slide${i}.xml.rels`).async('string');assert.doesNotMatch(rels,/TargetMode="External"/);
 }
 const closing=await zip.file('ppt/slides/slide5.xml').async('string');assert.match(closing,/not an offer to sell a franchise/);assert.match(closing,/Senior Franchise Consultant/);assert.match(closing,/jim@frangroove.ai/);
 if(process.env.ERA_SAMPLE_PPTX)await writeFile(process.env.ERA_SAMPLE_PPTX,bytes);
 });

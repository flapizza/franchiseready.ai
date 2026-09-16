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
test('demo media imports and loads with Sharp unavailable',()=>{
 const output=execFileSync(process.execPath,['--import','./tests/fixtures/register-typescript.mjs','--input-type=module','-e',`
  import {registerHooks} from 'node:module';
  registerHooks({resolve(specifier,context,next){if(specifier==='sharp'||specifier.startsWith('@img/'))throw Error('Native image processing forbidden');return next(specifier,context);}});
  const {demoPresentationMedia}=await import('./feature/brand-presentation/demoMedia.ts');
  const assets=Object.values(await demoPresentationMedia());
  for(const asset of assets){const png=Buffer.from(asset.deliveryUrl.split(',')[1],'base64');if(png.toString('hex',0,8)!=='89504e470d0a1a0a'||png.readUInt32BE(16)!==asset.width||png.readUInt32BE(20)!==asset.height)throw Error('Invalid static PNG');}
  console.log(assets.length);
 `],{encoding:'utf8',windowsHide:true});
 assert.equal(output.trim(),'4');
});
test('demo media is deterministic, export allowlisted and does not call workspace media',async()=>{
 const demoAssets=await demoPresentationMedia(),again=await demoPresentationMedia();assert.deepEqual(demoAssets,again);assert.equal(Object.keys(demoAssets).length,4);
 const o=options();[o.assets.brandLogo,o.assets.hero,o.assets.image2,o.assets.image3]=Object.keys(demoAssets);
 const dependencies={load:async()=>({profile,mediaAvailable:true,demoAssets}),media:async()=>{throw Error('Real library must not be called')}};
 const result=await preparePresentationExport(profile.id,o,dependencies);assert.equal(Object.keys(result.assets).length,4);
 const bytes=await renderPptx(result.presentation,result.assets);const zip=await JSZip.loadAsync(bytes);
 assert.match(await zip.file('ppt/slides/slide5.xml').async('string'),/not an offer to sell a franchise/);
 assert.match(await zip.file('ppt/notesSlides/notesSlide5.xml').async('string'),/Franchise Disclosure Document/);
 await assert.rejects(preparePresentationExport(profile.id,{...o,assets:{...o.assets,hero:'asset_'+'f'.repeat(32)}},dependencies),/no longer available/);
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

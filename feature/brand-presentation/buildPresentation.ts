import type { BrandFact, BrandIntelligenceProfile } from '../brand-library/models/BrandIntelligenceProfile';
import type { BrandingSnapshot } from '../marketing/media/model';
import { defaultDisclaimer, disclaimerText, optionsSchema, selectedAssetIds, slideTitles, type AssetMap, type Presentation, type PresentationOptions, type SlideFact, type Scene, type Element, PresentationError } from './model';

export async function prepareExport(brandId:string,input:unknown,dependencies:{load:(id:string)=>Promise<{profile:BrandIntelligenceProfile;mediaAvailable:boolean;demoAssets?:AssetMap}>;media:(ids:string[])=>Promise<AssetMap>}) {
  const options=optionsSchema.parse(input),workspace=await dependencies.load(brandId);
  const presentation=buildPresentation(workspace.profile,options),ids=selectedAssetIds(options);
  if(!workspace.mediaAvailable&&ids.length)throw new PresentationError('Workspace media is unavailable in conference demo mode.');
  const assets=workspace.demoAssets?Object.fromEntries(ids.filter(id=>workspace.demoAssets![id]).map(id=>[id,workspace.demoAssets![id]])):ids.length?await dependencies.media(ids):{};
  if(ids.some(id=>!assets[id]))throw new PresentationError('A selected workspace image is no longer available.',409);
  return {presentation,assets};
}

export function eligible(fact:BrandFact<unknown>|undefined):fact is BrandFact<unknown> {
  return !!fact && fact.value!==null && fact.value!==undefined && fact.value!=='unknown' && fact.knowledgeState!=='unknown' && fact.approval==='approved-for-presentation' && !['conflicting','unknown'].includes(fact.verification) && !fact.evidence.some(e=>e.verification==='conflicting');
}
function format(value:unknown):string {
  const money=(n:unknown)=>typeof n==='number'?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n):'Unknown';
  if(typeof value==='number')return money(value);
  if(typeof value==='boolean')return value?'Yes':'No';
  if(Array.isArray(value))return value.map(v=>typeof v==='object'&&v!==null&&'name' in v?`${v.name}: ${v.amount}`:format(v)).join(' • ');
  if(typeof value==='object'&&value!==null&&'minimum' in value&&'maximum' in value)return `${money(value.minimum)} – ${money(value.maximum)}`;
  return String(value).replace(/\b([a-z]+)-([a-z]+)\b/g,'$1 $2');
}
export function defaultOptions(profile:BrandIntelligenceProfile,b:BrandingSnapshot):PresentationOptions {
  return optionsSchema.parse({expectedVersion:profile.version.id,title:'',subtitle:'',showSupport:true,showFees:true,showConsiderations:true,imageFit:'cover',assets:{brandLogo:null,hero:null,image2:null,image3:null,companyLogo:b.logo},branding:{name:b.name.slice(0,70),company:b.company.slice(0,80),title:b.title.slice(0,90),email:b.email.slice(0,100),phone:b.phone.slice(0,40),website:b.website.slice(0,140),primaryColor:b.primaryColor,accentColor:b.accentColor,font:b.font}});
}
export function buildPresentation(profile:BrandIntelligenceProfile,input:unknown):Presentation {
  const o=optionsSchema.parse(input);
  if(o.expectedVersion!==profile.version.id)throw new PresentationError('The published brand profile changed. Reload the Studio before downloading.',409);
  const fact=(path:string):BrandFact<unknown>|undefined=>path.split('.').reduce<unknown>((v,k)=>v&&typeof v==='object'?(v as Record<string,unknown>)[k]:undefined,profile) as BrandFact<unknown>|undefined;
  const pick=(items:[string,string][]):SlideFact[]=>items.flatMap(([label,path])=>{
    const f=fact(path);if(!eligible(f))return [];
    const value=format(f.value);if(!value.trim())return [];
    const inferred=f.evidence.some(e=>e.sourceType==='inferred');
    const qualification=`${f.verification==='verified'?'Verified':f.verification==='reviewed'?'Reviewed; not independently verified':'Unverified'}${inferred?' · inferred':''}`;
    return [{label,value,qualification,provenance:[path,qualification,f.notes,...f.evidence.map(e=>[e.title,e.sourceType,e.verification,e.sourceDate,e.sourceUrl,e.documentReference,e.fddReference?`FDD ${e.fddReference.item??''} p. ${e.fddReference.page??''}`:'',e.notes].filter(Boolean).join(' | '))].filter(Boolean).join('\n')}];
  });
  const content:[string,string][][]=[
    [['About the brand','description'],['Category','category'],['Industry','industry'],['Website','website']],
    [['Customers','characteristics.customerModel'],['Operating model','characteristics.businessType'],['Operating locations','characteristics.operatingLocations'],['Owner involvement','characteristics.ownerOperatorSuitability'],['Customer acquisition','characteristics.customerAcquisitionModel']],
    [['Initial investment','economics.initialInvestment'],['Liquid capital','economics.minimumLiquidCapital'],['Net worth','economics.minimumNetWorth'],...(o.showFees?[['Franchise fee','economics.franchiseFee'],['Royalty','economics.royalty'],['Marketing fund','economics.marketingFund']] as [string,string][]:[])],
    [['Differentiators','differentiators'],['Ownership lifestyle','fit.desiredLifestyle'],...(o.showSupport?[['Initial training','support.initialTraining'],['Ongoing support','support.ongoingSupport']] as [string,string][]:[])],
    [['Questions to explore','discoveryQuestions'],...(o.showConsiderations?[['Considerations','considerations']] as [string,string][]:[])],
  ];
  const label=profile.version.origin==='local-test-fixture'?'LOCAL DEMO · NOT VERIFIED':profile.demoClassification!=='not-demo'?'DEMO MATERIAL · NOT VERIFIED':'BRAND INTELLIGENCE';
  const slides=content.map((items,i)=>{
    const facts=pick(items);
    return {title:slideTitles[i],facts,notes:[profile.name,`Profile version: ${profile.version.id}`,`Published/effective: ${profile.version.publishedAt??profile.version.effectiveAt??'Unknown'}`,label,'Consultant discussion material; not a purchase recommendation, performance claim or candidate-fit guarantee. Unknown or non-approved facts are omitted. Any abbreviated text is reproduced in full below. Images are explicit consultant selections, not independently verified brand imagery.',...facts.map(f=>`${f.label}: ${f.value}\n${f.provenance}`)].join('\n\n')};
  });
  return {brandId:profile.id,brandName:profile.name,version:profile.version.id,label,options:o,slides,disclaimer:{defaultText:defaultDisclaimer,brandSpecificText:null,mode:'supplement'}};
}
const shorten=(s:string,n:number)=>s.length>n?s.slice(0,n-1).trimEnd()+'…':s;
/** One geometry/text model drives both browser and editable PowerPoint output. Inches, 16:9. */
export function presentationScene(p:Presentation,index:number):Scene {
  const slide=p.slides[index],o=p.options,b=o.branding,cover=index===0,closing=index===4,dark=cover||closing;
  const background=dark?b.primaryColor:'#F5F6F8',ink=dark?'#FFFFFF':'#172033',muted=dark?'#E2E8F0':'#475569';
  const elements:Element[]=[];
  const shape=(x:number,y:number,w:number,h:number,color:string)=>elements.push({kind:'shape',x,y,w,h,color});
  const text=(x:number,y:number,w:number,h:number,value:string,size=16,color=ink,bold=false)=>{
    if(!value)return;
    // Conservative, deterministic wrapping budget shared by preview and export.
    const lines=(font:number)=>value.split('\n').reduce((total,line)=>{const capacity=Math.max(1,Math.floor(w*72/(font*.58)));let used=0,count=1;for(const word of line.split(' ')){if(used&&used+word.length+1>capacity){count++;used=0;}count+=Math.max(0,Math.ceil(word.length/capacity)-1);used=used?used+word.length+1:word.length%capacity||capacity;}return total+count;},0);
    while(size>8&&lines(size)*size*1.16>h*72)size-=.5;
    elements.push({kind:'text',x,y,w,h,text:value,size,color,bold});
  };
  const image=(slot:keyof typeof o.assets,x:number,y:number,w:number,h:number,logo=false)=>{const id=o.assets[slot];if(id)elements.push({kind:'image',assetId:id,x,y,w,h,fit:logo?'contain':o.imageFit});};
  shape(.45,.45,.09,.32,b.accentColor);text(.7,.45,10,.24,p.label,10,muted,true);
  text(11.6,.45,1,.25,`${index+1} / 5`,11,muted);
  if(cover){
    image('brandLogo',.7,1,2.2,.65,true);
    text(.7,o.assets.brandLogo?1.85:1.25,7,1.25,shorten(o.title||p.brandName,70),34,ink,true);
    const summary=slide.facts.find(f=>f.label==='About the brand');
    text(.7,3.2,7,1.25,shorten(o.subtitle||summary?.value||'A guided franchise discussion',200),19,muted);
    text(.7,4.58,7,.3,summary?.qualification??'No approved description available',10,muted);
    shape(.7,5.1,6.8,.02,b.accentColor);
    text(.7,5.35,6.7,.4,shorten(b.name||'Your franchise consultant',70),22,ink,true);
    text(.7,5.85,6.7,.55,[b.title,b.company].filter(Boolean).join(' · '),13,muted);
    if(o.assets.hero)image('hero',8.35,1.1,4.3,4.95);else {shape(8.35,1.1,4.3,4.95,b.accentColor);text(8.75,2,3.5,2,'Explore.\nUnderstand.\nDiscuss.',29,'#FFFFFF',true);}
    image('companyLogo',10.9,6.25,1.75,.45,true);
  }else if(closing){
    text(.7,1,11.6,.8,'Let’s explore the next step.',32,ink,true);
    const rows=slide.facts.slice(0,2);
    rows.forEach((f,i)=>{text(.7,2.15+i*1.15,7.2,.3,f.label,14,ink,true);text(.7,2.55+i*1.15,7.2,.7,shorten(f.value,160),16,muted);});
    if(!rows.length)text(.7,2.15,7,1.4,'Discuss ownership responsibilities, confirm current economics, and request supporting franchisor information.',21,muted);
    shape(8.5,2,4.15,3.8,b.accentColor);image('companyLogo',8.85,2.3,3.3,.6,true);
    text(8.85,3.1,3.3,.65,shorten(b.name||'Your consultant',45),22,'#FFFFFF',true);
    text(8.85,3.85,3.3,.65,shorten(b.company,75),15,'#FFFFFF');
    text(8.85,4.65,3.3,.9,[b.email,b.phone].filter(Boolean).join('\n'),11,'#FFFFFF');
    text(.7,5.75,7.1,.6,shorten(b.website,110),12,muted);
  }else{
    text(.7,1,11.8,.9,slide.title,index===3?28:32,ink,true);
    const media=index===1?o.assets.image2??o.assets.hero:index===3?o.assets.image3??o.assets.hero:null;
    const rows=slide.facts.slice(0,index===2?6:4),available=media?7.35:11.95;
    const columns=index===2||!media?2:1,w=(available-.25*(columns-1))/columns,h=columns===1?.96:1.32;
    if(!rows.length)text(.7,2.25,7,1.5,'Reviewed presentation information is not yet available. Confirm these details with the franchisor.',23,muted);
    rows.forEach((f,i)=>{const x=.7+(i%columns)*(w+.25),y=2.15+Math.floor(i/columns)*(h+.18);shape(x,y,w,h,'#FFFFFF');text(x+.18,y+.12,w-.36,.24,f.label,11,muted,true);text(x+.18,y+.42,w-.36,h-.68,shorten(f.value,index===2?75:columns===1?100:150),index===2?21:15,ink,index===2);text(x+.18,y+h-.23,w-.36,.15,f.qualification,8,muted);});
    if(media)elements.push({kind:'image',assetId:media,x:8.35,y:2.15,w:4.3,h:4.05,fit:o.imageFit});
  }
  text(.7,closing?6.05:6.65,11.95,.32,slide.facts.length?`Sources: ${[...new Set(slide.facts.map(f=>f.qualification))].join(' / ')}. Full facts and source references in slide notes.`:'Unknown or non-approved facts omitted. Confirm current information with the franchisor.',9,muted);
  if(closing)text(.7,6.45,11.95,.48,disclaimerText(p.disclaimer),10,muted);
  text(.7,7.04,10.6,.2,shorten([b.name,b.company,cover||closing?'Discussion material · No performance or fit guarantee':'Consultant discussion material'].filter(Boolean).join('  |  '),170),9,muted);
  return {background,elements,notes:slide.notes+'\n\nPresentation disclaimer (not a brand fact):\n'+disclaimerText(p.disclaimer)};
}

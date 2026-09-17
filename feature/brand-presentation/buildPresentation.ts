import { demoPhotographyNotice, demoPhotographySources } from './eraDemoPhotography';
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
  return optionsSchema.parse({expectedVersion:profile.version.id,title:'',subtitle:'',showSupport:true,showFees:true,showConsiderations:true,imageFit:'cover',assets:{brandLogo:null,hero:null,image2:null,image3:null,location:null,productService:null,operations:null,customerExperience:null,team:null,marketing:null,companyLogo:b.logo},visualIdentity:{primaryColor:'#172033',secondaryColor:'#2563EB',accentColor:'#047857'},branding:{name:b.name.slice(0,70),company:b.company.slice(0,80),title:b.title.slice(0,90),email:b.email.slice(0,100),phone:b.phone.slice(0,40),website:b.website.slice(0,140),primaryColor:b.primaryColor,accentColor:b.accentColor,font:b.font}});
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
    [['Differentiators','differentiators'],...(o.showSupport?[['Initial training','support.initialTraining'],['Ongoing support','support.ongoingSupport'],['Marketing support','support.marketingSupport'],['Technology support','support.technologySupport']] as [string,string][]:[])],
    [['Territory model','characteristics.territoryModel'],['Markets','system.geography'],['Ownership formats','system.unitMix'],['Executive ownership','characteristics.executiveSuitability'],['Website','website'],...(o.showConsiderations?[['Considerations','considerations']] as [string,string][]:[])],
  ];
  const label=profile.version.origin==='local-test-fixture'?'LOCAL DEMO · NOT VERIFIED':profile.demoClassification!=='not-demo'?'DEMO MATERIAL · NOT VERIFIED':'BRAND INTELLIGENCE';
  const slides=content.map((items,i)=>{
    const facts=pick(items);
    return {title:slideTitles[i],facts,notes:[profile.name,`Profile version: ${profile.version.id}`,`Published/effective: ${profile.version.publishedAt??profile.version.effectiveAt??'Unknown'}`,label,'Consultant discussion material; not a purchase recommendation, performance claim or candidate-fit guarantee. Unknown or non-approved facts are omitted. Any abbreviated text is reproduced in full below. Images are explicit consultant selections, not independently verified brand imagery.',...demoPhotographySources(o),...facts.map(f=>`${f.label}: ${f.value}\n${f.provenance}`)].join('\n\n')};
  });
  return {brandId:profile.id,brandName:profile.name,version:profile.version.id,label,options:o,slides,disclaimer:{defaultText:defaultDisclaimer,brandSpecificText:null,mode:'supplement'}};
}
const shorten=(s:string,n:number)=>s.length>n?s.slice(0,n-1).trimEnd()+'…':s;
/** One geometry/text model drives both browser and editable PowerPoint output. Inches, 16:9. */
export function presentationScene(p:Presentation,index:number):Scene {
  const slide=p.slides[index],o=p.options,b=o.branding,cover=index===0,closing=index===4,dark=cover||closing||index===2;
  const palette=o.visualIdentity;
  const background=dark?palette.primaryColor:index===3?'#EAF2F0':'#F5F6F8',ink=dark?'#FFFFFF':'#172033',muted=dark?'#E2E8F0':'#475569';
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

  const card=(f:SlideFact,x:number,y:number,w:number,h:number,color='#FFFFFF',large=false)=>{
    shape(x,y,w,h,color);shape(x,y,.055,h,palette.accentColor);
    text(x+.18,y+.13,w-.36,.3,f.label,11,'#475569',true);
    text(x+.18,y+.53,w-.36,h-.89,shorten(f.value,large?80:180),large?27:16,'#172033',large);
    text(x+.18,y+h-.23,w-.36,.16,f.qualification,8,'#475569');
  };
  const empty=()=>{if(!slide.facts.length)text(.7,2.2,7,1,'Approved brand information is not available for this section.',19,muted);};

  if(cover){
    shape(8,.95,.045,5.2,palette.secondaryColor);
    image('hero',8.25,.95,4.55,3.9);
    image('productService',8.25,5.02,2.18,1.12);image('location',10.6,5.02,2.2,1.12);
    image('brandLogo',.7,1.05,3.8,.9,true);
    text(.7,2.25,6.8,1.15,shorten(o.title||p.brandName,70),38,ink,true);
    const summary=slide.facts.find(f=>f.label==='About the brand');
    text(.7,3.65,6.8,1.25,shorten(o.subtitle||summary?.value||'Brand overview',190),19,muted);
    text(.7,5.05,6.8,.3,summary?.qualification??'No approved description available',10,muted);
    shape(.7,5.6,1,.07,palette.accentColor);
    text(.7,5.88,6.8,.45,[b.name,b.company].filter(Boolean).join(' | '),13,muted);
    text(.7,6.15,6.8,.22,b.title,10,muted);
  }else if(index===1){
    text(.7,1,11.9,.85,slide.title,30,ink,true);
    slide.facts.slice(0,4).forEach((f,i)=>card(f,.7+(i%2)*3.65,2.15+Math.floor(i/2)*1.97,3.45,1.77,i===0?'#EAF2F0':'#FFFFFF'));
    shape(8.25,2.15,.045,4,palette.secondaryColor);
    image(o.assets.operations?'operations':'image2',8.4,2.3,4.1,2.12);
    image('location',8.4,4.57,1.96,1.43);image('productService',10.51,4.57,1.99,1.43);empty();
  }else if(index===2){
    shape(0,0,.22,7.5,palette.accentColor);
    text(.7,1,11.9,.85,slide.title,30,ink,true);
    slide.facts.slice(0,3).forEach((f,i)=>card(f,i===0?.7:7.15,i===0?2.15:2.15+(i-1)*1.58,i===0?6.15:5.5,i===0?3:1.42,'#FFFFFF',true));
    slide.facts.slice(3,6).forEach((f,i)=>{const x=.7+i*4.06;text(x,5.48,3.85,.23,f.label,11,muted,true);text(x,5.88,3.85,.48,shorten(f.value,80),17,ink);});empty();
  }else if(index===3){
    shape(4.1,1.05,.045,4.97,palette.secondaryColor);
    image(o.assets.team?'team':'image3',.55,1.05,3.25,2.28);
    image('customerExperience',.55,3.5,3.25,1.25);image('marketing',.55,4.92,3.25,1.1);
    text(4.7,1,7.9,.95,slide.title,28,ink,true);
    slide.facts.slice(0,5).forEach((f,i)=>{
      const y=2.2+i*.79;
      shape(4.7,y,.07,.57,palette.accentColor);
      text(4.95,y,7.55,.22,f.label,11,'#475569',true);
      text(4.95,y+.26,7.55,.39,shorten(f.value,150),14,ink);
    });empty();
  }else{
    shape(8.6,1,.045,4.2,palette.secondaryColor);
    text(.7,1,7.6,.85,slide.title,30,ink,true);
    slide.facts.slice(0,6).forEach((f,i)=>{
      const x=.7+(i%2)*3.87,y=2.08+Math.floor(i/2)*.99;
      text(x,y,3.6,.23,f.label,11,muted,true);
      text(x,y+.31,3.6,.55,shorten(f.value,110),14,ink);
    });
    image(o.assets.marketing?'marketing':'hero',8.85,1,3.93,2.4);
    image(o.assets.image2?'image2':'location',8.85,3.57,1.87,1.6);image('customerExperience',10.89,3.57,1.89,1.6);
    shape(.7,5.25,7.5,.035,palette.accentColor);
    image('companyLogo',.7,5.48,1.1,.4,true);
    text(o.assets.companyLogo?2: .7,5.45,o.assets.companyLogo?6.1:7.4,.3,[b.name,b.company].filter(Boolean).join(' | '),12,ink,true);
    text(o.assets.companyLogo?2: .7,5.77,o.assets.companyLogo?6.1:7.4,.22,b.title,10,muted);
    text(.7,6.02,11.95,.2,[b.email,b.phone,b.website].filter(Boolean).join(' | '),10,muted);empty();
  }
  if(demoPhotographySources(o).length)text(.7,6.45,11.95,.16,demoPhotographyNotice,8,muted);
  shape(0,0,13.3333,.85,palette.primaryColor);
  shape(.45,.3,.09,.28,palette.accentColor);text(.7,.3,10,.24,p.label,10,'#E2E8F0',true);
  text(11.6,.3,1,.25,(index+1)+' / 5',11,'#E2E8F0');
  text(.7,closing?6.25:6.65,11.95,.32,slide.facts.length?`Sources: ${[...new Set(slide.facts.map(f=>f.qualification))].join(' / ')}. Full facts and source references in slide notes.`:'Unknown or non-approved facts omitted. Confirm current information with the franchisor.',9,muted);
  if(closing)text(.7,6.67,11.95,.48,disclaimerText(p.disclaimer),10,muted);
  text(.7,closing?7.27:7.04,11.95,.2,shorten([b.name,b.company,cover||closing?'Discussion material · No performance or fit guarantee':'Consultant discussion material'].filter(Boolean).join('  |  '),170),9,muted);
  return {background,elements,notes:slide.notes+'\n\nPresentation disclaimer (not a brand fact):\n'+disclaimerText(p.disclaimer)};
}

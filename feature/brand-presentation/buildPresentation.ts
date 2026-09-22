import { demoPhotographyNotice, demoPhotographySources } from './eraDemoPhotography';
import type { BrandFact, BrandIntelligenceProfile } from '../brand-library/models/BrandIntelligenceProfile';
import type { BrandingSnapshot } from '../marketing/media/model';
import { defaultDisclaimer, disclaimerText, optionsSchema, selectedAssetIds, slideTitles, type MediaPlacement, type AssetMap, type Presentation, type PresentationOptions, type SlideFact, type Scene, type Element, PresentationError } from './model';

export async function prepareExport(brandId:string,input:unknown,dependencies:{load:(id:string)=>Promise<{profile:BrandIntelligenceProfile;mediaAvailable:boolean;demoAssets?:AssetMap}>;media:(ids:string[])=>Promise<AssetMap>}) {
  const options=optionsSchema.parse(input),workspace=await dependencies.load(brandId);
  const presentation=buildPresentation(workspace.profile,options),ids=selectedAssetIds(options);
  if(!workspace.mediaAvailable&&ids.length)throw new PresentationError('Workspace media is unavailable in conference demo mode.');
  const persistedIds=ids.filter(id=>!workspace.demoAssets?.[id]);
  const assets={...(persistedIds.length?await dependencies.media(persistedIds):{}),...Object.fromEntries(ids.filter(id=>workspace.demoAssets?.[id]).map(id=>[id,workspace.demoAssets![id]]))};
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
/** The same rectangles drive slide output and Studio selection guidance. */
export const mediaPlacements:readonly MediaPlacement[]=[
  {slide:0,label:'Overview panorama',slot:'hero',fallbacks:[],x:.70,y:2.80,w:11.95,h:3.28},
  {slide:1,label:'Operations panorama',slot:'operations',fallbacks:['image2'],x:6.43,y:2.15,w:6.20,h:1.70},
  {slide:1,label:'Client / service panorama',slot:'productService',fallbacks:['location'],x:6.43,y:4.10,w:6.20,h:1.70},
  {slide:3,label:'Training / support panorama',slot:'team',fallbacks:['image3'],x:.70,y:1.95,w:9.00,h:2.47},
  {slide:4,label:'Closing panorama',slot:'image2',fallbacks:['marketing','hero','location'],x:.97,y:1.70,w:11.40,h:3.13},
];
export function placementSlot(placement:MediaPlacement,options:PresentationOptions) {
  return [placement.slot,...placement.fallbacks].find(slot=>options.assets[slot])??placement.slot;
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

  for(const placement of mediaPlacements.filter(item=>item.slide===index)){
    image(placementSlot(placement,o),placement.x,placement.y,placement.w,placement.h);
  }
  if(cover){
    image('brandLogo',10.05,1.02,2.6,.65,true);
    text(.7,1.02,o.assets.brandLogo?9.0:11.95,.65,shorten(o.title||p.brandName,70),34,ink,true);
    const summary=slide.facts.find(f=>f.label==='About the brand');
    text(.7,1.80,11.95,.64,shorten(o.subtitle||summary?.value||'Brand overview',190),19,muted);
    text(.7,2.51,11.95,.18,summary?.qualification??'No approved description available',10,muted);
    shape(.7,2.72,11.95,.025,palette.secondaryColor);
    text(.7,6.16,11.95,.23,[b.name,b.company,b.title].filter(Boolean).join(' | '),12,muted);
  }else if(index===1){
    text(.7,1,11.9,.85,slide.title,30,ink,true);
    slide.facts.forEach((f,i)=>{
      const y=2.15+i*.82;
      shape(.7,y,.055,.70,palette.accentColor);
      text(.88,y,5.13,.20,f.label,11,muted,true);
      text(.88,y+.25,5.13,.44,shorten(f.value,180),15,ink);
    });
    if(!slide.facts.length)text(.7,2.2,5.3,1,'Approved brand information is not available for this section.',19,muted);
  }else if(index===2){
    shape(0,0,.22,7.5,palette.accentColor);
    text(.7,1,11.9,.85,slide.title,30,ink,true);
    slide.facts.slice(0,3).forEach((f,i)=>card(f,i===0?.7:7.15,i===0?2.15:2.15+(i-1)*1.58,i===0?6.15:5.5,i===0?3:1.42,'#FFFFFF',true));
    slide.facts.slice(3,6).forEach((f,i)=>{const x=.7+i*4.06;text(x,5.48,3.85,.23,f.label,11,muted,true);text(x,5.88,3.85,.48,shorten(f.value,80),17,ink);});empty();
  }else if(index===3){
    text(.7,1,11.95,.75,slide.title,28,ink,true);
    const differentiators=slide.facts.find(f=>f.label==='Differentiators');
    if(differentiators){
      text(9.95,1.95,2.7,.24,differentiators.label,11,muted,true);
      text(9.95,2.30,2.7,2.12,shorten(differentiators.value,300),16,ink);
    }
    slide.facts.filter(f=>f!==differentiators).forEach((f,i)=>{
      const x=.7+(i%2)*6.1,y=4.62+Math.floor(i/2)*.86;
      shape(x,y,.055,.72,palette.accentColor);
      text(x+.18,y,5.65,.20,f.label,11,muted,true);
      text(x+.18,y+.25,5.65,.47,shorten(f.value,150),14,ink);
    });
    if(!slide.facts.length)text(.7,4.65,11.95,.7,'Approved brand information is not available for this section.',19,muted);
  }else{
    text(.7,.98,11.95,.60,slide.title,30,ink,true);
    slide.facts.forEach((f,i)=>{
      const x=.7+(i%3)*4.06,y=4.94+Math.floor(i/3)*.61;
      text(x,y,3.85,.17,f.label,10,muted,true);
      text(x,y+.20,3.85,.36,shorten(f.value,110),12,ink);
    });
    image('companyLogo',.7,6.18,1.1,.40,true);
    const identityX=o.assets.companyLogo?2:.7,identityW=o.assets.companyLogo?10.65:11.95;
    text(identityX,6.13,identityW,.27,[b.name,b.company,b.title].filter(Boolean).join(' | '),10,ink,true);
    text(identityX,6.42,identityW,.27,[b.email,b.phone,b.website].filter(Boolean).join(' | '),10,muted);
    if(!slide.facts.length)text(.7,4.94,11.95,.75,'Approved brand information is not available for this section.',19,muted);
  }
  if(demoPhotographySources(o).length)text(.7,closing?7.0:6.45,11.95,closing?.14:.16,demoPhotographyNotice,8,muted);
  shape(0,0,13.3333,.85,palette.primaryColor);
  shape(.45,.3,.09,.28,palette.accentColor);text(.7,.3,10,.24,p.label,10,'#E2E8F0',true);
  text(11.6,.3,1,.25,(index+1)+' / 5',11,'#E2E8F0');
  text(.7,closing?6.72:6.65,11.95,closing?.27:.32,slide.facts.length?`Sources: ${[...new Set(slide.facts.map(f=>f.qualification))].join(' / ')}. Full facts and source references in slide notes.`:'Unknown or non-approved facts omitted. Confirm current information with the franchisor.',9,muted);
  if(closing)text(.7,7.16,11.95,.32,disclaimerText(p.disclaimer),10,muted);
  if(!closing)text(.7,7.04,11.95,.2,shorten([b.name,b.company,cover||closing?'Discussion material · No performance or fit guarantee':'Consultant discussion material'].filter(Boolean).join('  |  '),170),9,muted);
  return {background,elements,notes:slide.notes+'\n\nPresentation disclaimer (not a brand fact):\n'+disclaimerText(p.disclaimer)};
}

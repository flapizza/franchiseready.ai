import 'server-only';
import pptxgen from 'pptxgenjs';
import { presentationScene } from './buildPresentation';
import { fonts, selectedAssetIds, type Presentation, type AssetMap, PresentationError } from './model';

export type ImageLoader=(url:string)=>Promise<string>;
async function downloadImage(url:string):Promise<string> {
  if(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(url)&&url.length<1024*1024)return url; // Server-generated demo fixture only.
  // URLs are produced only by the tenant-authorized media resolver, never by request JSON.
  const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(10000)});
  if(!response.ok||!response.headers.get('content-type')?.startsWith('image/png'))throw new PresentationError('A selected image could not be loaded.',409);
  const reader=response.body?.getReader();if(!reader)throw new PresentationError('Image unavailable.',409);
  const chunks:Uint8Array[]=[];let total=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>8*1024*1024)throw new PresentationError('Image exceeds export size limit.');chunks.push(value);}}finally{await reader.cancel();}
  return 'image/png;base64,'+Buffer.concat(chunks).toString('base64');
}
export async function renderPptx(p:Presentation,assets:AssetMap,load:ImageLoader=downloadImage):Promise<Buffer> {
  const pptx=new pptxgen();pptx.layout='LAYOUT_WIDE';pptx.author=p.options.branding.name;pptx.subject='Consultant franchise discussion';pptx.title=p.options.title||p.brandName;pptx.company=p.options.branding.company;
  pptx.theme={headFontFace:fonts[p.options.branding.font],bodyFontFace:fonts[p.options.branding.font]};
  const images:Record<string,string>={};
  await Promise.all(selectedAssetIds(p.options).map(async id=>{if(!assets[id])throw new PresentationError('Unauthorized or unavailable image.',403);images[id]=await load(assets[id].deliveryUrl);}));
  for(let i=0;i<5;i++){
    const scene=presentationScene(p,i),slide=pptx.addSlide();slide.background={color:scene.background.slice(1)};
    for(const e of scene.elements){
      if(e.kind==='shape')slide.addShape(pptx.ShapeType.rect,{x:e.x,y:e.y,w:e.w,h:e.h,line:{transparency:100},fill:{color:e.color.slice(1)}});
      else if(e.kind==='text')slide.addText(e.text,{x:e.x,y:e.y,w:e.w,h:e.h,fontFace:fonts[p.options.branding.font],fontSize:e.size,color:e.color.slice(1),bold:e.bold,margin:0,breakLine:false,valign:'top',fit:'shrink',paraSpaceAfter:0});
      else {
        const data=images[e.assetId],asset=assets[e.assetId];
        if(!asset.width||!asset.height)throw new PresentationError('Image dimensions unavailable.');
        const ratio=asset.width/asset.height;
        if(e.fit==='contain'){
          const w=Math.min(e.w,e.h*ratio),h=w/ratio;
          slide.addImage({data,x:e.x+(e.w-w)/2,y:e.y+(e.h-h)/2,w,h,altText:'Consultant-selected logo/image; not independently verified'});
        }else{
          // PptxGenJS sizing uses w/h as the source aspect, then crops to sizing.w/h.
          slide.addImage({data,x:e.x,y:e.y,w:asset.width/96,h:asset.height/96,sizing:{type:'cover',w:e.w,h:e.h},altText:'Consultant-selected image; brand identity not independently verified'});
        }
      }
    }
    slide.addNotes(scene.notes);
  }
  return Buffer.from(await pptx.write({outputType:'nodebuffer',compression:true}) as Buffer);
}

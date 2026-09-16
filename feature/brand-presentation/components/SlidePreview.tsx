'use client';
/* eslint-disable @next/next/no-img-element -- Authorized, normalized media variants are used by both renderers. */
import { presentationScene } from '../buildPresentation';
import { fonts, type Presentation, type AssetMap } from '../model';
export default function SlidePreview({presentation,index,assets}:{presentation:Presentation;index:number;assets:AssetMap}) {
  const scene=presentationScene(presentation,index);
  return <div data-slide-preview role="img" aria-label={`Slide ${index+1}: ${presentation.slides[index].title}`} className="relative aspect-video w-full overflow-hidden shadow-2xl" style={{background:scene.background,containerType:'inline-size',fontFamily:fonts[presentation.options.branding.font]}}>
    {scene.elements.map((e,i)=>{
      const style={position:'absolute' as const,left:`${e.x/13.333333*100}%`,top:`${e.y/7.5*100}%`,width:`${e.w/13.333333*100}%`,height:`${e.h/7.5*100}%`};
      if(e.kind==='shape')return <div key={i} style={{...style,background:e.color}}/>;
      if(e.kind==='image')return assets[e.assetId]?<img key={i} alt="Consultant-selected image" src={assets[e.assetId].deliveryUrl} style={{...style,objectFit:e.fit}}/>:null;
      return <div key={i} data-slide-text style={{...style,fontSize:`${e.size/9.6}cqw`,fontWeight:e.bold?700:400,color:e.color,lineHeight:1.12,whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{e.text}</div>;
    })}
  </div>;
}

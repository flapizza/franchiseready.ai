import fixtures from './demoMediaData.json' with { type: 'json' };
import { selectedAssetIds, type PresentationOptions } from './model';

export const demoPhotographyNotice='AI-generated demo imagery; not actual ERA personnel, clients, franchisees or offices.';

export function isEraDemoPhotographyEligible(brandId:string):boolean {
  return brandId==='era-group'||brandId==='brand_9302298fcb084a94a6ab3e9e4cdef17d';
}

/** Explicit ERA demo identities only; selections remain editable and presentation-local. */
export function applyEraDemoPhotography(brandId:string,options:PresentationOptions) {
  if(!isEraDemoPhotographyEligible(brandId))return;
  const id=(index:number)=>fixtures[index-1].id;
  Object.assign(options.assets,{hero:id(1),productService:id(2),operations:id(3),team:id(4),customerExperience:id(5),location:id(6),marketing:id(7),image2:id(8)});
  // Supplied panoramas retain the whole interaction rather than cropping out participants.
  options.imageFit='contain';
}

export function demoPhotographySources(options:PresentationOptions):string[] {
  return selectedAssetIds(options).flatMap(id=>{
    const fixture=fixtures.find(f=>f.id===id);
    return fixture?[`${demoPhotographyNotice} Source: OpenAI image generation; supplied ERA_Group_Demo_Photography/${fixture.file}. Not governed ERA media. See bundled demo-assets/README.txt.`]:[];
  });
}

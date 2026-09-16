import 'server-only';
import fixtures from './demoMediaData.json' with { type: 'json' };
import type { AssetMap } from './model';

/** Synthetic fixtures only. Same asset contract as the real library; never brand facts. */
export async function demoPresentationMedia():Promise<AssetMap> {
  // Pre-rendered from the original deterministic fixtures. No runtime image processing.
  const entries=fixtures.map(({id,label,width,height,pngBase64})=>{
    const url=`data:image/png;base64,${pngBase64}`;
    return [id,{public_id:id,version:1,default_alt:label,width,height,status:'ready',deliveryUrl:url,thumbnailUrl:url}] as const;
  });
  return Object.fromEntries(entries);
}

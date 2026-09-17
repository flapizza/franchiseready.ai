import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fixtures from './demoMediaData.json' with { type: 'json' };
import type { AssetMap } from './model';

/** Locally supplied AI-generated illustrative photography; never governed brand media. */
export async function demoPresentationMedia():Promise<AssetMap> {
  const entries=await Promise.all(fixtures.map(async ({id,file,label,width,height})=>{
    const png=await readFile(path.join(process.cwd(),'feature/brand-presentation/demo-assets',file));
    const url=`data:image/png;base64,${png.toString('base64')}`;
    return [id,{public_id:id,version:2,default_alt:`${label} — AI-generated illustrative demo; not actual ERA people or offices`,width,height,status:'ready',deliveryUrl:url,thumbnailUrl:url}] as const;
  }));
  return Object.fromEntries(entries);
}

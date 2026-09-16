import 'server-only';
import sharp from 'sharp';
import type { AssetMap } from './model';

/** Synthetic fixtures only. Same asset contract as the real library; never brand facts. */
export async function demoPresentationMedia():Promise<AssetMap> {
  const labels=['DEMO LOGO','DEMO HERO','DEMO IMAGE TWO','DEMO IMAGE THREE'];
  const entries=await Promise.all(labels.map(async(label,index)=>{
    const id=`asset_${String(index+1).repeat(32)}`,width=index===0?900:1200,height=index===0?300:800;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${index===0?'#ffffff':'#172033'}"/><circle cx="${width}" cy="0" r="${height*.9}" fill="#2563EB"/><rect x="60" y="${height*.3}" width="60" height="8" fill="#2dd4bf"/><text x="60" y="${height*.5}" font-family="Arial" font-size="${index===0?48:54}" fill="${index===0?'#172033':'#ffffff'}">${label}</text><text x="60" y="${height*.68}" font-family="Arial" font-size="22" fill="${index===0?'#475569':'#e2e8f0'}">Synthetic layout asset — not actual brand imagery</text></svg>`;
    const png=await sharp(Buffer.from(svg)).png().toBuffer(),url=`data:image/png;base64,${png.toString('base64')}`;
    return [id,{public_id:id,version:1,default_alt:label+' — synthetic, not actual brand imagery',width,height,status:'ready',deliveryUrl:url,thumbnailUrl:url}] as const;
  }));
  return Object.fromEntries(entries);
}

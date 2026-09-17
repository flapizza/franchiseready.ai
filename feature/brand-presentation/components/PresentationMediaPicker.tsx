'use client';
/* eslint-disable @next/next/no-img-element -- Fixed normalized demo PNGs share the MediaAsset contract. */
import MediaLibrary from '../../marketing/media/MediaLibrary';
import type { MediaAsset } from '../../marketing/media/model';
import type { AssetMap } from '../model';
export default function PresentationMediaPicker({demoAssets,onSelect,onClose}:{demoAssets?:AssetMap;onSelect:(asset:MediaAsset)=>void;onClose:()=>void}) {
  if(!demoAssets)return <MediaLibrary onSelect={onSelect} onClose={onClose}/>;
  return <section role="dialog" aria-label="Demo presentation imagery" className="rounded-2xl bg-white p-6"><div className="flex justify-between gap-4"><h2 className="text-xl font-bold">Demo presentation imagery</h2><button onClick={onClose}>Close library</button></div><p className="my-4 text-sm text-slate-600">AI-generated illustrative demo imagery, not actual ERA Group personnel, clients, franchisees or offices. Selections apply only to this presentation.</p><div className="grid grid-cols-2 gap-4">{Object.values(demoAssets).map(asset=><button key={asset.public_id} onClick={()=>onSelect(asset)} className="rounded-xl border p-3 text-left"><img src={asset.thumbnailUrl} alt="" className="h-32 w-full object-contain"/><span className="mt-2 block text-sm">{asset.default_alt}</span></button>)}</div></section>;
}

import { z } from 'zod';
import { assetIdSchema, type MediaAsset } from '../marketing/media/model';
import { colors, fontIds } from '../marketing/studio/document';

export const slideTitles = ['Brand Overview','Business Model','Investment & Economics','Why Candidates Consider This Brand','Discussion / Next Steps'] as const;
export const mediaSlots = ['brandLogo','hero','image2','image3','companyLogo'] as const;
export type MediaSlot = typeof mediaSlots[number];
const text = (max:number) => z.string().trim().max(max).refine(s=>!/[\u0000-\u001f]/.test(s),'Use a single line of text.');
export const optionsSchema = z.object({
  expectedVersion:text(200).min(1), title:text(70), subtitle:text(140),
  showSupport:z.boolean(), showFees:z.boolean(), showConsiderations:z.boolean(),
  imageFit:z.enum(['cover','contain']),
  assets:z.object({brandLogo:assetIdSchema.nullable(),hero:assetIdSchema.nullable(),image2:assetIdSchema.nullable(),image3:assetIdSchema.nullable(),companyLogo:assetIdSchema.nullable()}).strict(),
  branding:z.object({name:text(70),company:text(80),title:text(90),email:text(100),phone:text(40),website:text(140),primaryColor:z.enum(colors),accentColor:z.enum(colors),font:z.enum(fontIds)}).strict(),
}).strict();
export type PresentationOptions = z.infer<typeof optionsSchema>;
export type AssetMap = Record<string,MediaAsset>;
export interface SlideFact { label:string; value:string; qualification:string; provenance:string }
export interface PresentationSlide { title:string; facts:SlideFact[]; notes:string }
export const defaultDisclaimer='For informational discussion only; this presentation is not an offer to sell a franchise. Refer to the applicable Franchise Disclosure Document for formal franchise offering and disclosure information. Information may change and should be independently verified as appropriate.';
export interface PresentationDisclaimer { defaultText:string; brandSpecificText:string|null; mode:'supplement'|'replace' }
export function disclaimerText(copy:PresentationDisclaimer) {return copy.brandSpecificText?(copy.mode==='replace'?copy.brandSpecificText:`${copy.defaultText} ${copy.brandSpecificText}`):copy.defaultText;}
export interface Presentation { brandId:string; brandName:string; version:string; label:string; options:PresentationOptions; slides:PresentationSlide[]; disclaimer:PresentationDisclaimer }
export type Element =
 | {kind:'shape';x:number;y:number;w:number;h:number;color:string}
 | {kind:'text';x:number;y:number;w:number;h:number;text:string;size:number;color:string;bold?:boolean}
 | {kind:'image';x:number;y:number;w:number;h:number;assetId:string;fit:'cover'|'contain'};
export interface Scene {background:string;elements:Element[];notes:string}
export const fonts:Record<PresentationOptions['branding']['font'],string>={arial:'Arial',verdana:'Verdana',tahoma:'Tahoma',trebuchet:'Trebuchet MS',georgia:'Georgia',times:'Times New Roman'};
export function selectedAssetIds(options:PresentationOptions) {return [...new Set(Object.values(options.assets).filter((id):id is string=>Boolean(id)))];}
export class PresentationError extends Error { constructor(message:string,public status=400){super(message);} }

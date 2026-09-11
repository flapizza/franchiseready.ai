import { z } from 'zod';
import { colors, fontIds, httpsUrl, type EmailDocument } from '../studio/document.ts';
export const assetIdSchema = z.string().regex(/^asset_[a-f0-9]{32}$/);
const optionalUrl=z.union([z.literal(''),httpsUrl.max(500)]);
export const brandingSchema = z.object({ version:z.literal(1), company:z.string().max(200), website:optionalUrl, postalAddress:z.string().max(500), primaryColor:z.enum(colors), accentColor:z.enum(colors), font:z.enum(fontIds), logo:assetIdSchema.nullable(), headshot:assetIdSchema.nullable(), name:z.string().max(120), title:z.string().max(160), email:z.string().max(254), phone:z.string().max(40), linkedIn:optionalUrl, scheduling:optionalUrl }).strict();
export type BrandingSnapshot = z.infer<typeof brandingSchema>;
export type MediaAsset = { public_id:string; version:number; default_alt:string; width:number; height:number; deliveryUrl:string; thumbnailUrl:string; status:string };
export function imageReferences(document:EmailDocument, branding?:BrandingSnapshot|null) {
  const ids = new Set<string>();
  for (const block of document.document.content) {
    const image = block.type === 'emailImage' ? block : block.type === 'imageText' ? block.content[0] : undefined;
    if (image?.attrs.assetId) ids.add(assetIdSchema.parse(image.attrs.assetId));
  }
  for(const id of [branding?.logo,branding?.headshot]) if(id) ids.add(assetIdSchema.parse(id));
  return [...ids];
}
export function brandingDeliveryErrors(value:BrandingSnapshot) {
  return [!value.name.trim() && 'Sender name', !z.email().safeParse(value.email).success && 'Professional email', !value.company.trim() && 'Company name', value.postalAddress.trim().length < 10 && 'Sender postal address'].filter(Boolean) as string[];
}

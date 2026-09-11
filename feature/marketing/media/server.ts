import 'server-only';
import { resolveProductionWorkspaceSession } from '@/feature/platform/composition/ProductionWorkspaceSessionResolver';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getPublicEnvironment } from '@/lib/env';
import { brandingSchema, imageReferences, type BrandingSnapshot, type MediaAsset } from './model';
import type { EmailDocument } from '../studio/document';

export async function mediaWorkspace() {
  const resolution=await resolveProductionWorkspaceSession();
  if(resolution.status!=='resolved'||resolution.session.kind!=='production')throw Error('An active workspace is required.');
  return { session:resolution.session, db:await createServerSupabaseClient() };
}
export function publicMediaUrl(path:string) {
  if(!/^[a-f0-9-]{36}\/asset_[a-f0-9]{32}\/1\/(email|thumb)\.png$/.test(path))throw Error('Invalid media path.');
  return `${getPublicEnvironment().NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/studio-delivery/${path}`;
}
export async function resolveBranding():Promise<BrandingSnapshot> {
  const {session,db}=await mediaWorkspace();
  const [org,profile,brand,portrait]=await Promise.all([
    db.from('organization_settings').select('*').eq('organization_id',session.organization.id).maybeSingle(),
    db.from('consultant_profiles').select('*').eq('membership_id',session.membership.id).maybeSingle(),
    db.from('studio_organization_branding').select('*').eq('organization_id',session.organization.id).maybeSingle(),
    db.from('studio_consultant_branding').select('*').eq('membership_id',session.membership.id).maybeSingle(),
  ]);
  for(const result of [org,profile,brand,portrait])if(result.error)throw Error('Branding is unavailable.');
  const p=profile.data,b=brand.data;
  return brandingSchema.parse({version:1,company:org.data?.display_name??session.organization.name,website:org.data?.website_url??'',postalAddress:b?.postal_address??'',primaryColor:b?.primary_color??'#172033',accentColor:b?.accent_color??'#2563EB',font:b?.default_font??'arial',logo:b?.logo_asset_id??null,headshot:portrait.data?.headshot_asset_id??null,name:p?.display_name??'',title:p?.professional_title??'',email:p?.professional_email??'',phone:p?.professional_phone??'',linkedIn:p?.linkedin_url??'',scheduling:p?.scheduling_url??''});
}
export async function resolveMedia(document:EmailDocument,branding?:BrandingSnapshot|null):Promise<Record<string,MediaAsset>> {
  const ids=imageReferences(document,branding);if(!ids.length)return {};
  const {session,db}=await mediaWorkspace();
  const {data,error}=await db.from('studio_media_assets').select('*').eq('organization_id',session.organization.id).in('public_id',ids).in('status',['ready','archived']);
  if(error||data?.length!==ids.length)throw Error('An image is unavailable or belongs to another workspace.');
  return Object.fromEntries(data.map(row=>[row.public_id,{...row,deliveryUrl:publicMediaUrl(row.delivery_path),thumbnailUrl:publicMediaUrl(row.thumbnail_path)}]));
}

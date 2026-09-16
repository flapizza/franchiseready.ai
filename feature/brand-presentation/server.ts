import 'server-only';
import { resolveWorkspaceComposition } from '../platform/composition/resolveWorkspaceComposition';
import { resolveBranding, resolveMediaAssets } from '../marketing/media/server';
import type { BrandingSnapshot } from '../marketing/media/model';
import { demoConsultant } from '../demo/data/demoConsultant';
import { defaultOptions, prepareExport } from './buildPresentation';
import { selectedAssetIds, PresentationError } from './model';
import { demoPresentationMedia } from './demoMedia';

export async function loadPresentationWorkspace(brandId:string) {
  const r=await resolveWorkspaceComposition();
  if(r.status!=='resolved')throw new PresentationError('An active workspace is required.',401);
  const demo='runtimes' in r.composition;
  const runtime='runtimes' in r.composition?r.composition.runtimes.createBrandIntelligence():r.composition.dependencies.brandIntelligence;
  const profile=await runtime.getById(brandId);
  if(!profile)throw new PresentationError('Brand profile unavailable.',404);
  const branding:BrandingSnapshot=demo?{version:1,company:demoConsultant.companyName??'',name:demoConsultant.displayName,title:demoConsultant.title,email:demoConsultant.email??'',phone:'',website:'',postalAddress:'',linkedIn:'',scheduling:'',primaryColor:'#172033',accentColor:'#2563EB',font:'arial',logo:null,headshot:null}:await resolveBranding();
  const options=defaultOptions(profile,branding);
  const assets=demo?{}:await resolveMediaAssets(selectedAssetIds(options));
  return {profile,options,assets,mediaAvailable:true,...(demo?{demoAssets:await demoPresentationMedia()}:{})};
}
// Injection seam permits focused authorization/version/media tests without a database.
export async function preparePresentationExport(brandId:string,input:unknown) {
  return prepareExport(brandId,input,{load:loadPresentationWorkspace,media:resolveMediaAssets});
}

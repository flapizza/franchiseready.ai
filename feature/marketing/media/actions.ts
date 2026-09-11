'use server';
import { brandingSchema } from './model';
import { mediaWorkspace, resolveBranding } from './server';
export async function getStudioBranding(){try{const {session}=await mediaWorkspace();return{ok:true as const,branding:await resolveBranding(),canManage:['owner','admin'].includes(session.membership.role)};}catch{return{ok:false as const,error:'Branding requires an active hosted workspace.'};}}
export async function saveStudioBranding(value:unknown,organizationChanges:boolean){
  try{const input=brandingSchema.parse(value),{session,db}=await mediaWorkspace();
    if(organizationChanges&&!['owner','admin'].includes(session.membership.role))throw Error('Organization branding requires an owner or admin.');
    const {error}=await db.rpc('save_studio_branding',{target_organization_id:session.organization.id,proposed:input,organization_changes:organizationChanges});if(error)throw error;
    return{ok:true as const,branding:await resolveBranding()};
  }catch{return{ok:false as const,error:'Branding could not be saved. Check your role and image ownership.'};}
}

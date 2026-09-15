import 'server-only';
import {createHash,randomUUID} from 'node:crypto';
import type {SupabaseClient} from '@supabase/supabase-js';
import type {Database} from '@/types/database.generated';
import type {AuthenticatedWorkspaceContext} from '@/feature/identity/models/WorkspaceIdentity';
import {createAdminSupabaseClient} from '@/lib/supabase/admin';
import {getPublicEnvironment} from '@/lib/env';
import type {MarketingRepository} from '../repositories/MarketingRepository';
import type {FinalAudienceReview,MarketingDeliveryProvider,ProviderSubmission} from './MarketingDelivery';
import {deliveryAddress,renderStudioDelivery,validateStudioSend,type StudioSendSource} from './studio-snapshot';
import {z} from 'zod';
import {marketingPublicOrigin} from './public-origin';

// The privileged client is used only for private, audited artifact operations,
// after the ordinary repository has authorized the campaign in the workspace.
export class StudioDeliveryService {
  constructor(private db:SupabaseClient<Database>,private ctx:AuthenticatedWorkspaceContext,private marketing:MarketingRepository){}
  async stage(id:string,revision:string,fingerprint:string) {
    const campaign=await this.marketing.getCampaign(id);
    if(!campaign||campaign.content.version!==2)throw Error('A V2 campaign in this workspace is required.');
    if(campaign.updatedAt!==revision)throw Error('Campaign changed. Reload and review again.');
    const environment=getPublicEnvironment(),admin=createAdminSupabaseClient();
    const data=await studioRpc(admin,'stage_studio_campaign',{target_campaign:id,actor_membership:this.ctx.membership.id,expected_revision:revision,audience_fingerprint:fingerprint,public_origin:marketingPublicOrigin(new URL(environment.APP_URL).origin),media_origin:new URL(environment.NEXT_PUBLIC_SUPABASE_URL).origin});
    const staged=data as {stageId:string;source:StudioSendSource};
    validateStudioSend(staged.source);
    // Rendering is itself a prerequisite: oversized output and unresolved images fail before confirmation.
    renderStudioDelivery(staged.source,{firstName:'Jordan',preferredName:'Jordan'},'preview-validation-token-0000000000000000');
    return {campaign,...staged};
  }
  async review(id:string):Promise<FinalAudienceReview> {
    const counts=await studioRpc(this.db,'review_studio_campaign',{target_campaign:id}) as Record<string,number|string>;
    const {campaign,stageId}=await this.stage(id,String(counts.revision),String(counts.fingerprint));
    return {campaignId:id,campaignName:campaign.name,subject:campaign.subject,senderName:campaign.senderName,audienceLabel:`${campaign.audienceType}: ${campaign.audienceId}`,matching:Number(counts.matching),eligible:Number(counts.eligible),unknown:Number(counts.unknown),optedOut:Number(counts.optedOut),suppressed:Number(counts.suppressed),missingEmail:Number(counts.missingEmail),duplicates:Number(counts.duplicates),reviewToken:stageId,complianceReady:true};
  }
  async test(id:string,revision:string,recipient:string,key:string,provider:MarketingDeliveryProvider) {
    if(provider.mode==='unavailable')throw Error('The email provider is unavailable. No test was sent.');
    const to=deliveryAddress.parse(recipient.trim().toLowerCase());z.string().min(16).max(255).parse(key);
    const {stageId,source}=await this.stage(id,revision,'0'.repeat(64));
    const raw=randomUUID()+randomUUID(),admin=createAdminSupabaseClient();
    const rendered=renderStudioDelivery(source,{firstName:'Jordan',preferredName:'Jordan'},raw,true);
    const payload={senderName:source.sender_name,to,replyTo:source.reply_to,...rendered,metadata:{campaignId:id,kind:'studio-test'}};
    const audit=await studioRpc(admin,'prepare_studio_test',{stage_id:stageId,actor_membership:this.ctx.membership.id,request_key:key,payload,token_digest:createHash('sha256').update(raw).digest('hex')}) as {id:string;status:string;providerMessageId?:string};
    if(audit.status!=='prepared')return audit;
    const frozen=await studioRpc(admin,'claim_studio_test',{target_test:audit.id}) as ProviderSubmission|null;
    if(!frozen)return {id:audit.id,status:'processing'};
    const result=await provider.submit(frozen);
    await studioRpc(admin,'complete_studio_test',{target_test:audit.id,message_id:result.kind==='accepted'?result.providerMessageId:null,failure_code:result.kind==='accepted'?null:result.code});
    return {id:audit.id,status:result.kind==='accepted'?'accepted':'failed',...(result.kind==='accepted'?{providerMessageId:result.providerMessageId}:{})};
  }
}

export async function studioRpc(db:SupabaseClient<Database>,name:string,args:Record<string,unknown>):Promise<unknown> {
  // Additive RPCs are isolated here until generated database types are refreshed.
  const result=await (db.rpc as unknown as (name:string,args:Record<string,unknown>)=>Promise<{data:unknown;error:{code?:string;message?:string}|null}>)(name,args);
  if(result.error)throw Error(result.error.code==='40001'?'Campaign or audience changed. Reload and review again.':result.error.code==='42501'?'This operation is unavailable in the active workspace.':result.error.message??'Delivery operation failed.');
  return result.data;
}

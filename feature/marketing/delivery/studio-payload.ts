import 'server-only';
import {createHash,randomUUID} from 'node:crypto';
import type {SupabaseClient} from '@supabase/supabase-js';
import type {Database} from '@/types/database.generated';
import type {ProviderSubmission} from './MarketingDelivery';
import {studioRpc} from './StudioDeliveryService';
import {renderStudioDelivery,type StudioSendSource} from './studio-snapshot';

export async function frozenStudioPayload(db:SupabaseClient<Database>,source:StudioSendSource,recipient:{public_id:string;normalized_email:string;personalization:Record<string,unknown>},claim:string,runId:string):Promise<ProviderSubmission> {
  const args={target_recipient:recipient.public_id,target_claim:claim};
  const existing=await studioRpc(db,'studio_recipient_payload',args);
  if(existing)return existing as ProviderSubmission;
  const raw=randomUUID()+randomUUID();
  const rendered=renderStudioDelivery(source,recipient.personalization,raw);
  const payload:ProviderSubmission={deliveryKey:recipient.public_id,senderName:source.sender_name,to:recipient.normalized_email,replyTo:source.reply_to,...rendered,metadata:{sendRunId:runId,recipientId:recipient.public_id}};
  return await studioRpc(db,'studio_recipient_payload',{...args,new_payload:payload,token_digest:createHash('sha256').update(raw).digest('hex')}) as ProviderSubmission;
}

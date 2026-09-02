import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.generated";
import type { ProviderDeliveryEvent, ProviderDeliveryEventRepository } from "../MarketingDelivery";

export class ResendProviderEventRepository implements ProviderDeliveryEventRepository {
  constructor(private readonly db:SupabaseClient<Database>){}
  async record(event:ProviderDeliveryEvent):Promise<'recorded'|'duplicate-or-unknown'>{
    const {data,error}=await this.db.rpc('record_marketing_provider_event',{message_id:event.providerMessageId,event_provider:event.provider,event_id:event.providerEventId,target_type:event.type,event_time:event.occurredAt,event_metadata:event.metadata});
    if(error)throw new Error('Provider delivery event could not be recorded.');
    return data?'recorded':'duplicate-or-unknown';
  }
}

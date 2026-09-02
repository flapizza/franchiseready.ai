export type RecipientDeliveryStatus='pending'|'processing'|'accepted'|'delivered'|'bounced'|'failed'|'suppressed';
export type CampaignSendStatus='queued'|'sending'|'completed'|'partially-failed'|'failed';
export interface FinalAudienceReview{campaignId:string;campaignName:string;subject:string;senderName:string;audienceLabel:string;matching:number;eligible:number;unknown:number;optedOut:number;suppressed:number;missingEmail:number;duplicates:number;}
export interface SendRecipient{id:string;displayName:string;email:string;status:RecipientDeliveryStatus;reason:string;providerMessageId?:string;unsubscribeUrl?:string;}
export interface CampaignSendRun{id:string;campaignId:string;status:CampaignSendStatus;simulated:boolean;createdAt:string;startedAt?:string;completedAt?:string;counts:{intended:number;queued:number;accepted:number;delivered:number;bounced:number;failed:number;suppressed:number;unsubscribed:number};recipients:SendRecipient[];}
export type ProviderSubmission={deliveryKey:string;senderName:string;to:string;replyTo:string;subject:string;html:string;text:string;metadata:Record<string,string>};
export type ProviderResult={kind:'accepted';providerMessageId:string}|{kind:'transient-failure'|'permanent-failure';code:string};
export interface MarketingDeliveryProvider{readonly mode:'simulated-local'|'external'|'unavailable';readonly name:string;submit(input:ProviderSubmission):Promise<ProviderResult>;}
export type ProviderDeliveryEventType='accepted'|'delivered'|'soft-bounce'|'hard-bounce'|'rejected'|'complaint'|'provider-failure';
export interface ProviderDeliveryEvent{provider:'resend';providerEventId:string;providerMessageId:string;type:ProviderDeliveryEventType;occurredAt:string;metadata:Record<string,string>;}
export interface ProviderDeliveryEventRepository{record(event:ProviderDeliveryEvent):Promise<'recorded'|'duplicate-or-unknown'>;}
export interface MarketingDeliveryRepository{review(campaignId:string):Promise<FinalAudienceReview>;confirm(campaignId:string,idempotencyKey:string,simulated:boolean):Promise<CampaignSendRun>;process(sendId:string,provider:MarketingDeliveryProvider,appUrl:string):Promise<CampaignSendRun>;getLatest(campaignId:string):Promise<CampaignSendRun|undefined>;unsubscribe(rawToken:string):Promise<boolean>;history(contactId:string):Promise<CampaignSendRun[]>;}

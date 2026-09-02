/* eslint-disable @typescript-eslint/no-unused-vars */
import type{MarketingDeliveryProvider,ProviderSubmission}from'./MarketingDelivery';
export class LocalMarketingDeliveryProvider implements MarketingDeliveryProvider{readonly mode='simulated-local' as const;readonly name='FranGroove local simulator';async submit(input:ProviderSubmission){return{kind:'accepted' as const,providerMessageId:`local_${input.deliveryKey}`}}}
export class UnavailableMarketingDeliveryProvider implements MarketingDeliveryProvider{readonly mode='unavailable' as const;readonly name='External provider not configured';async submit(_input:ProviderSubmission){return{kind:'permanent-failure' as const,code:'provider-unavailable'}}}

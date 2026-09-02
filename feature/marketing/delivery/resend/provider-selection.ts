import type { ResendEnvironment } from "@/lib/env";
import type { MarketingDeliveryProvider } from "../MarketingDelivery";
import { UnavailableMarketingDeliveryProvider } from "../providers";
import { ResendMarketingDeliveryProvider } from "./ResendMarketingDeliveryProvider";

export function selectProductionMarketingDeliveryProvider(configuration:ResendEnvironment|null):MarketingDeliveryProvider {
  return configuration ? new ResendMarketingDeliveryProvider({apiKey:configuration.RESEND_API_KEY,fromEmail:configuration.RESEND_FROM_EMAIL}) : new UnavailableMarketingDeliveryProvider();
}

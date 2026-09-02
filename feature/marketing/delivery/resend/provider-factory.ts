import "server-only";
import { getResendEnvironment } from "@/lib/env";
import type { MarketingDeliveryProvider } from "../MarketingDelivery";
import { selectProductionMarketingDeliveryProvider } from "./provider-selection";

export function createProductionMarketingDeliveryProvider(): MarketingDeliveryProvider {
  return selectProductionMarketingDeliveryProvider(getResendEnvironment());
}

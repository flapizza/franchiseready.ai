import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import type { ReferralDeliveryResult, ReferralDeliveryService } from "./ReferralDeliveryService";
import type { CandidateReferralPackage } from "../models/CandidateReferralPackage";

export class DemoReferralDeliveryService implements ReferralDeliveryService {
  async deliver(referralPackage: CandidateReferralPackage): Promise<ReferralDeliveryResult> {
    const recordedAt = new Date().toISOString();
    if (demoCandidateOverlayStore.consumeReferralDeliveryFailure(referralPackage.referralId)) {
      return { status: "failed", attemptedAt: recordedAt, failedAt: recordedAt, reason: "Demo delivery provider simulated a transport failure.", externallyDelivered: false, provider: "demo" };
    }
    return { status: "sent", attemptedAt: recordedAt, sentAt: recordedAt, externallyDelivered: false, provider: "demo" };
  }
}

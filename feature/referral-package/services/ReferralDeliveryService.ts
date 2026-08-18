import type { CandidateReferralPackage } from "../models/CandidateReferralPackage";

export type ReferralDeliveryResult =
  | { status: "sent"; attemptedAt: string; sentAt: string; externallyDelivered: false; provider: "demo" }
  | { status: "failed"; attemptedAt: string; failedAt: string; reason: string; externallyDelivered: false; provider: "demo" };

export interface ReferralDeliveryService {
  deliver(referralPackage: CandidateReferralPackage): Promise<ReferralDeliveryResult>;
}

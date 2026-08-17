import type { CandidateReferralPackage } from "../models/CandidateReferralPackage";

export interface ReferralDeliveryResult { recordedAt: string; externallyDelivered: false }

export interface ReferralDeliveryService {
  recordIntroduction(referralPackage: CandidateReferralPackage): Promise<ReferralDeliveryResult>;
}

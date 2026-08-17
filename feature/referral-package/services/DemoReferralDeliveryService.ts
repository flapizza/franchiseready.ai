import type { CandidateActivityRepository } from "@/feature/crm/repositories/CandidateActivityRepository";
import { DemoCandidateActivityRepository } from "@/feature/crm/repositories/DemoCandidateActivityRepository";
import type { ReferralDeliveryResult, ReferralDeliveryService } from "./ReferralDeliveryService";
import type { CandidateReferralPackage } from "../models/CandidateReferralPackage";

export class DemoReferralDeliveryService implements ReferralDeliveryService {
  constructor(private readonly activities: CandidateActivityRepository = new DemoCandidateActivityRepository()) {}

  async recordIntroduction(referralPackage: CandidateReferralPackage): Promise<ReferralDeliveryResult> {
    const recordedAt = new Date().toISOString();
    await this.activities.add({ id: crypto.randomUUID(), candidateId: referralPackage.candidateId,
      consultantId: referralPackage.consultant.id, type: "candidate-introduced", title: `Candidate Introduced — ${referralPackage.brand.name}`,
      description: `Consultant recorded the introduction to ${referralPackage.brand.name}.`, createdAt: recordedAt,
      metadata: { referralPackageId: referralPackage.id, brandId: referralPackage.brand.id, externallyDelivered: false } });
    return { recordedAt, externallyDelivered: false };
  }
}

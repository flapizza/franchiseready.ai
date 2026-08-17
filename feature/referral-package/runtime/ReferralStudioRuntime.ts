import type { ReferralStudioState } from "../models/ReferralStudioState";
import { CandidateReferralService } from "../services/CandidateReferralService";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { CandidateBrandStrategyRuntime } from "@/feature/brand-strategy/runtime/CandidateBrandStrategyRuntime";

export class ReferralStudioRuntime {
  constructor(private readonly service = new CandidateReferralService(), private readonly candidates = new SeedCandidateRepository(), private readonly strategy = new CandidateBrandStrategyRuntime()) {}

  async load(candidateId: string): Promise<ReferralStudioState> {
    const candidate = await this.candidates.getById(candidateId);
    const strategy = await this.strategy.load(candidateId);
    if (!candidate || !strategy) return { available: false, candidateId, candidateName: null, reason: "Candidate not found." };
    if (!strategy.referralStrategyHandoff?.referralGatePassed || !["brand-matching", "referral"].includes(candidate.pipelineStage)) return { available: false, candidateId, candidateName: `${candidate.firstName} ${candidate.lastName}`, reason: strategy.unavailableReason ?? "The canonical referral gate has not passed." };
    const referrals = this.service.getByCandidate(candidateId);
    const byBrand = new Map(referrals.filter((item) => item.brandId).map((item) => [item.brandId, item]));
    const opportunities = strategy.referralStrategyHandoff.recommendedBrands.map((item) => ({ ...item, selectable: item.financialCompatibility.compatible, referral: byBrand.get(item.brandId) ?? null }));
    return { available: true, candidate: { id: candidateId, name: strategy.referralStrategyHandoff.candidateName, readiness: strategy.referralStrategyHandoff.candidateReadiness, context: strategy.referralStrategyHandoff.strategyContext },
      opportunities, referrals, summary: { recommended: opportunities.length, prepared: referrals.length, approved: referrals.filter((item) => item.status === "approved").length, introduced: referrals.filter((item) => item.status === "introduced").length } };
  }
}

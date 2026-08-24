import type { ReferralStudioState } from "../models/ReferralStudioState";
import { CandidateReferralService } from "../services/CandidateReferralService";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { CandidateBrandStrategyRuntime } from "@/feature/brand-strategy/runtime/CandidateBrandStrategyRuntime";
import { handoffEvidenceFingerprint } from "../services/CandidateHandoffPackageService";

export class ReferralStudioRuntime {
  constructor(private readonly service = new CandidateReferralService(), private readonly candidates = new SeedCandidateRepository(), private readonly strategy = new CandidateBrandStrategyRuntime()) {}

  async load(candidateId: string, requestedReferralId?: string): Promise<ReferralStudioState> {
    const candidate = await this.candidates.getById(candidateId);
    const strategy = await this.strategy.load(candidateId);
    if (!candidate || !strategy) return { available: false, candidateId, candidateName: null, kind: "candidate-not-found", reason: "Candidate not found." };
    const requested = requestedReferralId ? this.service.getOwned(candidateId, requestedReferralId) : null;
    if (requestedReferralId && !requested) return { available: false, candidateId, candidateName: `${candidate.firstName} ${candidate.lastName}`, kind: "package-not-found", reason: "This referral package does not exist or does not belong to this candidate." };
    const referrals = this.service.getByCandidate(candidateId).map((referral) => {
      const brandHandoff = strategy.referralStrategyHandoff?.recommendedBrands.find((item) => item.brandId === referral.brandId) ?? null;
      const fingerprint = candidate.intelligence ? handoffEvidenceFingerprint(candidate, brandHandoff) : undefined;
      return { ...referral, referralPackage: { ...referral.referralPackage,
        evidenceStale: Boolean(referral.referralPackage.evidenceFingerprint && fingerprint !== referral.referralPackage.evidenceFingerprint) } };
    });
    const historical = candidate.pipelineStage === "awarded" && referrals.length > 0;
    const handoff = strategy.referralStrategyHandoff;
    const canMutate = Boolean(handoff && !historical);
    if (!handoff && !requested) return { available: false, candidateId, candidateName: `${candidate.firstName} ${candidate.lastName}`, kind: "package-not-found", reason: "Referral context is unavailable." };
    const byBrand = new Map(referrals.filter((item) => item.brandId).map((item) => [item.brandId, item]));
    const opportunities = (handoff?.recommendedBrands ?? []).map((item) => ({ ...item, selectable: canMutate, referral: byBrand.get(item.brandId) ?? null }));
    const packageCandidate = requested?.referralPackage.candidate;
    return { available: true, candidate: { id: candidateId, name: handoff?.candidateName ?? packageCandidate!.name, readiness: handoff?.candidateReadiness ?? packageCandidate!.readiness, context: handoff?.strategyContext ?? "Historical referral package review." },
      opportunities, referrals, historical, reviewOnly: historical || !canMutate, activeReferralId: requestedReferralId ?? null,
      readinessAdvisory: { recommended: handoff?.referralGatePassed ?? false, label: handoff?.referralGatePassed ? "Recommended" : "Needs Attention",
        explanation: handoff?.referralGatePassed ? "FranGroove recommends proceeding based on the current evidence." : "FranGroove recommends completing the remaining discovery items before introduction. The consultant may proceed using professional judgment.",
        considerations: handoff?.unresolvedReadinessConsiderations ?? [] },
      summary: { recommended: opportunities.length, prepared: referrals.length, approved: referrals.filter((item) => item.status === "approved").length, introduced: referrals.filter((item) => item.status === "sent" || item.status === "introduced").length } };
  }
}

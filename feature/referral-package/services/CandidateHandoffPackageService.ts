import type { CandidateRecord } from "@/feature/crm/models/CandidateRecord";
import type { ReferralBrandHandoffState } from "@/feature/brand-strategy/models/CandidateBrandStrategyState";

export function handoffEvidenceFingerprint(candidate: CandidateRecord, handoff: ReferralBrandHandoffState | null): string {
  const source = JSON.stringify({ updatedAt: candidate.updatedAt, intelligence: candidate.intelligence,
    brandId: handoff?.brandId, rationale: handoff?.candidateBrandRationale, concerns: handoff?.knownConcerns,
    presentation: handoff?.presentationContext });
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) hash = Math.imul(hash ^ source.charCodeAt(index), 16777619);
  return `handoff-${(hash >>> 0).toString(16)}`;
}

export class CandidateHandoffPackageService {
  compose(candidate: CandidateRecord & { intelligence: NonNullable<CandidateRecord["intelligence"]> }, handoff: ReferralBrandHandoffState | null) {
    const intelligence = candidate.intelligence;
    const objectives = [...new Set([...intelligence.preferredBusinessModels, ...intelligence.recommendedCategories])];
    const questions = [...new Set(handoff?.presentationContext.address ?? handoff?.knownConcerns ?? intelligence.discoveryPriorities)];
    const focus = handoff ? [...handoff.presentationContext.emphasize, handoff.presentationContext.suggestedTransition] : intelligence.discoveryPriorities;
    return {
      candidateObjectives: objectives,
      candidateQuestions: questions,
      recommendedFranchisorFocus: focus,
      evidenceUpdatedAt: candidate.updatedAt,
      evidenceFingerprint: handoffEvidenceFingerprint(candidate, handoff),
      provenance: [
        { label: "Candidate readiness and objectives", source: "Candidate Intelligence" as const },
        { label: "Candidate-reported financial profile", source: "Financial Profile" as const },
        { label: "Motivations, buying signals, and open questions", source: "Discovery" as const },
        ...(handoff ? [{ label: `${handoff.brandName} fit rationale and validation areas`, source: "Brand Strategy" as const }] : []),
      ],
    };
  }
}

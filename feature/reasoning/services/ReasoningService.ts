import type { CandidateIntelligence } from
  "@/feature/candidate-intelligence/models/CandidateIntelligence";

import type { EvidenceGraph } from
  "@/feature/evidence/models/EvidenceGraph";

import type { Reasoning } from
  "../models/Reasoning";

export class ReasoningService {
  public evaluate(
    intelligence: CandidateIntelligence,
    evidence: EvidenceGraph,
  ): Reasoning {
    return {
      recommendation:
        "Continue Discovery",

      explanation:
        "Candidate demonstrates strong executive capability but family alignment requires additional validation before referral.",

      confidence:
        Math.round(
          (
            intelligence.confidence +
            evidence.confidence
          ) / 2,
        ),

      supportingEvidence: [
        "Leadership validated",

        "Ownership motivation validated",
      ],

      opposingEvidence: [
        "Family alignment incomplete",
      ],

      nextAction:
        "Schedule a Discovery follow-up focused on family alignment.",
    };
  }
}
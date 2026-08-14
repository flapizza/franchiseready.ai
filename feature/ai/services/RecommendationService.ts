import type { CandidateIntelligence } from
  "@/feature/candidate-intelligence/models/CandidateIntelligence";

import type { EvidenceGraph } from
  "@/feature/evidence/models/EvidenceGraph";

import type { AIRecommendation } from
  "../models/AIRecommendation";

import { ReasoningRuntime } from
  "@/feature/reasoning/runtime/ReasoningRuntime";

export class RecommendationService {
  private readonly reasoning =
    new ReasoningRuntime();

  public recommend(
    intelligence: CandidateIntelligence,
    evidence: EvidenceGraph,
  ): AIRecommendation {
    const reasoning =
      this.reasoning.evaluate(
        intelligence,
        evidence,
      );

    return {
      summary:
        reasoning.recommendation,

      confidence:
        reasoning.confidence,

      explanation:
        reasoning.explanation,

      nextAction:
        reasoning.nextAction,
    };
  }
}
import type { CandidateIntelligence } from
  "@/feature/candidate-intelligence/models/CandidateIntelligence";

import type { EvidenceGraph } from
  "@/feature/evidence/models/EvidenceGraph";

import type { AIRecommendation } from
  "../models/AIRecommendation";

import { RecommendationService } from
  "../services/RecommendationService";

export class AIRuntime {
  private readonly recommendations =
    new RecommendationService();

  public recommend(
    intelligence: CandidateIntelligence,
    evidence: EvidenceGraph,
  ): AIRecommendation {
    return this.recommendations.recommend(
      intelligence,
      evidence,
    );
  }
}
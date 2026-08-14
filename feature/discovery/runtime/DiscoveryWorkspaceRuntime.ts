import type { CandidateRecord } from "@/feature/crm/models/CandidateRecord";

import { CandidateIntelligenceEngine } from "@/feature/intelligence/runtime/CandidateIntelligenceEngine";
import { BrandRecommendationEngine } from "@/feature/brand-strategy/runtime/BrandRecommendationEngine";
import { ConsultantCoachingEngine } from "@/feature/consultant-portal/runtime/ConsultantCoachingEngine";
import { CandidateMemoryEngine } from "@/feature/intelligence/runtime/CandidateMemoryEngine";

import type { BrandRecommendation } from "@/feature/brand-strategy/models/BrandRecommendation";
import type { ConsultantCoaching } from "@/feature/consultant-portal/models/ConsultantCoaching";
import type { CandidateMemory } from "@/feature/intelligence/models/CandidateMemory";
import type { CandidateIntelligenceState } from "@/feature/intelligence/models/CandidateIntelligenceState";

export interface DiscoveryWorkspaceState {
  intelligence: CandidateIntelligenceState;

  memory: CandidateMemory;

  coaching: ConsultantCoaching;

  recommendations: BrandRecommendation[];
}

export class DiscoveryWorkspaceRuntime {
  private readonly intelligenceEngine =
    new CandidateIntelligenceEngine();

  private readonly memoryEngine =
    new CandidateMemoryEngine();

  private readonly coachingEngine =
    new ConsultantCoachingEngine();

  private readonly recommendationEngine =
    new BrandRecommendationEngine();

  public build(
    candidate: CandidateRecord,
  ): DiscoveryWorkspaceState {

    const memory =
      this.memoryEngine.create();

    const intelligence: CandidateIntelligenceState = {
  readiness:
    candidate.intelligence.overallReadiness,

  confidence:
    candidate.intelligence.financial
      .financingLikelihood,

  executiveSummary:
    candidate.intelligence.executiveSummary,

  buyingSignals: [],

  risks: [],
};

    const coaching =
      this.coachingEngine.evaluate({
        detectedRisks: [],
      } as any);

    const recommendations =
  this.recommendationEngine.generate({
    readiness: intelligence.readiness,
    confidence: intelligence.confidence,
    executiveSummary:
      intelligence.executiveSummary,
  } as CandidateIntelligenceState);

    return {
      intelligence,
      memory,
      coaching,
      recommendations,
    };
  }
}
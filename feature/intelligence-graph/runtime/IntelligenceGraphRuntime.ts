import type { CandidateRecord } from "@/feature/crm/models/CandidateRecord";

import type { IntelligenceGraph } from "../models/IntelligenceGraph";

import { AIConfidenceEngine } from "@/feature/intelligence/runtime/AIConfidenceEngine";
import { AIReasoningEngine } from "@/feature/intelligence/runtime/AIReasoningEngine";
import { CandidateMemoryEngine } from "@/feature/intelligence/runtime/CandidateMemoryEngine";
import { BrandRecommendationEngine } from "@/feature/brand-strategy/runtime/BrandRecommendationEngine";
import { ConsultantCoachingEngine } from "@/feature/consultant-portal/runtime/ConsultantCoachingEngine";

export class IntelligenceGraphRuntime {
  private readonly confidence =
    new AIConfidenceEngine();

  private readonly reasoning =
    new AIReasoningEngine();

  private readonly memory =
    new CandidateMemoryEngine();

  private readonly brands =
    new BrandRecommendationEngine();

  private readonly coaching =
    new ConsultantCoachingEngine();

  public build(
    candidate: CandidateRecord,
  ): IntelligenceGraph {

    const memory =
      this.memory.create();

    const confidence =
      this.confidence.evaluate();

    const reasoning =
      this.reasoning.evaluate();

    const recommendations =
      this.brands.generate({
        readiness:
          candidate.intelligence.overallReadiness,

        confidence:
          candidate.intelligence.financial
            .financingLikelihood,

        executiveSummary:
          candidate.intelligence.executiveSummary,

        buyingSignals: [],

        risks: [],
      });

    const coaching =
      this.coaching.evaluate({
        detectedRisks: [],
      } as any);

    return {
      readiness:
        candidate.intelligence.overallReadiness,

      confidence,

      reasoning,

      memory,

      recommendations,

      coaching,
    };
  }
}
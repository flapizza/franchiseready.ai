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

    const profile = candidate.intelligence;
    if (!profile) throw new Error("Intelligence Graph requires completed Candidate Intelligence.");

    const memory =
      this.memory.create();

    const confidence =
      this.confidence.evaluate();

    const reasoning =
      this.reasoning.evaluate();

    const recommendations =
      this.brands.generate({
        readiness:
          profile.overallReadiness,

        confidence:
          profile.financial
            .financingLikelihood,

        executiveSummary:
          profile.executiveSummary,

        buyingSignals: [],

        risks: [],
      });

    const coaching =
      this.coaching.evaluate({
        detectedRisks: [],
      });

    return {
      readiness:
        profile.overallReadiness,

      confidence,

      reasoning,

      memory,

      recommendations,

      coaching,
    };
  }
}

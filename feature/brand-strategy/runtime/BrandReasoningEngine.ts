import type {
  BrandReasoning,
} from "../models/BrandReasoning";

import type {
  BrandRecommendation,
} from "../models/BrandRecommendation";

export class BrandReasoningEngine {
  public explain(
    recommendation: BrandRecommendation,
  ): BrandReasoning {
    return {
      recommendationId: recommendation.id,

      totalScore: recommendation.score,

      confidence: recommendation.confidence,

      summary:
        recommendation.explanation,

      factors: [
        {
          id: "leadership",

          title:
            "Executive Leadership",

          category:
            "leadership",

          impact: 8,

          confidence: 98,

          explanation:
            "Candidate demonstrated extensive executive leadership experience.",
        },

        {
          id: "financial",

          title:
            "Financial Qualification",

          category:
            "financial",

          impact: 7,

          confidence: 96,

          explanation:
            "Financial readiness exceeds the minimum investment requirements.",
        },

        {
          id: "behavior",

          title:
            "Ownership Motivation",

          category:
            "behavioral",

          impact: 6,

          confidence: 94,

          explanation:
            "Candidate expressed a strong desire to build long-term business ownership.",
        },

        {
          id: "discovery",

          title:
            "Discovery Validation",

          category:
            "discovery",

          impact: -2,

          confidence: 82,

          explanation:
            "Family alignment should be confirmed before proceeding.",
        },
      ],
    };
  }
}
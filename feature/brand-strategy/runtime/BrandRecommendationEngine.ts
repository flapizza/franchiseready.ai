import type { CandidateIntelligenceState } from "@/feature/intelligence/runtime/CandidateIntelligenceEngine";
import type { BrandRecommendation } from "../models/BrandRecommendation";

export class BrandRecommendationEngine {
  public generate(
    intelligence: CandidateIntelligenceState,
  ): BrandRecommendation[] {
    return [
      {
        id: "era",

        brandName: "ERA Group",

        score: intelligence.readiness + 5,

        previousScore: intelligence.readiness + 2,

        movement: "up",

        explanation:
          "Leadership and financial readiness improved during Discovery.",

        strengths: [
          "Executive leadership",
          "Strong buying intent",
          "Financial readiness",
        ],

        concerns: [
          "Validate family alignment",
        ],
      },

      {
        id: "brand-b",

        brandName: "Brand B",

        score: intelligence.readiness,

        previousScore: intelligence.readiness,

        movement: "same",

        explanation:
          "Candidate profile remains consistent.",

        strengths: [
          "Operations experience",
        ],

        concerns: [
          "Needs additional Discovery",
        ],
      },
    ];
  }
}
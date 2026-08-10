import type { CandidateIntelligenceState } from "@/feature/intelligence/runtime/CandidateIntelligenceEngine";

import type {
  BrandRecommendation,
} from "../models/BrandRecommendation";

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

        confidence: 97,

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

        discussionPoints: [
          "Review executive transition plan.",
          "Discuss recurring revenue expectations.",
          "Validate spouse and family support.",
        ],

        nextStep:
          "Schedule the Brand Strategy presentation for ERA Group.",

        evidence: [
          {
            id: "leadership",

            title: "Executive Leadership",

            source: "discovery",

            impact: 8,

            confidence: 98,

            summary:
              "Candidate described leading a large multi-state organization.",
          },
          {
            id: "financial",

            title: "Financial Readiness",

            source: "assessment",

            impact: 7,

            confidence: 95,

            summary:
              "Assessment indicates strong liquidity and investment capacity.",
          },
          {
            id: "motivation",

            title: "Ownership Motivation",

            source: "candidate-dna",

            impact: 6,

            confidence: 94,

            summary:
              "Candidate expressed strong desire to transition from corporate leadership into business ownership.",
          },
        ],
      },

      {
        id: "brand-b",

        brandName: "Brand B",

        score: intelligence.readiness,

        previousScore: intelligence.readiness,

        movement: "same",

        confidence: 89,

        explanation:
          "Candidate profile remains consistent but requires additional Discovery.",

        strengths: [
          "Operations experience",
        ],

        concerns: [
          "Needs additional Discovery",
        ],

        discussionPoints: [
          "Explore networking comfort level.",
          "Discuss local market development.",
        ],

        nextStep:
          "Continue Discovery before presenting this opportunity.",

        evidence: [
          {
            id: "operations",

            title: "Operations Experience",

            source: "assessment",

            impact: 5,

            confidence: 90,

            summary:
              "Assessment indicates solid operational management experience.",
          },
        ],
      },
    ];
  }
}
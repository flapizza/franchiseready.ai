import type { CandidateIntelligenceState } from "@/feature/intelligence/models/CandidateIntelligenceState";

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

        confidence: intelligence.confidence,

        overallFit: 97,

        summary:
          "Outstanding overall alignment between the candidate's executive leadership experience, financial readiness, consultative personality, and the ERA Group business model.",

        explanation:
          "Leadership and financial readiness improved during Discovery. The candidate consistently demonstrated executive decision-making ability, strong coachability, and excellent communication skills that align well with ERA Group's ideal franchise profile.",

        strengths: [
          "Executive leadership",
          "Strong buying intent",
          "Financial readiness",
          "Consultative personality",
          "Excellent communication",
        ],

        concerns: [
          "Validate family alignment.",
          "Confirm desired growth timeline.",
        ],

        risks: [
          "Limited franchise ownership experience.",
          "Discuss expectations regarding client acquisition.",
        ],

        discussionPoints: [
          "Review executive transition plan.",
          "Discuss recurring revenue expectations.",
          "Validate spouse and family support.",
          "Review ideal territory characteristics.",
        ],

        recommendedStage: "Introduction",

        nextStep:
          "Generate the referral package and schedule the franchisor introduction.",

        consultantNotes:
          "Candidate appears ready for introduction after one final validation conversation.",

        evidence: [
          {
            id: "leadership",

            title: "Executive Leadership",

            source: "discovery",

            impact: 98,

            confidence: 98,

            summary:
              "Candidate described leading a large multi-state organization.",

            recommendation:
              "Excellent alignment with executive-level franchise systems.",

            supportingData:
              "Validated during Discovery conversation.",
          },
          {
            id: "financial",

            title: "Financial Readiness",

            source: "assessment",

            impact: 95,

            confidence: 95,

            summary:
              "Assessment indicates strong liquidity and investment capacity.",

            recommendation:
              "Qualified for premium franchise opportunities.",

            supportingData:
              "Financial assessment completed successfully.",
          },
          {
            id: "motivation",

            title: "Ownership Motivation",

            source: "candidate-dna",

            impact: 92,

            confidence: 94,

            summary:
              "Candidate expressed a strong desire to transition from corporate leadership into business ownership.",

            recommendation:
              "High long-term ownership motivation.",

            supportingData:
              "Candidate DNA and Discovery analysis.",
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

        overallFit: 89,

        summary:
          "Strong potential opportunity, but additional Discovery is recommended before presenting the brand.",

        explanation:
          "Candidate profile remains consistent but additional behavioral and operational validation would improve recommendation confidence.",

        strengths: [
          "Operations experience",
          "Financial stability",
        ],

        concerns: [
          "Needs additional Discovery.",
        ],

        risks: [
          "Behavioral profile is not yet complete.",
        ],

        discussionPoints: [
          "Explore networking comfort level.",
          "Discuss local market development.",
          "Validate long-term ownership goals.",
        ],

        recommendedStage: "Discovery",

        nextStep:
          "Continue Discovery before presenting this opportunity.",

        consultantNotes:
          "Keep as a secondary recommendation until Discovery is complete.",

        evidence: [
          {
            id: "operations",

            title: "Operations Experience",

            source: "assessment",

            impact: 90,

            confidence: 90,

            summary:
              "Assessment indicates solid operational management experience.",

            recommendation:
              "Operational background supports franchise ownership.",

            supportingData:
              "Operational assessment results.",
          },
        ],
      },
    ];
  }
}
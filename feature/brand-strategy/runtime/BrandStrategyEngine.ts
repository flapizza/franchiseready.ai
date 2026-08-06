import type { CandidateRecord } from "@/feature/crm/models/CandidateRecord";
import type { BrandStrategy } from "../models/BrandStrategy";

export class BrandStrategyEngine {
  public generate(
    candidate: CandidateRecord,
  ): BrandStrategy {
    return {
      generatedAt: new Date().toISOString(),

      candidateSummary:
        candidate.intelligence.executiveSummary,

      overallRecommendation:
        "Present the top-ranked brand first while validating ownership expectations before introducing additional concepts.",

      rankedBrands:
        candidate.intelligence.recommendations.map(
          (brand) => ({
            id: brand.id,

            brandName: brand.name,

            overallFit: brand.overallFit,

            confidence: 92,

            recommendation:
              brand.overallFit >= 90
                ? "Excellent"
                : brand.overallFit >= 80
                ? "Strong"
                : "Good",

            executiveSummary:
              `${brand.name} aligns well with the candidate's executive leadership profile and financial qualifications.`,

            strengths: [
              "Leadership alignment",
              "Financial readiness",
              "Operational capability",
            ],

            concerns: [
              "Validate lifestyle expectations.",
            ],

            talkingPoints: [
              "Focus on executive ownership.",
              "Discuss scalability.",
              "Emphasize proven systems.",
            ],

            objections: [
              "Candidate may compare this opportunity to starting an independent business.",
            ],

            followUpQuestions: [
              "How involved do you want to be after year one?",
              "What type of culture are you looking for?",
            ],
          }),
        ),

      consultantGuidance: [
        "Lead with the highest-ranked brand.",
        "Avoid discussing multiple brands too early.",
        "Validate buying motivation before presenting financial details.",
      ],

      nextSteps: [
        "Complete Discovery.",
        "Review the Executive Brief.",
        "Schedule brand introductions.",
      ],
    };
  }
}
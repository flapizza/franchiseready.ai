import type { CandidateIntelligenceState } from "@/feature/intelligence/models/CandidateIntelligenceState";

import type {
  CandidateDecision,
  CandidateRecommendation,
} from "../models/CandidateDecision";

import type { DecisionEvidence } from "../models/DecisionEvidence";

import type { NextBestAction } from "../models/NextBestAction";

import { ReadinessEvaluator } from "../evaluators/ReadinessEvaluator";
import { RecommendationEvaluator } from "../evaluators/RecommendationEvaluator";
import { ReferralReadinessEvaluator } from "../evaluators/ReferralReadinessEvaluator";

export class CandidateDecisionEngine {
  private readonly readinessEvaluator =
    new ReadinessEvaluator();

  private readonly recommendationEvaluator =
    new RecommendationEvaluator();

  private readonly referralReadinessEvaluator =
    new ReferralReadinessEvaluator();

  public evaluate(
    intelligence: CandidateIntelligenceState,
  ): CandidateDecision {
    const readiness =
      this.readinessEvaluator.score(
        intelligence,
      );

    const recommendation =
      this.recommendationEvaluator.evaluate(
        readiness,
      );

    return {
      recommendation,

      confidence:
        intelligence.confidence,

      nextBestAction:
        this.buildNextBestAction(
          recommendation,
        ),

      referralReadiness:
        this.referralReadinessEvaluator.evaluate(
          intelligence,
        ),

      evidence:
        this.buildEvidence(
          intelligence,
        ),

      unresolvedQuestions: [
        "Confirm spouse or family alignment.",
        "Validate desired ownership role.",
      ],

      consultantGuidance: [
        "Continue asking open-ended Discovery questions.",
        "Validate ownership expectations before presenting brands.",
        "Resolve remaining concerns before making introductions.",
      ],

      generatedAt:
        new Date().toISOString(),
    };
  }

  private buildNextBestAction(
    recommendation: CandidateRecommendation,
  ): NextBestAction {
    switch (recommendation) {
      case "Prepare Referral":
        return {
          title:
            "Generate Referral Package",

          description:
            "The candidate appears ready for a franchisor introduction.",

          priority:
            "critical",

          estimatedMinutes: 10,
        };

      case "Present Brand Strategy":
        return {
          title:
            "Present Brand Strategy",

          description:
            "Review the strongest brand matches with the candidate.",

          priority:
            "high",

          estimatedMinutes: 30,
        };

      case "Continue Discovery":
        return {
          title:
            "Continue Discovery",

          description:
            "Complete Discovery before discussing specific brands.",

          priority:
            "high",

          estimatedMinutes: 45,
        };

      case "Schedule Discovery":
      case "Continue Assessment":
      case "Pause Process":
      case "Refer Candidate":
      default:
        return {
          title:
            "Schedule Discovery Meeting",

          description:
            "Begin or continue Discovery to better understand the candidate.",

          priority:
            "medium",

          estimatedMinutes: 15,
        };
    }
  }

  private buildEvidence(
    intelligence: CandidateIntelligenceState,
  ): DecisionEvidence[] {
    return [
      {
        id: "readiness",

        title:
          "Candidate Readiness",

        explanation:
          `Overall readiness score is ${intelligence.readiness}.`,

        source:
          "intelligence",

        strength:
          intelligence.readiness,
      },

      {
        id: "confidence",

        title:
          "AI Confidence",

        explanation:
          `Overall confidence is ${intelligence.confidence}%.`,

        source:
          "intelligence",

        strength:
          intelligence.confidence,
      },

      ...intelligence.buyingSignals.map(
        (signal, index) => ({
          id: `signal-${index}`,

          title:
            "Buying Signal",

          explanation:
            signal,

          source:
            "discovery" as const,

          strength: 90,
        }),
      ),
    ];
  }
}
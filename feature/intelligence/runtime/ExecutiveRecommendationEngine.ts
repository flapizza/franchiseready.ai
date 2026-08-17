import type { DiscoveryContext } from "@/feature/discovery/models/DiscoveryContext";

import type { RecommendationRule } from "../rules/RecommendationRule";

import type {
  ExecutiveRecommendation,
  ExecutiveEvidence,
  ExecutiveRisk,
} from "../models/ExecutiveRecommendation";

export class ExecutiveRecommendationEngine {
  public evaluate(
    context: DiscoveryContext,
  ): ExecutiveRecommendation {
    const rules: RecommendationRule[] = [];

    const evidence: ExecutiveEvidence[] = [];
    const risks: ExecutiveRisk[] = [];

    let confidence = 85;

    for (const rule of rules) {
      const result = rule.evaluate(context);

      evidence.push(...(result.evidence ?? []));
      risks.push(...(result.risks ?? []));
      confidence += result.confidenceAdjustment ?? 0;
    }

    confidence = Math.max(
      0,
      Math.min(confidence, 99),
    );

    return {
      status:
        risks.some((risk) => risk.severity === "high")
          ? "developing"
          : "ready",

      confidence,

      summary:
        "Candidate demonstrates strong executive ownership potential based on the current Discovery assessment.",

      recommendation:
        "Advance candidate into Brand Matching.",

      evidence,

      risks,

      nextActions: [],
    };
  }
}

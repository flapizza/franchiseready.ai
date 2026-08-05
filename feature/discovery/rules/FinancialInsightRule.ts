import type { AIInsight } from "../models/AIInsight";
import type { DiscoveryContext } from "../models/DiscoveryContext";

import type { InsightRule } from "./InsightRule";

export class FinancialInsightRule
  implements InsightRule
{
  public evaluate(
    context: DiscoveryContext,
  ): AIInsight[] {
    const score =
      context.intelligence.financial
        .financingLikelihood;

    if (score < 80) {
      return [];
    }

    return [
      {
        id: "financial-readiness",

        category: "financial",

        priority: "medium",

        title:
          "Financial readiness appears strong.",

        description:
          "Candidate is likely capable of funding the recommended investment range.",

        recommendation:
          "Spend more meeting time on business fit than financing mechanics.",

        confidence: score,

        generatedAt: new Date(),
      },
    ];
  }
}
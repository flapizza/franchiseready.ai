import type { AIInsight } from "../models/AIInsight";
import type { DiscoveryContext } from "../models/DiscoveryContext";

import type { InsightRule } from "./InsightRule";

export class LeadershipInsightRule
  implements InsightRule
{
  public evaluate(
    context: DiscoveryContext,
  ): AIInsight[] {
    const score =
      context.intelligence.competencies.leadership;

    if (score < 85) {
      return [];
    }

    return [
      {
        id: "leadership-strength",

        category: "leadership",

        priority: "high",

        title:
          "Executive leadership is a major strength.",

        description:
          "The candidate consistently demonstrates strong leadership capability and organizational influence.",

        recommendation:
          "Focus discovery on business growth, delegation, and long-term ownership rather than daily operations.",

        confidence: score,

        generatedAt: new Date(),
      },
    ];
  }
}
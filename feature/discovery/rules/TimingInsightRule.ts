import type { AIInsight } from "../models/AIInsight";
import type { DiscoveryContext } from "../models/DiscoveryContext";

import type { InsightRule } from "./InsightRule";

export class TimingInsightRule
  implements InsightRule
{
  public evaluate(
    context: DiscoveryContext,
  ): AIInsight[] {
    const score =
      context.intelligence.timing.urgency;

    if (score < 75) {
      return [];
    }

    return [
      {
        id: "timing",

        category: "timing",

        priority: "medium",

        title:
          "Buying urgency appears genuine.",

        description:
          "Assessment responses suggest the candidate intends to move within the current decision window.",

        recommendation:
          "Avoid unnecessary delays between discovery and brand presentations.",

        confidence: score,

        generatedAt: new Date(),
      },
    ];
  }
}
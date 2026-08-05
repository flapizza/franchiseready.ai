import type { AIInsight } from "../models/AIInsight";
import type { DiscoveryContext } from "../models/DiscoveryContext";

import type { InsightRule } from "./InsightRule";

export class CoachabilityInsightRule
  implements InsightRule
{
  public evaluate(
    context: DiscoveryContext,
  ): AIInsight[] {
    const score =
      context.intelligence.behavioral.coachability;

    if (score < 80) {
      return [];
    }

    return [
      {
        id: "coachability",

        category: "behavior",

        priority: "high",

        title:
          "Candidate appears highly coachable.",

        description:
          "Assessment responses indicate a strong willingness to follow proven systems and receive coaching.",

        recommendation:
          "Emphasize the franchise support system and operational playbooks during discovery.",

        confidence: score,

        generatedAt: new Date(),
      },
    ];
  }
}
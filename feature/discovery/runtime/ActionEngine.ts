import type { AIInsight } from "../models/AIInsight";
import type { DiscoveryContext } from "../models/DiscoveryContext";
import type { NextBestAction } from "../models/NextBestAction";

export class ActionEngine {
  public generate(
    context: DiscoveryContext,
    insights: AIInsight[],
  ): NextBestAction[] {
    return [
      {
        id: "brand-match",

        title: "Begin Brand Matching",

        description:
          "Present the highest-ranked franchise opportunities.",

        priority: "high",

        completed: false,
      },

      {
        id: "follow-up",

        title: "Schedule Follow-up Meeting",

        description:
          "Continue the discovery process within the next week.",

        priority: "medium",

        completed: false,
      },
    ];
  }
}
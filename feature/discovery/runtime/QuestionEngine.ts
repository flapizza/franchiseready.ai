import type { AIInsight } from "../models/AIInsight";
import type { DiscoveryContext } from "../models/DiscoveryContext";
import type { DiscoveryQuestion } from "../models/DiscoveryQuestion";

export class QuestionEngine {
  public generate(
    context: DiscoveryContext,
    insights: AIInsight[],
  ): DiscoveryQuestion {
    const topInsight = insights[0];

    return {
      id: "default-question",

      category: "motivation",

      question:
        "What would success look like for you five years after becoming a franchise owner?",

      reason:
        topInsight?.recommendation ??
        "Continue exploring the candidate's long-term motivations.",

      expectedOutcome:
        "Gain a deeper understanding of the candidate's personal goals and decision drivers.",

      confidence: topInsight?.confidence ?? 90,
    };
  }
}
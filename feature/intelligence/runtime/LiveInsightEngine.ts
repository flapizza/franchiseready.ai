import type { DiscoveryContext } from "@/feature/discovery/models/DiscoveryContext";
import type { LiveInsight } from "../models/LiveInsight";

export class LiveInsightEngine {
  public evaluate(
    context: DiscoveryContext,
  ): LiveInsight[] {
    const insights: LiveInsight[] = [];

    if (
      context.activeTopics.includes(
        "Leadership",
      )
    ) {
      insights.push({
        id: "leadership",
        timestamp: "11:05",
        category: "leadership",
        severity: "success",
        title: "Leadership Confidence Increased",
        description:
          "Candidate demonstrated executive leadership experience during Discovery.",
        readinessDelta: 4,
        confidenceDelta: 3,
        suggestedQuestion:
          "Tell me about the leadership culture you intentionally built.",
      });
    }

    if (
      context.detectedBuyingSignals.length > 0
    ) {
      insights.push({
        id: "buying-signal",
        timestamp: "11:09",
        category: "motivation",
        severity: "success",
        title: "Buying Signal Detected",
        description:
          "Candidate asked questions indicating genuine ownership interest.",
        readinessDelta: 3,
        confidenceDelta: 2,
        suggestedQuestion:
          "What would need to happen for you to move forward this year?",
      });
    }

    if (
      context.detectedRisks.length > 0
    ) {
      insights.push({
        id: "family-risk",
        timestamp: "11:12",
        category: "risk",
        severity: "warning",
        title: "Family Alignment Needs Validation",
        description:
          context.detectedRisks[0],
        readinessDelta: 0,
        confidenceDelta: -2,
        suggestedQuestion:
          "How involved is your family in this decision?",
      });
    }

    return insights;
  }
}
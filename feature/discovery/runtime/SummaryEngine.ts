import type { AIInsight } from "../models/AIInsight";
import type { DiscoveryContext } from "../models/DiscoveryContext";
import type { MeetingSummary } from "../models/MeetingSummary";

export class SummaryEngine {
  public generate(
    context: DiscoveryContext,
    insights: AIInsight[],
  ): MeetingSummary {
    return {
      executiveSummary:
        "The discovery conversation identified a well-qualified franchise candidate with strong executive leadership potential.",

      consultantRecommendation:
        "Advance the candidate into brand matching.",

      candidateSentiment: "Positive",

      buyingSignals: context.detectedBuyingSignals,

      concerns: context.detectedRisks,

      strengths: insights.map(
        (insight) => insight.title,
      ),

      recommendedNextStep:
        "Schedule a brand presentation.",

      followUpTopics: context.activeTopics,

      aiConfidence: 94,

      supportingInsights: insights,

      generatedAt: new Date(),
    };
  }
}
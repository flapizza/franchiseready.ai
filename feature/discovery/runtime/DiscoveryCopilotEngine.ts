import type { DiscoveryContext } from "../models/DiscoveryContext";
import type { DiscoveryCopilot } from "../models/DiscoveryCopilot";

export class DiscoveryCopilotEngine {
  public generate(
    context: DiscoveryContext,
  ): DiscoveryCopilot {
    const hasRisks =
      context.detectedRisks.length > 0;

    return {
      readiness:
        context.intelligence.overallReadiness,

      confidence:
        context.intelligence.financial
          .financingLikelihood,

      liveInsights: [
        "Candidate demonstrates strong executive leadership.",
        "Financial readiness remains strong.",
        "AI confidence is high.",
      ],

      buyingSignals:
        context.detectedBuyingSignals,

      risks:
        context.detectedRisks,

      nextQuestion:
        hasRisks
          ? "Can you tell me how your family feels about business ownership?"
          : "What type of business ownership experience are you looking for?",

      nextAction:
        hasRisks
          ? "Resolve the identified risks before presenting specific franchise brands."
          : "Continue Discovery and begin validating ideal franchise characteristics.",
    };
  }
}
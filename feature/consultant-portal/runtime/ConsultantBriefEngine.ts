import type { DiscoveryContext } from "@/feature/discovery/models/DiscoveryContext";
import type { ConsultantBrief } from "../models/ConsultantBrief";

export class ConsultantBriefEngine {
  public generate(
    context: DiscoveryContext,
  ): ConsultantBrief {
    return {
      preparedAt: new Date().toLocaleString(),

      executiveSnapshot: {
        readiness:
          context.intelligence.overallReadiness,

        confidence:
          context.intelligence.financial
            .financingLikelihood,

        awardProbability: 91,
      },

      overview: [
        "Executive leadership background.",
        "Interested in long-term business ownership.",
        "Seeking a structured franchise system.",
      ],

      objectives: [
        "Validate ownership motivation.",
        "Confirm family alignment.",
        "Discuss investment expectations.",
        "Understand desired timeline.",
      ],

      strengths: [
        "Leadership",
        "Coachability",
        "Operations",
      ],

      risks:
        context.detectedRisks,

      openingQuestion:
        "What finally convinced you that now is the right time to explore franchise ownership?",

      reminders: [
        "Discuss spouse involvement.",
        "Validate liquid capital.",
        "Confirm relocation flexibility.",
      ],

      recommendedFocus:
        "Spend additional time validating family alignment before discussing specific franchise brands.",
    };
  }
}
import type { CandidateIntelligenceState } from "@/feature/intelligence/models/CandidateIntelligenceState";

import type { ReferralReadiness } from "../models/ReferralReadiness";

export class ReferralReadinessEvaluator {
  public evaluate(
    intelligence: CandidateIntelligenceState,
  ): ReferralReadiness {
    if (intelligence.readiness >= 90) {
      return {
        status: "ready",
        percentage: 100,
        remainingRequirements: [],
      };
    }

    if (intelligence.readiness >= 75) {
      return {
        status: "needs-validation",
        percentage: 80,
        remainingRequirements: [
          "Validate remaining Discovery questions.",
        ],
      };
    }

    return {
      status: "not-ready",
      percentage: 40,
      remainingRequirements: [
        "Complete Discovery.",
        "Validate motivations.",
      ],
    };
  }
}
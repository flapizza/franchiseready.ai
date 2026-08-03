import type { CandidateIntelligence } from "../models/CandidateIntelligence";
import type { NextBestAction } from "../models/NextBestAction";

export class NextBestActionService {
  public determine(
    intelligence: CandidateIntelligence,
  ): NextBestAction {

    if (intelligence.overallReadiness >= 90) {
      return {
        id: crypto.randomUUID(),

        title: "Schedule Discovery Meeting",

        description:
          "Candidate appears highly qualified and should move into discovery.",

        priority: "high",

        confidence: 96,

        estimatedImpact: 95,

        dueInDays: 2,
      };
    }

    if (
      intelligence.financial.financingLikelihood < 70
    ) {
      return {
        id: crypto.randomUUID(),

        title: "Review Funding Strategy",

        description:
          "Financial readiness should be confirmed before continuing.",

        priority: "high",

        confidence: 91,

        estimatedImpact: 92,

        dueInDays: 3,
      };
    }

    if (
      intelligence.behavioral.coachability < 70
    ) {
      return {
        id: crypto.randomUUID(),

        title: "Conduct Additional Qualification",

        description:
          "Further discovery is recommended before presenting brands.",

        priority: "medium",

        confidence: 83,

        estimatedImpact: 81,

        dueInDays: 5,
      };
    }

    return {
      id: crypto.randomUUID(),

      title: "Continue Discovery",

      description:
        "Gather additional information before recommending franchises.",

      priority: "medium",

      confidence: 80,

      estimatedImpact: 75,
    };
  }
}
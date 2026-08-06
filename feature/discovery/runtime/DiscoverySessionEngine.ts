import type { DiscoveryContext } from "../models/DiscoveryContext";
import type { DiscoverySession } from "../models/DiscoverySession";

export class DiscoverySessionEngine {
  public create(
    context: DiscoveryContext,
  ): DiscoverySession {
    return {
      id: crypto.randomUUID(),

      startedAt: new Date().toISOString(),

      currentStage: "opening",

      memory: {
        facts: [],
        buyingSignals: [],
        concerns: [],
        unansweredQuestions: [],
        consultantNotes: [],
      },

      readiness:
        context.intelligence.overallReadiness,

      confidence:
        context.intelligence.financial
          .financingLikelihood,
    };
  }
}
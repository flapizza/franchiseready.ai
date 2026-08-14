import type { DiscoverySession } from "@/feature/discovery/models/DiscoverySession";
import type { DiscoveryMemory } from "@/feature/discovery/models/DiscoveryMemory";

import type { CandidateIntelligenceState } from "../models/CandidateIntelligenceState";

export class CandidateIntelligenceEngine {
  public evaluate(
    session: DiscoverySession,
    memory: DiscoveryMemory,
  ): CandidateIntelligenceState {
    return {
      readiness: session.readiness,

      confidence: session.confidence,

      buyingSignals: memory.buyingSignals,

      risks: memory.concerns,

      executiveSummary:
        "Candidate continues to demonstrate strong executive capability with increasing ownership readiness.",
    };
  }
}
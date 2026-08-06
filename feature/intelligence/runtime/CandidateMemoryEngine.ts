import type { DiscoveryEvent } from "@/feature/discovery/models/DiscoveryEvent";
import type { CandidateMemory } from "../models/CandidateMemory";

export class CandidateMemoryEngine {
  public create(): CandidateMemory {
    return {
      motivations: [],
      goals: [],
      strengths: [],
      concerns: [],
      buyingSignals: [],
      risks: [],
      familyNotes: [],
      financialNotes: [],
      leadershipEvidence: [],
      consultantObservations: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  public applyEvent(
    memory: CandidateMemory,
    event: DiscoveryEvent,
  ): CandidateMemory {
    const updated: CandidateMemory = {
      ...memory,
      lastUpdated: new Date().toISOString(),
    };

    switch (event.type) {
      case "leadership":
        updated.leadershipEvidence.push(event.description);
        updated.strengths.push("Executive leadership");
        break;

      case "buying-signal":
        updated.buyingSignals.push(event.description);
        break;

      case "risk":
        updated.risks.push(event.description);
        break;

      case "family":
        updated.familyNotes.push(event.description);
        break;

      case "financial":
        updated.financialNotes.push(event.description);
        break;

      case "motivation":
        updated.motivations.push(event.description);
        break;
    }

    return updated;
  }
}
import type { DiscoveryMemory } from "../models/DiscoveryMemory";
import type { DiscoveryFact } from "../models/DiscoveryFact";

export class DiscoveryMemoryEngine {
  private readonly facts: DiscoveryFact[] = [];

  public addFact(
    fact: DiscoveryFact,
  ) {
    this.facts.push(fact);
  }

  public getMemory(): DiscoveryMemory {
    return {
      facts: this.facts,

      buyingSignals: this.facts
        .filter(
          (f) =>
            f.category === "motivation",
        )
        .map((f) => f.title),

      concerns: this.facts
        .filter(
          (f) =>
            f.category === "risk",
        )
        .map((f) => f.title),

      unansweredQuestions: [],

      consultantNotes: [],
    };
  }
}
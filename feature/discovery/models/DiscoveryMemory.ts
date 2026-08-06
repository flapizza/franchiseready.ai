import type { DiscoveryFact } from "./DiscoveryFact";

export interface DiscoveryMemory {
  facts: DiscoveryFact[];

  buyingSignals: string[];

  concerns: string[];

  unansweredQuestions: string[];

  consultantNotes: string[];
}
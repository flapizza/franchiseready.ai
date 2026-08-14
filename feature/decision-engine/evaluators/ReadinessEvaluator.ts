import type { CandidateIntelligenceState } from "@/feature/intelligence/models/CandidateIntelligenceState";

export class ReadinessEvaluator {
  public score(
    intelligence: CandidateIntelligenceState,
  ): number {
    return intelligence.readiness;
  }
}
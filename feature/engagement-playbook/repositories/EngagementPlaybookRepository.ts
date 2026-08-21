import type { EngagementStepDecision } from "../models/CandidateEngagementPlaybook";

export interface EngagementPlaybookRepository {
  getDecisions(candidateId: string): EngagementStepDecision[];
  saveDecision(decision: EngagementStepDecision): void;
}

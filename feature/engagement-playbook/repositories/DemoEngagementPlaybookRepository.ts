import "server-only";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import type { EngagementStepDecision } from "../models/CandidateEngagementPlaybook";
import type { EngagementPlaybookRepository } from "./EngagementPlaybookRepository";

export class DemoEngagementPlaybookRepository implements EngagementPlaybookRepository {
  getDecisions(candidateId: string): EngagementStepDecision[] { return demoCandidateOverlayStore.getEngagementPlaybookDecisions(candidateId); }
  saveDecision(decision: EngagementStepDecision): void { demoCandidateOverlayStore.saveEngagementPlaybookDecision(decision); }
}

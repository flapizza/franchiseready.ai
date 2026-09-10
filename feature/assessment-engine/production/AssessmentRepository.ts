import type { ConferenceAnalysis } from "../conference/types";
import type { ProductionAssessmentSession } from "./types";

export interface AssessmentRepository {
  createInvitation(candidateId: string, tokenHash: string, expiresAt: string): Promise<ProductionAssessmentSession>;
  getForCandidate(candidateId: string): Promise<ProductionAssessmentSession | null>;
  regenerateAnalysis(candidateId: string, analysis: ConferenceAnalysis): Promise<void>;
  revoke(candidateId: string): Promise<void>;
}


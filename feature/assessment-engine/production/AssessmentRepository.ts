import type { ConferenceAnalysis } from "../conference/types";
import type { AssessmentProgress, ProductionAssessmentSession } from "./types";

export interface AssessmentRepository {
  createInvitation(candidateId: string, tokenHash: string, expiresAt: string): Promise<ProductionAssessmentSession>;
  getForCandidate(candidateId: string): Promise<ProductionAssessmentSession | null>;
  loadByTokenHash(tokenHash: string): Promise<ProductionAssessmentSession | null>;
  saveProgress(tokenHash: string, progress: AssessmentProgress): Promise<ProductionAssessmentSession>;
  submit(tokenHash: string, progress: AssessmentProgress, analysis: ConferenceAnalysis): Promise<ProductionAssessmentSession>;
  regenerateAnalysis(candidateId: string, analysis: ConferenceAnalysis): Promise<void>;
  revoke(candidateId: string): Promise<void>;
}


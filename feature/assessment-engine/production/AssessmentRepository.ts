import type { ConferenceAnalysis } from "../conference/types";
import type { ContactAssessmentSession, ProductionAssessmentSession } from "./types";

export interface AssessmentRepository {
  createContactForInvitation(input: {firstName: string; lastName: string; email: string; phone: string}): Promise<string>;
  createInvitation(candidateId: string, tokenHash: string, expiresAt: string, expectedReplacementId?: string | null): Promise<ProductionAssessmentSession>;
  createContactInvitation(contactId: string, tokenHash: string, expiresAt: string, expectedReplacementId?: string | null): Promise<ContactAssessmentSession>;
  getForContact(contactId: string): Promise<ContactAssessmentSession | null>;
  revokeForContact(contactId: string): Promise<void>;
  getForCandidate(candidateId: string): Promise<ProductionAssessmentSession | null>;
  regenerateAnalysis(candidateId: string, analysis: ConferenceAnalysis): Promise<void>;
  revoke(candidateId: string): Promise<void>;
}


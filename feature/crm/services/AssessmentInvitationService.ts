import type { AssessmentInvitation } from "../models/AssessmentInvitation";
import type { CandidateRepository } from "../repositories/CandidateRepository";
import { demoCandidateOverlayStore } from "../repositories/DemoCandidateOverlayStore";
import { createDemoCandidateLifecycleService } from "./DemoCandidateLifecycleService";

export class AssessmentInvitationService {
  public constructor(private readonly candidates: CandidateRepository) {}

  async send(candidateId: string): Promise<AssessmentInvitation> {
    const existing = demoCandidateOverlayStore.getInvitationForCandidate(candidateId);
    if (existing?.status === "sent") {
      return existing.assessmentUrl.startsWith("/assessment/demo")
        ? { ...existing, assessmentId: "conference-assessment-v1", assessmentUrl: `/assessment/start?invitation=${encodeURIComponent(existing.token)}` }
        : existing;
    }
    const candidate = await this.candidates.getById(candidateId);
    if (!candidate) throw new Error("Candidate not found.");
    const now = new Date().toISOString();
    const invitationId = `invitation-${crypto.randomUUID()}`;
    const token = crypto.randomUUID();
    const invitation: AssessmentInvitation = {
      id: invitationId, token, candidateId: candidate.id,
      candidateName: `${candidate.firstName} ${candidate.lastName}`, candidateEmail: candidate.email,
      assessmentId: "conference-assessment-v1", assessmentUrl: `/assessment/start?invitation=${encodeURIComponent(token)}`,
      status: "sent", createdAt: now, sentAt: now,
    };
    const transition = await createDemoCandidateLifecycleService(this.candidates).transition({
      candidateId, targetStage: "assessment-started",
      context: { kind: "assessment-invited", reason: `Assessment invitation sent to ${candidate.email}.`, metadata: { invitationId } },
    });
    if (transition.status !== "success") throw new Error(transition.status === "invalid-transition" ? transition.reason : "Candidate not found.");
    demoCandidateOverlayStore.saveInvitation(invitation);
    return invitation;
  }

  getForCandidate(candidateId: string) { return demoCandidateOverlayStore.getInvitationForCandidate(candidateId); }
  getByToken(token: string) { return demoCandidateOverlayStore.getInvitationByToken(token); }
}

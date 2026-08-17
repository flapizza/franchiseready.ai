import type { CandidateRepository } from "../repositories/CandidateRepository";
import type { AssessmentInvitation } from "../models/AssessmentInvitation";
import { demoCandidateOverlayStore } from "../repositories/DemoCandidateOverlayStore";
import type { CandidateResolutionRequest, CandidateResolutionResult, CandidateResolutionService } from "./CandidateResolutionService";

export class DemoCandidateResolutionService implements CandidateResolutionService {
  public constructor(private readonly candidates: CandidateRepository) {}

  async resolve(request: CandidateResolutionRequest): Promise<CandidateResolutionResult> {
    if (request.assessmentInvitationId) {
      const invitation = demoCandidateOverlayStore.getInvitation(request.assessmentInvitationId);
      if (invitation) return this.invitationMatch(invitation, request.consultantId);
    }
    if (request.trustedCandidateId) {
      const candidate = await this.candidates.getById(request.trustedCandidateId);
      if (candidate?.consultantId === request.consultantId) return { status: "matched", candidateId: candidate.id, method: "trusted-candidate-id" };
    }
    if (request.email?.trim()) {
      const matches = await this.candidates.findByNormalizedEmail(request.consultantId, request.email.trim().toLowerCase());
      if (matches.length === 1) return { status: "matched", candidateId: matches[0].id, method: "normalized-email" };
      if (matches.length > 1) return { status: "ambiguous", candidateIds: matches.map((item) => item.id), method: "normalized-email" };
    }
    if (request.phone?.trim()) {
      const normalized = request.phone.replace(/\D/g, "");
      const matches = await this.candidates.findByNormalizedPhone(request.consultantId, normalized);
      if (matches.length === 1) return { status: "matched", candidateId: matches[0].id, method: "normalized-phone" };
      if (matches.length > 1) return { status: "ambiguous", candidateIds: matches.map((item) => item.id), method: "normalized-phone" };
    }
    return { status: "not-found" };
  }

  private async invitationMatch(invitation: AssessmentInvitation, consultantId: string): Promise<CandidateResolutionResult> {
    const candidate = await this.candidates.getById(invitation.candidateId);
    return candidate?.consultantId === consultantId
      ? { status: "matched", candidateId: candidate.id, method: "assessment-invitation" }
      : { status: "not-found" };
  }
}

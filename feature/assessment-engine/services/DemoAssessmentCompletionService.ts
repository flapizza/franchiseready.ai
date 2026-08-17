import type { IntelligenceEngine } from "@/feature/intelligence/services/SeedIntelligenceEngine";
import { SeedIntelligenceEngine } from "@/feature/intelligence/services/SeedIntelligenceEngine";
import type { CandidateRepository } from "@/feature/crm/repositories/CandidateRepository";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import type { CandidateResolutionService } from "@/feature/crm/services/CandidateResolutionService";
import type { AssessmentCompletionCommand, AssessmentCompletionReceipt, AssessmentCompletionSink } from "./AssessmentCompletionSink";
import { createDemoCandidateLifecycleService } from "@/feature/crm/services/DemoCandidateLifecycleService";

export class DemoAssessmentCompletionService implements AssessmentCompletionSink {
  public constructor(
    private readonly candidates: CandidateRepository,
    private readonly resolver: CandidateResolutionService,
    private readonly intelligence: IntelligenceEngine = new SeedIntelligenceEngine(),
  ) {}

  async recordCompletion(command: AssessmentCompletionCommand): Promise<AssessmentCompletionReceipt> {
    const resolution = await this.resolver.resolve({
      consultantId: command.consultantId, assessmentInvitationId: command.assessmentInvitationId,
      trustedCandidateId: command.trustedCandidateId, email: command.participant.email, phone: command.participant.phone,
    });
    if (resolution.status === "ambiguous") return { status: "requires-review", potentialCandidateIds: resolution.candidateIds, resolutionMethod: resolution.method === "normalized-email" ? "ambiguous-email" : "ambiguous-phone" };

    const assessmentId = command.assessmentSessionId;
    const profile = await this.intelligence.buildProfile(assessmentId);
    const now = command.completedAt;
    if (resolution.status === "matched") {
      const candidate = await this.candidates.getById(resolution.candidateId);
      if (!candidate) throw new Error("Resolved candidate could not be loaded.");
      await this.candidates.save({ ...candidate, assessmentIds: [...new Set([...candidate.assessmentIds, assessmentId])], intelligence: profile, updatedAt: now, lastActivityAt: now });
      const transition = await createDemoCandidateLifecycleService(this.candidates).transition({
        candidateId: candidate.id, targetStage: "assessment-completed",
        context: { kind: "assessment-completed", reason: "The completed assessment was attached to the existing candidate identity.", metadata: { assessmentId } },
      });
      if (transition.status !== "success") throw new Error(transition.status === "invalid-transition" ? transition.reason : "Candidate not found.");
      this.completeInvitation(command.assessmentInvitationId, now);
      return { status: "updated-existing-candidate", candidateId: candidate.id, assessmentId, resolutionMethod: resolution.method };
    }

    const candidateId = `candidate-${crypto.randomUUID()}`;
    await this.candidates.save({
      id: candidateId, firstName: command.participant.firstName.trim(), lastName: command.participant.lastName.trim(), email: command.participant.email.trim().toLowerCase(),
      phone: command.participant.phone?.trim() ?? "", city: "", state: "", country: "USA", consultantId: command.consultantId,
      status: "active", pipelineStage: "lead", healthScore: 0, createdAt: now, updatedAt: now, lastActivityAt: now,
      assessmentIds: [assessmentId], intelligence: profile, leadSource: "Assessment first",
    });
    const transition = await createDemoCandidateLifecycleService(this.candidates).transition({
      candidateId, targetStage: "assessment-completed",
      context: { kind: "assessment-first-completed", reason: "Assessment-first identity resolution found no existing candidate, so the new canonical record received the completed assessment.", metadata: { assessmentId } },
    });
    if (transition.status !== "success") throw new Error(transition.status === "invalid-transition" ? transition.reason : "Candidate not found.");
    return { status: "created-candidate", candidateId, assessmentId, resolutionMethod: "no-match" };
  }
  private completeInvitation(id: string | undefined, completedAt: string) {
    if (!id) return;
    const invitation = demoCandidateOverlayStore.getInvitation(id);
    if (invitation) demoCandidateOverlayStore.saveInvitation({ ...invitation, status: "completed", completedAt });
  }
}

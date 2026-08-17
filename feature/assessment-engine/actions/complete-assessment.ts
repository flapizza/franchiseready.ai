"use server";

import { revalidatePath } from "next/cache";
import type { Response } from "../types/domain";
import { AssessmentScoringService } from "../scoring/services/AssessmentScoringService";
import { DemoAssessmentCompletionService } from "../services/DemoAssessmentCompletionService";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { DemoCandidateResolutionService } from "@/feature/crm/services/DemoCandidateResolutionService";
import { AssessmentInvitationService } from "@/feature/crm/services/AssessmentInvitationService";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";

export interface AssessmentIdentityInput { firstName: string; lastName: string; email: string; phone?: string }
export interface CompleteAssessmentInput { assessmentId: string; sessionId: string; invitationToken?: string; identity: AssessmentIdentityInput; responses: Response[] }
export type CompleteAssessmentResult = { status: "completed"; candidateId: string } | { status: "requires-review"; message: string };

export async function completeAssessmentAction(input: CompleteAssessmentInput): Promise<CompleteAssessmentResult> {
  const repository = new SeedCandidateRepository();
  const invitation = input.invitationToken ? new AssessmentInvitationService(repository).getByToken(input.invitationToken) : null;
  const session = { id: input.sessionId, assessmentVersionId: input.assessmentId, participantId: input.identity.email.trim().toLowerCase(), status: "completed" as const, responses: input.responses, completedAt: new Date().toISOString() };
  const result = new AssessmentScoringService().score(session);
  const receipt = await new DemoAssessmentCompletionService(repository, new DemoCandidateResolutionService(repository)).recordCompletion({
    assessmentSessionId: session.id, assessmentVersionId: input.assessmentId, completedAt: session.completedAt,
    consultantId: demoConsultant.id, assessmentInvitationId: invitation?.id,
    participant: { participantId: session.participantId, ...input.identity }, result,
  });
  if (receipt.status === "requires-review") return { status: "requires-review", message: "We found possible matching records. A consultant must review them before completion can be attached." };
  revalidatePath("/crm/candidates");
  revalidatePath(`/crm/candidates/${receipt.candidateId}`);
  return { status: "completed", candidateId: receipt.candidateId };
}

"use server";

import { revalidatePath } from "next/cache";
import type { Response } from "../types/domain";
import { AssessmentScoringService } from "../scoring/services/AssessmentScoringService";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";

export interface AssessmentIdentityInput { firstName: string; lastName: string; email: string; phone?: string }
export interface CompleteAssessmentInput { assessmentId: string; sessionId: string; invitationToken?: string; identity: AssessmentIdentityInput; responses: Response[] }
export type CompleteAssessmentResult = { status: "completed"; candidateId: string } | { status: "requires-review"; message: string };

export async function completeAssessmentAction(input: CompleteAssessmentInput): Promise<CompleteAssessmentResult> {
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved" || !("runtimes" in resolution.composition))return {status:"requires-review",message:"This assessment completion path is not available in this workspace."};const composition=resolution.composition;
  const invitation = input.invitationToken ? composition.runtimes.createAssessmentInvitations().getByToken(input.invitationToken) : null;
  const session = { id: input.sessionId, assessmentVersionId: input.assessmentId, participantId: input.identity.email.trim().toLowerCase(), status: "completed" as const, responses: input.responses, completedAt: new Date().toISOString() };
  const result = new AssessmentScoringService().score(session);
  const receipt = await composition.runtimes.createAssessmentCompletion().recordCompletion({
    assessmentSessionId: session.id, assessmentVersionId: input.assessmentId, completedAt: session.completedAt,
    consultantId: composition.runtimes.consultant.id, assessmentInvitationId: invitation?.id,
    participant: { participantId: session.participantId, ...input.identity }, result,
  });
  if (receipt.status === "requires-review") return { status: "requires-review", message: "We found possible matching records. A consultant must review them before completion can be attached." };
  revalidatePath("/crm/candidates");
  revalidatePath(`/crm/candidates/${receipt.candidateId}`);
  return { status: "completed", candidateId: receipt.candidateId };
}

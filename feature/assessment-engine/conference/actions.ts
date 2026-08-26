"use server";

import { isConferenceDemoAccessEnabled } from "@/lib/auth/demo-access";
import { redirect } from "next/navigation";
import { ConferenceAssessmentAnalysisService } from "./ConferenceAssessmentAnalysisService";
import { conferenceAssessmentStore } from "./ConferenceAssessmentStore";
import { CONFERENCE_INSTRUMENT_VERSION, type ConferenceAnswers, type ConferenceIntake } from "./types";
import { validateConferenceSubmission } from "./validation";
import { AssessmentInvitationService } from "@/feature/crm/services/AssessmentInvitationService";
import { DemoAssessmentCompletionService } from "../services/DemoAssessmentCompletionService";
import { DemoCandidateResolutionService } from "@/feature/crm/services/DemoCandidateResolutionService";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import { revalidatePath } from "next/cache";
import { AssessmentScoringService } from "../scoring/services/AssessmentScoringService";

export async function completeConferenceAssessment(input: { intake: ConferenceIntake; answers: ConferenceAnswers; consent: boolean; startedAt: string; invitationToken?: string }) {
  if (!isConferenceDemoAccessEnabled()) throw new Error("Conference assessment access is not enabled.");
  const errors = validateConferenceSubmission(input.intake, input.answers, input.consent);
  if (errors.length) return { ok: false as const, errors };
  const completedAt = new Date();
  const startedAt = new Date(input.startedAt);
  const id = `conf_${crypto.randomUUID()}`;
  const analysis = new ConferenceAssessmentAnalysisService().analyze(input.intake, input.answers);
  let candidateId = `conference-candidate_${crypto.randomUUID()}`;
  if (input.invitationToken) {
    const candidates = new SeedCandidateRepository();
    const invitation = new AssessmentInvitationService(candidates).getByToken(input.invitationToken);
    if (!invitation) return { ok: false as const, errors: ["This assessment invitation is no longer available"] };
    const participantId = input.intake.email.trim().toLowerCase();
    const compatibilityResult = new AssessmentScoringService().score({ id, assessmentVersionId: CONFERENCE_INSTRUMENT_VERSION, participantId, status: "completed", responses: [], completedAt: completedAt.toISOString() });
    const receipt = await new DemoAssessmentCompletionService(candidates, new DemoCandidateResolutionService(candidates)).recordCompletion({
      assessmentSessionId: id, assessmentVersionId: CONFERENCE_INSTRUMENT_VERSION, completedAt: completedAt.toISOString(),
      consultantId: demoConsultant.id, assessmentInvitationId: invitation.id,
      participant: { participantId, firstName: input.intake.firstName, lastName: input.intake.lastName, email: input.intake.email, phone: input.intake.mobilePhone },
      result: compatibilityResult,
    });
    if (receipt.status === "requires-review") return { ok: false as const, errors: ["A consultant must review possible matching candidate records"] };
    candidateId = receipt.candidateId;
    revalidatePath("/crm/candidates");
    revalidatePath(`/crm/candidates/${candidateId}`);
  }
  conferenceAssessmentStore.save({ id, candidateId, status: "analyzed", instrumentVersion: CONFERENCE_INSTRUMENT_VERSION, intake: input.intake, answers: input.answers, startedAt: startedAt.toISOString(), completedAt: completedAt.toISOString(), durationSeconds: Math.max(0, Math.round((completedAt.getTime() - startedAt.getTime()) / 1000)), analysis });
  return { ok: true as const, id, candidateId };
}

export async function clearConferenceAssessments() {
  if (!isConferenceDemoAccessEnabled()) throw new Error("Conference assessment access is not enabled.");
  conferenceAssessmentStore.clear();
  redirect("/crm");
}

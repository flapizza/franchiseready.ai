"use server";

import { isConferenceDemoAccessEnabled } from "@/lib/auth/demo-access";
import { redirect } from "next/navigation";
import { ConferenceAssessmentAnalysisService } from "./ConferenceAssessmentAnalysisService";
import { conferenceAssessmentStore } from "./ConferenceAssessmentStore";
import type { ConferenceAnswers, ConferenceIntake } from "./types";
import { validateConferenceSubmission } from "./validation";

export async function completeConferenceAssessment(input: { intake: ConferenceIntake; answers: ConferenceAnswers; consent: boolean; startedAt: string }) {
  if (!isConferenceDemoAccessEnabled()) throw new Error("Conference assessment access is not enabled.");
  const errors = validateConferenceSubmission(input.intake, input.answers, input.consent);
  if (errors.length) return { ok: false as const, errors };
  const completedAt = new Date();
  const startedAt = new Date(input.startedAt);
  const id = `conf_${crypto.randomUUID()}`;
  const candidateId = `conference-candidate_${crypto.randomUUID()}`;
  const analysis = new ConferenceAssessmentAnalysisService().analyze(input.intake, input.answers);
  conferenceAssessmentStore.save({ id, candidateId, status: "analyzed", intake: input.intake, answers: input.answers, startedAt: startedAt.toISOString(), completedAt: completedAt.toISOString(), durationSeconds: Math.max(0, Math.round((completedAt.getTime() - startedAt.getTime()) / 1000)), analysis });
  return { ok: true as const, id, candidateId };
}

export async function clearConferenceAssessments() {
  if (!isConferenceDemoAccessEnabled()) throw new Error("Conference assessment access is not enabled.");
  conferenceAssessmentStore.clear();
  redirect("/crm");
}

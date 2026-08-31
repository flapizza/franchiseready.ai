"use server";

import { revalidatePath } from "next/cache";
import type { EngagementStepStatus } from "../models/CandidateEngagementPlaybook";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { demoLocalIso } from "@/feature/calendar/time/ConsultantTime";

export interface PlaybookActionState { status: "idle" | "success" | "error"; message?: string; taskId?: string }

const refresh = (candidateId: string) => { revalidatePath(`/crm/candidates/${candidateId}`); revalidatePath(`/crm/candidates/${candidateId}/playbook`); revalidatePath("/crm"); revalidatePath("/crm/communications"); revalidatePath("/crm/tasks"); };

async function context(formData: FormData) {
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved" || !("runtimes" in resolution.composition))return null;const composition=resolution.composition;
  const candidateId = String(formData.get("candidateId") ?? "");
  const stepId = String(formData.get("stepId") ?? "");
  const playbook = await composition.runtimes.createEngagementPlaybook().build(candidateId);
  const step = playbook?.steps.find((item) => item.stepId === stepId);
  return playbook && step ? { candidateId, playbook, step, composition } : null;
}

export async function decidePlaybookStep(_state: PlaybookActionState, formData: FormData): Promise<PlaybookActionState> {
  const value = await context(formData);
  if (!value) return { status: "error", message: "Playbook step is no longer available." };
  const requested = String(formData.get("decision")) as EngagementStepStatus;
  if (!["accepted", "completed", "skipped", "dismissed"].includes(requested)) return { status: "error", message: "Choose a valid consultant decision." };
  value.composition.dependencies.engagementPlaybook.saveDecision({ candidateId: value.candidateId, stepId: value.step.stepId, evidenceFingerprint: value.playbook.evidenceFingerprint, status: requested as Exclude<EngagementStepStatus, "recommended">, decidedAt: new Date().toISOString(), relatedMessageId: value.step.relatedMessageId });
  refresh(value.candidateId);
  return { status: "success", message: requested === "accepted" ? "Step accepted. Nothing was executed automatically." : `Step ${requested}.` };
}

export async function createPlaybookTask(_state: PlaybookActionState, formData: FormData): Promise<PlaybookActionState> {
  const value = await context(formData);
  if (!value) return { status: "error", message: "Playbook step is no longer available." };
  try {
    const suggestedOffset = value.step.suggestedDueAt
      ? Math.max(0, Math.round((Date.parse(value.step.suggestedDueAt) - Date.parse(value.playbook.generatedAt)) / 86_400_000))
      : 0;
    const task = await value.composition.runtimes.createTaskService().create(value.composition.runtimes.consultant.id, {
      title: value.step.title, description: value.step.description, dueAt: demoLocalIso(suggestedOffset, 14), priority: "normal", candidateId: value.candidateId,
    }, { source: "engagement-playbook", sourceReferenceId: value.step.stepId, recommendedReason: value.step.rationale });
    value.composition.dependencies.engagementPlaybook.saveDecision({ candidateId: value.candidateId, stepId: value.step.stepId, evidenceFingerprint: value.playbook.evidenceFingerprint, status: "accepted", decidedAt: new Date().toISOString(), relatedTaskId: task.taskId, relatedMessageId: value.step.relatedMessageId });
    refresh(value.candidateId);
    return { status: "success", message: "Task created from the playbook recommendation.", taskId: task.taskId };
  } catch (error) { return { status: "error", message: error instanceof Error ? error.message : "The task could not be created." }; }
}

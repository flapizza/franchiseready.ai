"use server";

import { revalidatePath } from "next/cache";
import { getConferenceDemoUser } from "@/lib/auth/demo-session";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { DemoCandidateActivityRepository } from "@/feature/crm/repositories/DemoCandidateActivityRepository";
import { DemoTaskRepository } from "@/feature/tasks/repositories/DemoTaskRepository";
import { TaskService } from "@/feature/tasks/services/TaskService";
import type { EngagementStepStatus } from "../models/CandidateEngagementPlaybook";
import { DemoEngagementPlaybookRepository } from "../repositories/DemoEngagementPlaybookRepository";
import { CandidateEngagementPlaybookService } from "../services/CandidateEngagementPlaybookService";

export interface PlaybookActionState { status: "idle" | "success" | "error"; message?: string; taskId?: string }

const refresh = (candidateId: string) => { revalidatePath(`/crm/candidates/${candidateId}`); revalidatePath(`/crm/candidates/${candidateId}/playbook`); revalidatePath("/crm"); revalidatePath("/crm/communications"); revalidatePath("/crm/tasks"); };

async function context(formData: FormData) {
  if (!(await getConferenceDemoUser())) return null;
  const candidateId = String(formData.get("candidateId") ?? "");
  const stepId = String(formData.get("stepId") ?? "");
  const playbook = await new CandidateEngagementPlaybookService().build(candidateId);
  const step = playbook?.steps.find((item) => item.stepId === stepId);
  return playbook && step ? { candidateId, playbook, step } : null;
}

export async function decidePlaybookStep(_state: PlaybookActionState, formData: FormData): Promise<PlaybookActionState> {
  const value = await context(formData);
  if (!value) return { status: "error", message: "Playbook step is no longer available." };
  const requested = String(formData.get("decision")) as EngagementStepStatus;
  if (!["accepted", "completed", "skipped", "dismissed"].includes(requested)) return { status: "error", message: "Choose a valid consultant decision." };
  new DemoEngagementPlaybookRepository().saveDecision({ candidateId: value.candidateId, stepId: value.step.stepId, evidenceFingerprint: value.playbook.evidenceFingerprint, status: requested as Exclude<EngagementStepStatus, "recommended">, decidedAt: new Date().toISOString(), relatedMessageId: value.step.relatedMessageId });
  refresh(value.candidateId);
  return { status: "success", message: requested === "accepted" ? "Step accepted. Nothing was executed automatically." : `Step ${requested}.` };
}

export async function createPlaybookTask(_state: PlaybookActionState, formData: FormData): Promise<PlaybookActionState> {
  const value = await context(formData);
  if (!value) return { status: "error", message: "Playbook step is no longer available." };
  try {
    const task = await new TaskService(new DemoTaskRepository(), new SeedCandidateRepository(), new DemoCandidateActivityRepository()).create(demoConsultant.id, {
      title: value.step.title, description: value.step.description, dueAt: value.step.suggestedDueAt ?? "2026-08-24T14:00:00.000Z", priority: "normal", candidateId: value.candidateId,
    }, { source: "engagement-playbook", sourceReferenceId: value.step.stepId, recommendedReason: value.step.rationale });
    new DemoEngagementPlaybookRepository().saveDecision({ candidateId: value.candidateId, stepId: value.step.stepId, evidenceFingerprint: value.playbook.evidenceFingerprint, status: "accepted", decidedAt: new Date().toISOString(), relatedTaskId: task.taskId, relatedMessageId: value.step.relatedMessageId });
    refresh(value.candidateId);
    return { status: "success", message: "Task created from the playbook recommendation.", taskId: task.taskId };
  } catch (error) { return { status: "error", message: error instanceof Error ? error.message : "The task could not be created." }; }
}

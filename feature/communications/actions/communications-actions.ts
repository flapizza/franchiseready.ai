"use server";

import { revalidatePath } from "next/cache";
import { getConferenceDemoUser } from "@/lib/auth/demo-session";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { DemoCandidateActivityRepository } from "@/feature/crm/repositories/DemoCandidateActivityRepository";
import { DemoTaskRepository } from "@/feature/tasks/repositories/DemoTaskRepository";
import { TaskService } from "@/feature/tasks/services/TaskService";
import { DemoEmailRepository } from "../repositories/DemoEmailRepository";

export interface CommunicationsActionState { status: "idle" | "success" | "error"; message?: string; taskId?: string }

const refresh = () => { revalidatePath("/crm/communications"); revalidatePath("/crm/tasks"); revalidatePath("/crm"); };

export async function createCommunicationFollowUpTask(_state: CommunicationsActionState, formData: FormData): Promise<CommunicationsActionState> {
  if (!(await getConferenceDemoUser())) return { status: "error", message: "Your session has expired." };
  const candidateId = String(formData.get("candidateId") ?? "");
  const messageId = String(formData.get("messageId") ?? "");
  const reason = String(formData.get("reason") ?? "Communication follow-up recommended.");
  const message = new DemoEmailRepository().getMessage(candidateId, messageId);
  if (!message || message.consultantId !== demoConsultant.id) return { status: "error", message: "Communication not found." };
  try {
    const task = await new TaskService(new DemoTaskRepository(), new SeedCandidateRepository(), new DemoCandidateActivityRepository()).create(demoConsultant.id, {
      title: `Follow up: ${message.subject}`,
      description: reason,
      candidateId,
      priority: message.deliveryStatus === "failed" ? "high" : "normal",
      dueAt: "2026-08-22T16:00:00.000Z",
    }, { source: "email-engagement", sourceReferenceId: `communication-follow-up:${messageId}`, recommendedReason: reason });
    refresh();
    return { status: "success", message: "Follow-up task created.", taskId: task.taskId };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "The task could not be created." };
  }
}

export async function dismissCommunicationFollowUp(_state: CommunicationsActionState, formData: FormData): Promise<CommunicationsActionState> {
  if (!(await getConferenceDemoUser())) return { status: "error", message: "Your session has expired." };
  const candidateId = String(formData.get("candidateId") ?? "");
  const messageId = String(formData.get("messageId") ?? "");
  const repository = new DemoEmailRepository();
  const message = repository.getMessage(candidateId, messageId);
  if (!message || message.consultantId !== demoConsultant.id) return { status: "error", message: "Communication not found." };
  repository.dismissFollowUp(messageId);
  refresh();
  return { status: "success", message: "Follow-up recommendation dismissed." };
}

"use server";

import { revalidatePath } from "next/cache";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { demoLocalIso } from "@/feature/calendar/time/ConsultantTime";

export interface CommunicationsActionState { status: "idle" | "success" | "error"; message?: string; taskId?: string }

const refresh = () => { revalidatePath("/crm/communications"); revalidatePath("/crm/tasks"); revalidatePath("/crm"); };

export async function createCommunicationFollowUpTask(_state: CommunicationsActionState, formData: FormData): Promise<CommunicationsActionState> {
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved" || !("runtimes" in resolution.composition))return {status:"error",message:"Communication follow-ups are not available in this workspace."};const composition=resolution.composition;
  const candidateId = String(formData.get("candidateId") ?? "");
  const messageId = String(formData.get("messageId") ?? "");
  const reason = String(formData.get("reason") ?? "Communication follow-up recommended.");
  const message = composition.dependencies.emailMessages.getMessage(candidateId, messageId);
  if (!message || message.consultantId !== composition.runtimes.consultant.id) return { status: "error", message: "Communication not found." };
  try {
    const task = await composition.runtimes.createTaskService().create(composition.runtimes.consultant.id, {
      title: `Follow up: ${message.subject}`,
      description: reason,
      candidateId,
      priority: message.deliveryStatus === "failed" ? "high" : "normal",
      dueAt: demoLocalIso(1, 16),
    }, { source: "email-engagement", sourceReferenceId: `communication-follow-up:${messageId}`, recommendedReason: reason });
    refresh();
    return { status: "success", message: "Follow-up task created.", taskId: task.taskId };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "The task could not be created." };
  }
}

export async function dismissCommunicationFollowUp(_state: CommunicationsActionState, formData: FormData): Promise<CommunicationsActionState> {
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved" || !("runtimes" in resolution.composition))return {status:"error",message:"Communication follow-ups are not available in this workspace."};const composition=resolution.composition;
  const candidateId = String(formData.get("candidateId") ?? "");
  const messageId = String(formData.get("messageId") ?? "");
  const repository = composition.dependencies.emailMessages;
  const message = repository.getMessage(candidateId, messageId);
  if (!message || message.consultantId !== composition.runtimes.consultant.id) return { status: "error", message: "Communication not found." };
  repository.dismissFollowUp(messageId);
  refresh();
  return { status: "success", message: "Follow-up recommendation dismissed." };
}

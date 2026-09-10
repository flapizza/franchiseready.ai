"use server";

import { revalidatePath } from "next/cache";
import {localDateTimeToIso} from "@/feature/calendar/time/ConsultantTime";
import { TaskValidationError } from "../services/TaskService";

import { resolveConsultantSchedule } from "@/feature/tasks/runtime/resolveConsultantSchedule";
type Schedule = NonNullable<Awaited<ReturnType<typeof resolveConsultantSchedule>>>;
import type { TaskPriority } from "../models/ConsultantTask";

export interface TaskActionState { status: "idle" | "success" | "error"; message?: string; taskId?: string }
const refresh = (candidateId?: string) => { revalidatePath("/crm/tasks"); revalidatePath("/crm"); revalidatePath("/crm/candidates"); if (candidateId) revalidatePath(`/crm/candidates/${candidateId}`); };
const demo = resolveConsultantSchedule;
function input(formData: FormData) { return { title: String(formData.get("title") ?? ""), description: String(formData.get("description") ?? ""), dueAt: localDateTimeToIso(String(formData.get("dueAt") ?? "")), priority: String(formData.get("priority") ?? "normal") as TaskPriority, candidateId: String(formData.get("candidateId") ?? "") || undefined }; }
async function run(operation: (composition:Schedule) => Promise<{ taskId: string; candidateId?: string }>, message: string): Promise<TaskActionState> {
  const composition=await demo();if(!composition) return { status: "error", message: "Tasks are not available in this workspace." };
  try { const task = await operation(composition); refresh(task.candidateId); return { status: "success", message, taskId: task.taskId }; }
  catch (error) { return { status: "error", message: error instanceof TaskValidationError ? error.message : "The task could not be updated." }; }
}
export async function createTaskAction(_previous: TaskActionState, formData: FormData) { return run((c) => c.taskService.create(c.consultantId, input(formData)), "Task created."); }
export async function updateTaskAction(_previous: TaskActionState, formData: FormData) { return run((c) => c.taskService.update(c.consultantId, String(formData.get("taskId") ?? ""), input(formData)), "Task updated."); }
export async function transitionTaskAction(_previous: TaskActionState, formData: FormData) {
  const taskId = String(formData.get("taskId") ?? ""); const operation = String(formData.get("operation") ?? "");
  if(operation==="delete") { const c=await demo();if(!c?.persisted)return{status:"error" as const,message:"Task deletion unavailable."};try{const t=await c.persisted.delete(taskId);refresh(t.candidateId);return{status:"success" as const,message:"Task deleted."}}catch{return{status:"error" as const,message:"Task could not be deleted."}} }
  if(!["complete","cancel","reopen"].includes(operation))return{status:"error" as const,message:"Invalid task operation."};
  const expectedCandidateId = String(formData.get("expectedCandidateId") ?? "");
  if (expectedCandidateId) {
    const composition=await demo();if(!composition)return {status:"error" as const,message:"Tasks are not available in this workspace."};const task = await composition.tasks.getById(taskId);
    if (!task || task.candidateId !== expectedCandidateId) return { status: "error" as const, message: "This task does not belong to that candidate." };
  }
  return run((c) => operation === "complete" ? c.taskService.complete(c.consultantId, taskId) : operation === "cancel" ? c.taskService.cancel(c.consultantId, taskId) : c.taskService.reopen(c.consultantId, taskId), operation === "complete" ? "Task completed." : operation === "cancel" ? "Task cancelled." : "Task reopened.");
}
export async function acceptRecommendationAction(_previous: TaskActionState, formData: FormData) {
  const id = String(formData.get("recommendationId") ?? "");
  const composition=await demo();if(!composition)return {status:"error" as const,message:"Tasks are not available in this workspace."};
  const state = await composition.taskRuntime.build(composition.consultantId);
  const recommendation = state.recommendations.find((item) => item.recommendationId === id);
  if (!recommendation) return { status: "error" as const, message: "Recommendation is no longer available." };
  return run((c) => c.taskService.accept(c.consultantId, recommendation, String(formData.get("dueAt") ?? "") || undefined), "Task created from recommendation.");
}
export async function dismissRecommendationAction(_previous: TaskActionState, formData: FormData): Promise<TaskActionState> {
  const composition=await demo();if(!composition)return {status:"error",message:"Tasks are not available in this workspace."};
  const id = String(formData.get("recommendationId") ?? "");
  const recommendation = (await composition.taskRuntime.build(composition.consultantId)).recommendations.find((item) => item.recommendationId === id);
  if (!recommendation) return { status: "error", message: "Recommendation is no longer available." };
  await composition.taskService.dismiss(composition.consultantId, recommendation); refresh(recommendation.candidateId); return { status: "success", message: "Recommendation dismissed." };
}

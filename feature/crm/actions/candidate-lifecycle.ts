"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SeedCandidateRepository } from "../repositories/SeedCandidateRepository";
import { createDemoCandidateLifecycleService } from "../services/DemoCandidateLifecycleService";

export interface LifecycleActionState { status: "idle" | "success" | "invalid-transition" | "candidate-not-found" | "no-action"; message?: string }

export async function advanceCandidateLifecycleAction(_previous: LifecycleActionState, formData: FormData): Promise<LifecycleActionState> {
  const candidateId = String(formData.get("candidateId") ?? "");
  const repository = new SeedCandidateRepository();
  const candidate = await repository.getById(candidateId);
  if (!candidate) return { status: "candidate-not-found", message: "Candidate not found." };

  const service = createDemoCandidateLifecycleService(repository);
  const action = service.getRecommendedAction(candidate);
  if (!action) return { status: "no-action", message: "No lifecycle transition is currently available." };
  const result = await service.transition({ candidateId, targetStage: action.targetStage, context: { kind: action.kind, reason: action.reason } });
  if (result.status !== "success") return { status: result.status, message: result.status === "invalid-transition" ? result.reason : "Candidate not found." };

  revalidatePath("/crm");
  revalidatePath("/crm/candidates");
  revalidatePath(`/crm/candidates/${candidateId}`);
  if (action.returnPath) redirect(action.returnPath);
  return { status: "success", message: `${action.label} completed.` };
}

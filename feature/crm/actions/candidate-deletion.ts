"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCandidateRepository } from "../repositories/candidate-repository-factory";

export type CandidateDeletionState = { status: "idle" | "error"; message?: string };

export async function deleteCandidateAction(
  _previous: CandidateDeletionState,
  formData: FormData,
): Promise<CandidateDeletionState> {
  const candidateId = String(formData.get("candidateId") ?? "").trim();
  if (!candidateId || formData.get("confirmed") !== "yes") {
    return { status: "error", message: "Confirm candidate deletion before continuing." };
  }

  try {
    const composition = await createCandidateRepository();
    if (!composition) return { status: "error", message: "An active workspace is required." };
    await composition.repository.deleteById(candidateId);
  } catch {
    return { status: "error", message: "Candidate could not be deleted. Related records may need to be retained." };
  }

  revalidatePath("/crm/candidates");
  revalidatePath(`/crm/candidates/${candidateId}`);
  redirect("/crm/candidates");
}

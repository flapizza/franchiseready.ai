"use server";

import { revalidatePath } from "next/cache";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import { DemoCandidateResolutionService } from "../services/DemoCandidateResolutionService";
import { CandidateIntakeService } from "../services/CandidateIntakeService";
import { AssessmentInvitationService } from "../services/AssessmentInvitationService";
import { createCandidateRepository } from "../repositories/candidate-repository-factory";

export interface CandidateFormState {
  status: "idle" | "validation-error" | "created" | "exact-match" | "possible-match";
  message?: string;
  candidateId?: string;
  candidateName?: string;
  candidateIds?: string[];
}

export async function createCandidateAction(_previous: CandidateFormState, formData: FormData): Promise<CandidateFormState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!firstName || !lastName || !/^\S+@\S+\.\S+$/.test(email)) return { status: "validation-error", message: "Enter a first name, last name, and valid email address." };

  const composition = await createCandidateRepository();
  if (!composition) return { status: "validation-error", message: "An active workspace is required." };
  const repository = composition.repository;
  const service = new CandidateIntakeService(repository, new DemoCandidateResolutionService(repository));
  try {
    const result = await service.create({
    consultantId: composition.workspace?.membership.id ?? demoConsultant.id, firstName, lastName, email,
    phone: String(formData.get("phone") ?? ""), city: String(formData.get("city") ?? ""), state: String(formData.get("state") ?? ""),
    preferredTerritory: String(formData.get("preferredTerritory") ?? ""), leadSource: String(formData.get("leadSource") ?? ""), notes: String(formData.get("notes") ?? ""),
  });
    if (result.status === "possible-match") return { status: "possible-match", message: "Possible duplicate candidates require review before creation.", candidateIds: result.candidateIds };
    const candidate = result.candidate;
    revalidatePath("/crm/candidates");
    return { status: result.status, candidateId: candidate.id, candidateName: `${candidate.firstName} ${candidate.lastName}`, message: result.status === "created" ? "Candidate created." : "An existing candidate matches this identity. No duplicate was created." };
  } catch {
    return { status: "validation-error", message: "Candidate could not be created." };
  }
}

export interface InvitationActionState { status: "idle" | "sent" | "error"; message?: string; url?: string; candidateId?: string }

export async function sendAssessmentInvitationAction(_previous: InvitationActionState, formData: FormData): Promise<InvitationActionState> {
  const candidateId = String(formData.get("candidateId") ?? "");
  try {
    const composition = await createCandidateRepository();
    if (!composition || composition.mode === "supabase") return { status: "error", message: "Assessment persistence is not available yet." };
    const invitation = await new AssessmentInvitationService(composition.repository).send(candidateId);
    revalidatePath("/crm/candidates");
    revalidatePath(`/crm/candidates/${candidateId}`);
    return { status: "sent", message: "Assessment Invitation Sent", url: invitation.assessmentUrl, candidateId };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Could not send the invitation." };
  }
}

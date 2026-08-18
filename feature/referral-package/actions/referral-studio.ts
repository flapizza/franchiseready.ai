"use server";

import { revalidatePath } from "next/cache";
import { CandidateReferralService } from "../services/CandidateReferralService";

export interface ReferralActionState { status: "idle" | "success" | "error"; message?: string; selectedReferralId?: string }
const refresh = (candidateId: string) => { revalidatePath(`/crm/candidates/${candidateId}/referral`); revalidatePath(`/crm/candidates/${candidateId}`); revalidatePath("/crm/candidates"); revalidatePath("/crm"); };

export async function prepareReferrals(_state: ReferralActionState, formData: FormData): Promise<ReferralActionState> {
  const candidateId = String(formData.get("candidateId") ?? "");
  const result = await new CandidateReferralService().prepareRecommended(candidateId, formData.getAll("brandIds").map(String));
  if (result.status !== "success") return { status: "error", message: result.message };
  refresh(candidateId);
  return { status: "success", message: `${result.referrals.length} referral package${result.referrals.length === 1 ? "" : "s"} prepared.`, selectedReferralId: result.referrals[0]?.referralId };
}

export async function prepareOtherBrand(_state: ReferralActionState, formData: FormData): Promise<ReferralActionState> {
  const candidateId = String(formData.get("candidateId") ?? "");
  const result = await new CandidateReferralService().prepareOtherBrand(candidateId, { brandName: String(formData.get("brandName") ?? ""), contactName: String(formData.get("contactName") ?? ""), contactEmail: String(formData.get("contactEmail") ?? "") });
  if (result.status !== "success") return { status: "error", message: result.message };
  refresh(candidateId);
  return { status: "success", message: "Consultant-selected referral prepared.", selectedReferralId: result.referral.referralId };
}

export async function saveReferralDraft(_state: ReferralActionState, formData: FormData): Promise<ReferralActionState> {
  const candidateId = String(formData.get("candidateId") ?? ""); const referralId = String(formData.get("referralId") ?? "");
  const result = await new CandidateReferralService().update(candidateId, referralId, { subject: String(formData.get("subject") ?? ""), introductionMessage: String(formData.get("introductionMessage") ?? ""), consultantNotes: String(formData.get("consultantNotes") ?? "") });
  if (result.status !== "success") return { status: "error", message: result.message };
  refresh(candidateId); return { status: "success", message: "Consultant edits saved.", selectedReferralId: referralId };
}

export async function approveReferral(_state: ReferralActionState, formData: FormData): Promise<ReferralActionState> {
  const candidateId = String(formData.get("candidateId") ?? ""); const referralId = String(formData.get("referralId") ?? "");
  const result = await new CandidateReferralService().approve(candidateId, referralId);
  if (result.status !== "success") return { status: "error", message: result.message };
  refresh(candidateId); return { status: "success", message: "Referral package approved.", selectedReferralId: referralId };
}

export async function introduceCandidate(_state: ReferralActionState, formData: FormData): Promise<ReferralActionState> {
  const candidateId = String(formData.get("candidateId") ?? ""); const referralId = String(formData.get("referralId") ?? "");
  const result = await new CandidateReferralService().introduce(candidateId, referralId);
  if (result.status !== "success") return { status: "error", message: result.message };
  refresh(candidateId); return { status: "success", message: "Introduction recorded. Delivery remains under consultant control.", selectedReferralId: referralId };
}

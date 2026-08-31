"use server";

import { revalidatePath } from "next/cache";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import type { CandidateReferralService } from "../services/CandidateReferralService";

export interface ReferralActionState { status: "idle" | "success" | "error"; message?: string; selectedReferralId?: string }
const refresh = (candidateId: string) => { revalidatePath(`/crm/candidates/${candidateId}/referral`); revalidatePath(`/crm/candidates/${candidateId}`); revalidatePath("/crm/candidates"); revalidatePath("/crm"); };
async function service():Promise<CandidateReferralService|null>{const value=await resolveWorkspaceComposition();return value.status==="resolved"&&"runtimes" in value.composition?value.composition.runtimes.createReferralService():null;}

export async function prepareReferrals(_state: ReferralActionState, formData: FormData): Promise<ReferralActionState> {
  const candidateId = String(formData.get("candidateId") ?? "");
  const active=await service();if(!active)return {status:"error",message:"Referrals are not available in this workspace."};const result = await active.prepareRecommended(candidateId, formData.getAll("brandIds").map(String));
  if (result.status !== "success") return { status: "error", message: result.message };
  refresh(candidateId);
  return { status: "success", message: `${result.referrals.length} referral package${result.referrals.length === 1 ? "" : "s"} prepared.`, selectedReferralId: result.referrals[0]?.referralId };
}

export async function prepareOtherBrand(_state: ReferralActionState, formData: FormData): Promise<ReferralActionState> {
  const candidateId = String(formData.get("candidateId") ?? "");
  const active=await service();if(!active)return {status:"error",message:"Referrals are not available in this workspace."};const result = await active.prepareOtherBrand(candidateId, { brandName: String(formData.get("brandName") ?? ""), contactName: String(formData.get("contactName") ?? ""), contactEmail: String(formData.get("contactEmail") ?? "") });
  if (result.status !== "success") return { status: "error", message: result.message };
  refresh(candidateId);
  return { status: "success", message: "Consultant-selected referral prepared.", selectedReferralId: result.referral.referralId };
}

export async function saveReferralDraft(_state: ReferralActionState, formData: FormData): Promise<ReferralActionState> {
  const candidateId = String(formData.get("candidateId") ?? ""); const referralId = String(formData.get("referralId") ?? "");
  const active=await service();if(!active)return {status:"error",message:"Referrals are not available in this workspace."};const result = await active.update(candidateId, referralId, { subject: String(formData.get("subject") ?? ""), introductionMessage: String(formData.get("introductionMessage") ?? ""), consultantNotes: String(formData.get("consultantNotes") ?? "") });
  if (result.status !== "success") return { status: "error", message: result.message };
  refresh(candidateId); return { status: "success", message: "Consultant edits saved.", selectedReferralId: referralId };
}

export async function saveReportAttachments(_state:ReferralActionState,formData:FormData):Promise<ReferralActionState>{
  const candidateId=String(formData.get("candidateId")??"");const referralId=String(formData.get("referralId")??"");
  const active=await service();if(!active)return {status:"error",message:"Referrals are not available in this workspace."};const result=await active.updateReportAttachments(candidateId,referralId,formData.getAll("reportTypes").map(String));
  if(result.status!=="success")return {status:"error",message:result.message};refresh(candidateId);return {status:"success",message:"Supporting document selections saved.",selectedReferralId:referralId};
}

export async function markHandoffReady(_state: ReferralActionState, formData: FormData): Promise<ReferralActionState> {
  const candidateId = String(formData.get("candidateId") ?? ""); const referralId = String(formData.get("referralId") ?? "");
  const active=await service();if(!active)return {status:"error",message:"Referrals are not available in this workspace."};const result = await active.markHandoffReady(candidateId, referralId);
  if (result.status !== "success") return { status: "error", message: result.message };
  refresh(candidateId); return { status: "success", message: "Candidate Handoff Package marked ready.", selectedReferralId: referralId };
}

export async function refreshHandoffPackage(_state: ReferralActionState, formData: FormData): Promise<ReferralActionState> {
  const candidateId = String(formData.get("candidateId") ?? ""); const referralId = String(formData.get("referralId") ?? "");
  const active=await service();if(!active)return {status:"error",message:"Referrals are not available in this workspace."};const result = await active.refreshHandoff(candidateId, referralId);
  if (result.status !== "success") return { status: "error", message: result.message };
  refresh(candidateId); return { status: "success", message: "Handoff evidence refreshed; consultant edits were preserved.", selectedReferralId: referralId };
}

export async function approveReferral(_state: ReferralActionState, formData: FormData): Promise<ReferralActionState> {
  const candidateId = String(formData.get("candidateId") ?? ""); const referralId = String(formData.get("referralId") ?? "");
  const active=await service();if(!active)return {status:"error",message:"Referrals are not available in this workspace."};const current=active.getOwned(candidateId,referralId);
  if(current?.referralPackage.reportAttachments?.some(item=>item.reportType==="CONSULTANT_INTELLIGENCE_REPORT"&&item.selected&&!item.externalSharingIntent))return {status:"error",message:"Confirm external sharing of the Consultant Intelligence Report before approval."};
  const result = await active.approve(candidateId, referralId);
  if (result.status !== "success") return { status: "error", message: result.message };
  refresh(candidateId);
  return { status: result.referral.delivery?.status === "failed" ? "error" : "success",
    message: result.referral.delivery?.status === "failed" ? `Referral approved, but delivery failed: ${result.referral.delivery.failureReason ?? "Unknown delivery error."}` : "Referral approved. Demo delivery completed; no external system was contacted.", selectedReferralId: referralId };
}

export async function retryReferralDelivery(_state: ReferralActionState, formData: FormData): Promise<ReferralActionState> {
  const candidateId = String(formData.get("candidateId") ?? ""); const referralId = String(formData.get("referralId") ?? "");
  const active=await service();if(!active)return {status:"error",message:"Referrals are not available in this workspace."};const result = await active.retryDelivery(candidateId, referralId);
  if (result.status !== "success") return { status: "error", message: result.message };
  refresh(candidateId);
  return { status: result.referral.delivery?.status === "failed" ? "error" : "success",
    message: result.referral.delivery?.status === "failed" ? `Delivery failed: ${result.referral.delivery.failureReason ?? "Unknown delivery error."}` : "Demo delivery completed; no external system was contacted.", selectedReferralId: referralId };
}

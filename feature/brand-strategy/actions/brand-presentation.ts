"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CandidateBrandReaction } from "../models/StrategyBuilderRecord";
import { CandidateBrandStrategyRuntime } from "../runtime/CandidateBrandStrategyRuntime";
import { StrategyBuilderService } from "../services/StrategyBuilderService";

const reactions = new Set<CandidateBrandReaction>(["strong-interest", "interested", "neutral", "not-interested"]);
const refresh = (candidateId: string) => { revalidatePath(`/crm/candidates/${candidateId}/strategy`); revalidatePath(`/crm/candidates/${candidateId}/strategy/presentation`); revalidatePath(`/crm/candidates/${candidateId}`); revalidatePath("/crm/strategy"); revalidatePath("/crm"); };

export async function startBrandPresentation(formData: FormData) {
  const candidateId = String(formData.get("candidateId") ?? "");
  const state = await new CandidateBrandStrategyRuntime().loadPresentation(candidateId);
  if (!state?.available || state.historical) redirect(`/crm/candidates/${candidateId}/strategy`);
  const result = await new StrategyBuilderService().startPresentation(candidateId);
  if (result.status !== "success") redirect(`/crm/candidates/${candidateId}/strategy`);
  refresh(candidateId);
  redirect(`/crm/candidates/${candidateId}/strategy/presentation?brandId=${encodeURIComponent(state.briefs[0].brandId)}`);
}

export async function advanceBrandPresentation(formData: FormData) {
  const candidateId = String(formData.get("candidateId") ?? "");
  const brandId = String(formData.get("brandId") ?? "");
  const reaction = String(formData.get("reaction") ?? "") as CandidateBrandReaction;
  const nextBrandId = String(formData.get("nextBrandId") ?? "");
  if (!reactions.has(reaction)) redirect(`/crm/candidates/${candidateId}/strategy/presentation?brandId=${encodeURIComponent(brandId)}`);
  const service = new StrategyBuilderService();
  const result = await service.presentBrand(candidateId, brandId, reaction, String(formData.get("notes") ?? ""));
  if (result.status !== "success") redirect(`/crm/candidates/${candidateId}/strategy`);
  refresh(candidateId);
  if (nextBrandId) redirect(`/crm/candidates/${candidateId}/strategy/presentation?brandId=${encodeURIComponent(nextBrandId)}`);
  await service.completePresentation(candidateId);
  refresh(candidateId);
  redirect(`/crm/candidates/${candidateId}/strategy/presentation?summary=1`);
}

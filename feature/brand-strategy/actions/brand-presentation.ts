"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CandidateBrandReaction } from "../models/StrategyBuilderRecord";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";

const reactions = new Set<CandidateBrandReaction>(["strong-interest", "interested", "neutral", "not-interested"]);
const refresh = (candidateId: string) => { revalidatePath(`/crm/candidates/${candidateId}/strategy`); revalidatePath(`/crm/candidates/${candidateId}/strategy/presentation`); revalidatePath(`/crm/candidates/${candidateId}`); revalidatePath("/crm/strategy"); revalidatePath("/crm"); };

export async function startBrandPresentation(formData: FormData) {
  const candidateId = String(formData.get("candidateId") ?? "");
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved" || !("runtimes" in resolution.composition))redirect(`/crm/candidates/${candidateId}/strategy`);
  const state = await resolution.composition.runtimes.createBrandStrategy().loadPresentation(candidateId);
  if (!state?.available || state.historical) redirect(`/crm/candidates/${candidateId}/strategy`);
  const result = await resolution.composition.runtimes.createStrategyBuilder().startPresentation(candidateId);
  if (result.status !== "success") redirect(`/crm/candidates/${candidateId}/strategy`);
  refresh(candidateId);
  redirect(`/crm/candidates/${candidateId}/strategy/presentation?brandId=${encodeURIComponent(state.briefs[0].brandId)}`);
}

export async function advanceBrandPresentation(formData: FormData) {
  const candidateId = String(formData.get("candidateId") ?? "");
  const brandId = String(formData.get("brandId") ?? "");
  const reaction = String(formData.get("reaction") ?? "") as CandidateBrandReaction;
  const nextBrandId = String(formData.get("nextBrandId") ?? "");
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved" || !("runtimes" in resolution.composition))redirect(`/crm/candidates/${candidateId}/strategy`);
  if (!reactions.has(reaction)) redirect(`/crm/candidates/${candidateId}/strategy/presentation?brandId=${encodeURIComponent(brandId)}`);
  const service = resolution.composition.runtimes.createStrategyBuilder();
  const result = await service.presentBrand(candidateId, brandId, reaction, String(formData.get("notes") ?? ""));
  if (result.status !== "success") redirect(`/crm/candidates/${candidateId}/strategy`);
  refresh(candidateId);
  if (nextBrandId) redirect(`/crm/candidates/${candidateId}/strategy/presentation?brandId=${encodeURIComponent(nextBrandId)}`);
  await service.completePresentation(candidateId);
  refresh(candidateId);
  redirect(`/crm/candidates/${candidateId}/strategy/presentation?summary=1`);
}

"use server";

import { revalidatePath } from "next/cache";
import type { BrandShortlistDisposition, CandidateBrandReaction } from "../models/StrategyBuilderRecord";
import type { StrategyBuilderCommand } from "../services/StrategyBuilderService";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";

export interface StrategyActionState { status: "idle" | "success" | "error"; message?: string }
const reactions = new Set<CandidateBrandReaction>(["strong-interest", "interested", "neutral", "not-interested"]);
const dispositions = new Set<BrandShortlistDisposition>(["refer", "continue-research", "hold", "remove"]);

export async function updateStrategyBuilder(_previous: StrategyActionState, formData: FormData): Promise<StrategyActionState> {
  const candidateId = String(formData.get("candidateId") ?? "");
  const brandId = String(formData.get("brandId") ?? "");
  const kind = String(formData.get("kind") ?? "");
  let command: StrategyBuilderCommand | null = null;
  if (kind === "toggle-presentation") command = { kind, brandId };
  if (kind === "move" && ["up", "down"].includes(String(formData.get("direction")))) command = { kind, brandId, direction: String(formData.get("direction")) as "up" | "down" };
  if (kind === "response" && reactions.has(String(formData.get("reaction")) as CandidateBrandReaction)) command = { kind, brandId, reaction: String(formData.get("reaction")) as CandidateBrandReaction, notes: String(formData.get("notes") ?? "") };
  if (kind === "disposition" && dispositions.has(String(formData.get("disposition")) as BrandShortlistDisposition)) command = { kind, brandId, disposition: String(formData.get("disposition")) as BrandShortlistDisposition };
  if (!candidateId || !brandId || !command) return { status: "error", message: "Invalid Strategy Builder request." };
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved" || !("runtimes" in resolution.composition))return {status:"error",message:"Brand Strategy is not available in this workspace."};
  const result = await resolution.composition.runtimes.createStrategyBuilder().execute(candidateId, command);
  revalidatePath(`/crm/candidates/${candidateId}/strategy`);
  revalidatePath(`/crm/candidates/${candidateId}`);
  revalidatePath(`/crm/candidates/${candidateId}/referral`);
  revalidatePath("/crm/strategy"); revalidatePath("/crm");
  return { status: result.status === "success" ? "success" : "error", message: result.message };
}

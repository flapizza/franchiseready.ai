"use server";

import { revalidatePath } from "next/cache";
import { getConferenceDemoUser } from "@/lib/auth/demo-session";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { DemoCandidateActivityRepository } from "@/feature/crm/repositories/DemoCandidateActivityRepository";
import { DemoConsultantPipelineRepository } from "../repositories/DemoConsultantPipelineRepository";
import { PipelineConfigurationError, PipelineConfigurationService } from "../services/PipelineConfigurationService";
import { CandidatePipelineStageService } from "../services/CandidatePipelineStageService";
import type { ConsultantPipelineConfiguration } from "../models/ConsultantPipeline";

export interface PipelineActionState { status: "idle" | "success" | "error"; message?: string }
const refresh = () => { revalidatePath("/settings/pipeline"); revalidatePath("/crm/candidates"); revalidatePath("/crm"); };
async function authorized() { return Boolean(await getConferenceDemoUser()); }

export async function savePipelineAction(_previous: PipelineActionState, formData: FormData): Promise<PipelineActionState> {
  if (!(await authorized())) return { status: "error", message: "Your session has expired." };
  try {
    const configuration = JSON.parse(String(formData.get("configuration") ?? "")) as ConsultantPipelineConfiguration;
    if (configuration.consultantId !== demoConsultant.id) return { status: "error", message: "Invalid pipeline owner." };
    await new PipelineConfigurationService(new DemoConsultantPipelineRepository(), new SeedCandidateRepository()).save(configuration);
    refresh(); return { status: "success", message: "Pipeline changes saved." };
  } catch (error) { return { status: "error", message: error instanceof PipelineConfigurationError ? error.message : "Review the pipeline configuration and try again." }; }
}

export async function resetPipelineAction(): Promise<PipelineActionState> {
  if (!(await authorized())) return { status: "error", message: "Your session has expired." };
  await new PipelineConfigurationService(new DemoConsultantPipelineRepository(), new SeedCandidateRepository()).reset(demoConsultant.id);
  refresh(); return { status: "success", message: "Recommended pipeline restored. Candidate history was preserved." };
}

export async function moveCandidateStageAction(_previous: PipelineActionState, formData: FormData): Promise<PipelineActionState> {
  const candidateId = String(formData.get("candidateId") ?? "");
  const stageId = String(formData.get("stageId") ?? "");
  return moveCandidateStage(candidateId, stageId);
}

/** Direct client-callable variant used by the pipeline board. Both entry
 * points retain the same authenticated service-owned mutation path. */
export async function moveCandidateStage(candidateId: string, stageId: string): Promise<PipelineActionState> {
  if (!(await authorized())) return { status: "error", message: "Your session has expired." };
  const result = await new CandidatePipelineStageService(new DemoConsultantPipelineRepository(), new SeedCandidateRepository(), new DemoCandidateActivityRepository()).move(candidateId, stageId);
  if (result.status !== "success") return { status: "error", message: "The candidate could not be moved to that stage." };
  refresh(); revalidatePath(`/crm/candidates/${candidateId}`); return { status: "success", message: "Candidate stage updated." };
}

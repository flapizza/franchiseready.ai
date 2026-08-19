import type { ConsultantPipelineConfiguration, ConsultantPipelineStage } from "../models/ConsultantPipeline";

export const DEMO_PIPELINE_ID = "pipeline-conference-default";
export const DEFAULT_PIPELINE_UPDATED_AT = "2026-08-17T13:00:00.000Z";

const definitions: Array<Omit<ConsultantPipelineStage, "pipelineId" | "order" | "enabled" | "source">> = [
  { stageId: "stage-new", displayName: "New Candidate", canonicalLifecycleStage: "lead", classification: "active", legacyLifecycleStage: "lead", colorToken: "slate" },
  { stageId: "stage-assessment-pending", displayName: "Assessment Pending", canonicalLifecycleStage: "assessment", classification: "active", legacyLifecycleStage: "assessment-started", colorToken: "teal" },
  { stageId: "stage-assessment-complete", displayName: "Assessment Complete", canonicalLifecycleStage: "assessment", classification: "active", legacyLifecycleStage: "assessment-completed", colorToken: "teal" },
  { stageId: "stage-discovery", displayName: "Discovery", canonicalLifecycleStage: "discovery", classification: "active", legacyLifecycleStage: "discovery", colorToken: "blue" },
  { stageId: "stage-brand-strategy", displayName: "Brand Strategy", canonicalLifecycleStage: "brand-strategy", classification: "active", legacyLifecycleStage: "brand-matching", colorToken: "indigo" },
  { stageId: "stage-validation", displayName: "Validation", canonicalLifecycleStage: "validation", classification: "active", legacyLifecycleStage: "validation", colorToken: "amber" },
  { stageId: "stage-referral", displayName: "Referral / Introduction", canonicalLifecycleStage: "referral", classification: "active", legacyLifecycleStage: "referral", colorToken: "emerald" },
  { stageId: "stage-franchisor-discovery", displayName: "Franchisor Discovery", canonicalLifecycleStage: "franchisor-process", classification: "active", legacyLifecycleStage: "meet-the-team", colorToken: "blue" },
  { stageId: "stage-decision", displayName: "Decision", canonicalLifecycleStage: "decision", classification: "active", legacyLifecycleStage: "fdd-delivered", colorToken: "amber" },
  { stageId: "stage-awarded", displayName: "Awarded", canonicalLifecycleStage: "awarded", classification: "won", legacyLifecycleStage: "awarded", colorToken: "emerald" },
  { stageId: "stage-closed-lost", displayName: "Closed / Lost", canonicalLifecycleStage: "closed", classification: "lost", legacyLifecycleStage: "closed-lost", colorToken: "slate" },
];

export function createRecommendedPipeline(consultantId: string): ConsultantPipelineConfiguration {
  return { pipelineId: DEMO_PIPELINE_ID, consultantId, name: "Candidate Pipeline", updatedAt: DEFAULT_PIPELINE_UPDATED_AT,
    stages: definitions.map((stage, order) => ({ ...stage, pipelineId: DEMO_PIPELINE_ID, order, enabled: true, source: "system-suggested" })) };
}

export function defaultStageIdForLegacy(stage: ConsultantPipelineStage["legacyLifecycleStage"]): string {
  return definitions.find((item) => item.legacyLifecycleStage === stage)?.stageId ?? "stage-new";
}

import type { CanonicalLifecycleStage, PipelineStage } from "@/feature/crm/models/CandidateRecord";

export type PipelineStageClassification = "active" | "won" | "lost" | "archived";

export interface ConsultantPipelineStage {
  stageId: string;
  pipelineId: string;
  displayName: string;
  order: number;
  enabled: boolean;
  canonicalLifecycleStage: CanonicalLifecycleStage;
  classification: PipelineStageClassification;
  description?: string;
  colorToken?: "slate" | "teal" | "blue" | "indigo" | "amber" | "emerald";
  source: "system-suggested" | "custom";
  /** Adapter for the existing detailed lifecycle transition engine. */
  legacyLifecycleStage?: PipelineStage;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConsultantPipelineConfiguration {
  pipelineId: string;
  consultantId: string;
  name: string;
  stages: ConsultantPipelineStage[];
  updatedAt: string;
}

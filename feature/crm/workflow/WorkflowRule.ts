import type { PipelineStage } from "../models/CandidateRecord";
import type { WorkflowAction } from "./WorkflowAction";

export interface WorkflowRule {
  stage: PipelineStage;

  actions: WorkflowAction[];
}
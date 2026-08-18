import type { PipelineStage } from "@/feature/crm/models/CandidateRecord";
import type { Evidence } from "@/feature/evidence/models/Evidence";

export type DiscoveryWorkflowPhase = "pre-meeting" | "live" | "post-meeting";
export type DiscoveryObjectiveStatus = "validated" | "partial" | "needs-validation" | "unknown";

export interface DiscoveryObjectiveState {
  id: string;
  label: string;
  status: DiscoveryObjectiveStatus;
  evidenceSummary: string;
  priority: "high" | "medium" | "low";
  sources: Evidence["source"][];
}

export interface DiscoveryQuestionState {
  id: string;
  question: string;
  reason: string;
  objectiveId: string;
  priority: DiscoveryObjectiveState["priority"];
  source: "objective-gap" | "candidate-intelligence";
}

export interface DiscoveryExperienceState {
  phase: DiscoveryWorkflowPhase;
  historical: boolean;
  candidate: { id: string; name: string; stage: PipelineStage; stageLabel: string; readiness: number; buyingConfidence: number; momentum: string; financialContext: string };
  summary: string;
  strengths: string[];
  objectives: DiscoveryObjectiveState[];
  primaryQuestion: DiscoveryQuestionState;
  secondaryQuestions: DiscoveryQuestionState[];
  buyingSignals: Array<{ label: string; reason: string; confidence: number }>;
  risks: Array<{ label: string; reason: string; confidence: number; severity: "concern" | "critical" }>;
  recentActivity: Array<{ title: string; detail: string; occurredAt: string }>;
  notes: string;
  changes: Array<{ label: string; before: string; after: string }>;
  completion: { outcome: "continue-discovery" | "validation-required" | "ready-for-brand-strategy"; heading: string; explanation: string; actionLabel: string };
}

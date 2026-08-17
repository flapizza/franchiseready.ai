import type { CandidateCRMItem } from "../models/CandidateCRMState";
import type { CandidateWorkspaceKind, CandidateWorkspaceQueueState } from "../models/CandidateWorkspaceQueueState";
import { CandidateCRMRuntime } from "./CandidateCRMRuntime";

const presentation = {
  discovery: {
    eyebrow: "Discovery Copilot",
    title: "Discovery work queue",
    description: "Choose a candidate to continue evidence-based Discovery in their canonical workspace.",
    emptyMessage: "No candidates currently require Discovery.",
  },
  strategy: {
    eyebrow: "AI Workspace",
    title: "Brand Strategy",
    description: "Review candidates whose lifecycle and intelligence support brand evaluation.",
    emptyMessage: "No candidates are currently ready for Brand Strategy.",
  },
  referral: {
    eyebrow: "Consultant Workspace",
    title: "Referral Studio",
    description: "Continue referral preparation, approval, and consultant-controlled introductions.",
    emptyMessage: "No candidates are currently ready for Referral Studio.",
  },
} as const;

function isRelevant(kind: CandidateWorkspaceKind, candidate: CandidateCRMItem) {
  if (kind === "discovery") return ["assessment-completed", "discovery", "validation"].includes(candidate.pipelineStage);
  if (kind === "strategy") return ["brand-matching", "validation", "referral", "awarded"].includes(candidate.pipelineStage);
  return candidate.pipelineStage === "referral" || candidate.referralReady;
}

function destination(kind: CandidateWorkspaceKind, candidate: CandidateCRMItem) {
  if (kind === "discovery") return `/crm/${candidate.id}/discovery`;
  if (kind === "strategy") return `/crm/candidates/${candidate.id}/strategy`;
  return `/crm/candidates/${candidate.id}/referral`;
}

export class CandidateWorkspaceQueueRuntime {
  public constructor(private readonly crm = new CandidateCRMRuntime()) {}

  public async load(kind: CandidateWorkspaceKind): Promise<CandidateWorkspaceQueueState> {
    const crm = await this.crm.load();
    const copy = presentation[kind];
    return {
      ...copy,
      candidates: crm.candidates.filter((candidate) => isRelevant(kind, candidate)).map((candidate) => ({
        id: candidate.id,
        name: candidate.fullName,
        initials: candidate.initials,
        location: candidate.location || candidate.email,
        stageLabel: candidate.stageLabel,
        readinessLabel: candidate.readinessLabel,
        attentionLabel: candidate.attentionLabel,
        summary: candidate.nextAction,
        actionLabel: kind === "discovery" ? "Open Discovery" : kind === "strategy" ? "Review Strategy" : "Open Referral Studio",
        href: destination(kind, candidate),
      })),
    };
  }
}

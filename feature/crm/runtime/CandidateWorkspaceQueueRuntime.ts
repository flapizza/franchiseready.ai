import type { CandidateCRMItem } from "../models/CandidateCRMState";
import type { CandidateWorkspaceKind, CandidateWorkspaceQueueState } from "../models/CandidateWorkspaceQueueState";
import { CandidateCRMRuntime } from "./CandidateCRMRuntime";
import { CandidateWorkspaceEligibilityService } from "../services/CandidateWorkspaceEligibilityService";
import type { CandidateWorkspaceView } from "../models/CandidateWorkspaceQueueState";
import { demoCandidateOverlayStore } from "../repositories/DemoCandidateOverlayStore";

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

function destination(kind: CandidateWorkspaceKind, candidate: CandidateCRMItem) {
  if (kind === "discovery") return `/crm/${candidate.id}/discovery`;
  if (kind === "strategy") return `/crm/candidates/${candidate.id}/strategy`;
  return candidate.actionHref.includes(`/crm/candidates/${candidate.id}/referral`) ? candidate.actionHref : `/crm/candidates/${candidate.id}/referral`;
}

export class CandidateWorkspaceQueueRuntime {
  public constructor(private readonly crm = new CandidateCRMRuntime(), private readonly eligibility = new CandidateWorkspaceEligibilityService()) {}

  public async load(kind: CandidateWorkspaceKind, view: CandidateWorkspaceView = "active"): Promise<CandidateWorkspaceQueueState> {
    const crm = await this.crm.load();
    const copy = presentation[kind];
    return {
      ...copy,
      activeView: view,
      candidates: crm.candidates.filter((candidate) => this.eligibility.isEligible({ pipelineStage: candidate.lifecycleStage }, kind, view)).map((candidate) => ({
        id: candidate.id,
        name: candidate.fullName,
        initials: candidate.initials,
        location: candidate.location || candidate.email,
        stageLabel: candidate.stageLabel,
        readinessLabel: candidate.readinessLabel,
        attentionLabel: candidate.attentionLabel,
        summary: kind === "strategy" ? this.strategySummary(candidate.id, view === "completed") : candidate.nextAction,
        actionLabel: view === "completed" ? (kind === "discovery" ? "Review Discovery" : kind === "strategy" ? "Review Strategy" : "View Referral History") : kind === "discovery" ? "Open Discovery" : kind === "strategy" ? "Review Strategy" : candidate.actionHref.includes("referralId=") ? "Review Package" : "Open Referral Studio",
        href: destination(kind, candidate),
        candidateHref: candidate.href,
      })),
    };
  }

  private strategySummary(candidateId: string, historical: boolean) {
    if (historical) return "Historical Strategy · presentation and referral decisions retained";
    const strategy = demoCandidateOverlayStore.getStrategy(candidateId);
    const selected = strategy?.decisions.filter((item) => item.selectedForPresentation) ?? [];
    if (!selected.length) return "Build Presentation Set";
    const presented = selected.filter((item) => item.presentedAt).length;
    if (!presented) return "Ready to Present";
    if (presented < selected.length) return `Presentation In Progress · ${presented}/${selected.length} presented`;
    if (!selected.some((item) => item.shortlistDisposition)) return "Review Candidate Reactions · finalize shortlist";
    return selected.some((item) => item.shortlistDisposition === "refer") ? "Ready for Referral" : "Candidate Discussion";
  }
}

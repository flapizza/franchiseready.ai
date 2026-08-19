import type { CandidateRecord, PipelineStage } from "../models/CandidateRecord";

export type CandidateWorkspace = "discovery" | "strategy" | "referral";
export type CandidateWorkspaceView = "active" | "completed" | "all";

const activeStages: Record<CandidateWorkspace, readonly PipelineStage[]> = {
  discovery: ["assessment-completed", "discovery", "validation"],
  strategy: ["validation", "brand-matching"],
  referral: ["referral"],
};

const completedStages: Record<CandidateWorkspace, readonly PipelineStage[]> = {
  discovery: ["brand-matching", "referral", "awarded"],
  strategy: ["referral", "awarded"],
  referral: ["awarded"],
};

/** A read-only policy over the canonical lifecycle; it never moves candidates. */
export class CandidateWorkspaceEligibilityService {
  isActive(candidate: Pick<CandidateRecord, "pipelineStage">, workspace: CandidateWorkspace): boolean {
    return activeStages[workspace].includes(candidate.pipelineStage);
  }

  isHistoricallyAvailable(candidate: Pick<CandidateRecord, "pipelineStage">, workspace: CandidateWorkspace): boolean {
    return completedStages[workspace].includes(candidate.pipelineStage);
  }

  isEligible(candidate: Pick<CandidateRecord, "pipelineStage">, workspace: CandidateWorkspace, view: CandidateWorkspaceView): boolean {
    return view === "all"
      ? true
      : view === "active"
        ? this.isActive(candidate, workspace)
        : this.isHistoricallyAvailable(candidate, workspace);
  }
}

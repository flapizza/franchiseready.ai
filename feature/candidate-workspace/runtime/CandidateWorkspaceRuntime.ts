import type { CandidateWorkspaceState } from "../models/CandidateWorkspaceState";

export class CandidateWorkspaceRuntime {
  public build(_candidateId: string): CandidateWorkspaceState {
    throw new Error(
      "CandidateWorkspaceRuntime has not been connected to the Discovery runtime yet.",
    );
  }
}
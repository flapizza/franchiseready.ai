import type { CandidateRecord } from "../models/CandidateRecord";
import type { CandidateAction } from "../models/CandidateAction";

import { CandidateActionService } from "./CandidateActionService";

export interface CandidateWorkspaceActions {
  primary: CandidateAction | null;
  secondary: CandidateAction[];
}

export class CandidateWorkspaceActionService {
  private readonly actionService =
    new CandidateActionService();

  build(
    candidate: CandidateRecord,
  ): CandidateWorkspaceActions {
    const actions =
      this.actionService.build(candidate);

    return {
      primary: actions[0] ?? null,
      secondary: actions.slice(1),
    };
  }
}
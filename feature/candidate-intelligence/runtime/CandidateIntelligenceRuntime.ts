import type { CandidateIntelligence } from "../models/CandidateIntelligence";

import type { MeetingAnalysis } from "@/feature/meeting-intelligence/models/MeetingAnalysis";

import { IntelligenceMergeService } from "../services/IntelligenceMergeService";

export class CandidateIntelligenceRuntime {
  private readonly mergeService =
    new IntelligenceMergeService();

  public update(
    current: CandidateIntelligence,
    meeting: MeetingAnalysis,
  ): CandidateIntelligence {
    return this.mergeService.merge(
      current,
      meeting,
    );
  }
}
import type { CandidateIntelligence } from "../models/CandidateIntelligence";

import type { MeetingAnalysis } from "@/feature/meeting-intelligence/models/MeetingAnalysis";

export class IntelligenceMergeService {
  public merge(
    current: CandidateIntelligence,
    analysis: MeetingAnalysis,
  ): CandidateIntelligence {
    return {
      ...current,

      confidence: Math.max(
        current.confidence,
        analysis.confidence,
      ),

      executiveSummary: analysis.summary,
    };
  }
}
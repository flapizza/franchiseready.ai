import { CandidateDecisionEngine } from "@/feature/decision-engine/runtime/CandidateDecisionEngine";
import { MeetingIntelligenceRuntime } from "@/feature/meeting-intelligence/runtime/MeetingIntelligenceRuntime";

import type { CandidateDecision } from "@/feature/decision-engine/models/CandidateDecision";
import type { MeetingTranscript } from "@/feature/meeting-intelligence/models/MeetingTranscript";

export interface CandidateWorkspaceViewModel {
  decision: CandidateDecision;

  readiness: number;

  health: number;

  decisionWindow: string;

  investmentRange: string;

  executiveSummary: string;
}

type Candidate = {
  healthScore: number;

  intelligence: {
    overallReadiness: number;

    executiveSummary: string;

    timing: {
      decisionWindow: string;
    };

    financial: {
      financingLikelihood: number;

      investmentRange: string;
    };
  };
};

export class CandidateWorkspaceRuntime {
  private readonly meetingRuntime =
    new MeetingIntelligenceRuntime();

  private readonly decisionRuntime =
    new CandidateDecisionEngine();

  public build(
    candidate: Candidate,
  ): CandidateWorkspaceViewModel {
    const transcript: MeetingTranscript = {
      entries: [],
    };

    const analysis =
      this.meetingRuntime.analyze(
        transcript,
      );

    const decision =
      this.decisionRuntime.evaluate({
        readiness:
          candidate.intelligence
            .overallReadiness,

        confidence:
          analysis.confidence,

        buyingSignals:
          analysis.buyingSignals.map(
            (signal) => signal.title,
          ),

        risks:
          analysis.risks.map(
            (risk) => risk.title,
          ),

        executiveSummary:
          analysis.summary,
      });

    return {
      decision,

      readiness:
        candidate.intelligence
          .overallReadiness,

      health:
        candidate.healthScore,

      decisionWindow:
        candidate.intelligence
          .timing
          .decisionWindow,

      investmentRange:
        candidate.intelligence
          .financial
          .investmentRange,

      executiveSummary:
        analysis.summary,
    };
  }
}
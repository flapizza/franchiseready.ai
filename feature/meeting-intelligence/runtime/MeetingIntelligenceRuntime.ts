import type { MeetingAnalysis } from "../models/MeetingAnalysis";
import type { MeetingTranscript } from "../models/MeetingTranscript";

import { BuyingSignalService } from "../services/BuyingSignalService";
import { MeetingSummaryService } from "../services/MeetingSummaryService";
import { RiskService } from "../services/RiskService";

export class MeetingIntelligenceRuntime {
  private readonly summaryService =
    new MeetingSummaryService();

  private readonly buyingSignalService =
    new BuyingSignalService();

  private readonly riskService =
    new RiskService();

  public analyze(
    transcript: MeetingTranscript,
  ): MeetingAnalysis {
    const buyingSignals =
      this.buyingSignalService.evaluate(
        transcript,
      );

    const risks =
      this.riskService.evaluate(
        transcript,
      );

    return {
      summary:
        this.summaryService.summarize(
          transcript,
        ),

      confidence: 92,

      buyingSignals,

      risks,

      actionItems: [
        "Validate family alignment.",
        "Confirm desired ownership timeline.",
      ],

      openQuestions: [
        "How involved does the candidate want to be in day-to-day operations?",
        "What role will the spouse or family play in the decision?",
      ],

      keyMoments: [
        "Candidate described leading a multi-state operation.",
        "Candidate expressed a strong desire for business ownership.",
      ],

      sentiment: 87,
    };
  }
}
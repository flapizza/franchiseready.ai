import type { BuyingSignal } from "@/feature/discovery-copilot/models/BuyingSignal";

import type { MeetingTranscript } from "../models/MeetingTranscript";

export class BuyingSignalService {
  public evaluate(
    transcript: MeetingTranscript,
  ): BuyingSignal[] {
    return [
      {
        id: "ownership",

        title: "Ownership Motivation",

        explanation:
          "Candidate expressed a desire to build something personally meaningful.",

        strength: "high",

        confidence: 94,
      },
    ];
  }
}
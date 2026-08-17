import type { MeetingRisk } from "@/feature/discovery-copilot/models/MeetingRisk";

import type { MeetingTranscript } from "../models/MeetingTranscript";

export class RiskService {
  public evaluate(
    transcript: MeetingTranscript,
  ): MeetingRisk[] {
    const meetingText = transcript.entries
      .map((entry) => entry.text)
      .join(" ")
      .toLowerCase();

    const familyDiscussed =
      meetingText.includes("family") ||
      meetingText.includes("spouse");

    return [
      {
        id: "family",

        title: "Family Alignment",

        explanation:
          "The meeting did not establish whether family members support the ownership decision.",

        severity: "medium",

        confidence: familyDiscussed ? 64 : 82,
      },
    ];
  }
}

import type {
  MissionControlState,
  PriorityItem,
  TodayMeeting,
} from "../models/MissionControlState";

export class MissionControlRuntime {
  public build(): MissionControlState {
    const priorities: PriorityItem[] = [
      {
        id: "1",

        title: "Mike Lavalle",

        description:
          "Buying momentum has slowed. AI recommends a Discovery follow-up today.",

        priority: "critical",

        action: "Schedule Follow-up",
      },

      {
        id: "2",

        title: "Jared Wirsig",

        description:
          "Discovery is complete. Candidate is ready for Brand Strategy.",

        priority: "high",

        action: "Generate Referral Package",
      },

      {
        id: "3",

        title: "Christine Williams",

        description:
          "Family alignment has not yet been validated.",

        priority: "normal",

        action: "Prepare Next Meeting",
      },
    ];

    const discoveryToday: TodayMeeting[] = [
      {
        id: "1",

        candidate: "Mike Lavalle",

        time: "2:00 PM",

        focus:
          "Validate ownership motivation and decision timeline.",
      },

      {
        id: "2",

        candidate: "Christine Williams",

        time: "3:30 PM",

        focus:
          "Discuss spouse alignment and financial expectations.",
      },
    ];

    return {
      greeting: "Good Afternoon",

      consultant: "Jim",

      activeCandidates: 147,

      discoveryToday,

      priorities,
    };
  }
}
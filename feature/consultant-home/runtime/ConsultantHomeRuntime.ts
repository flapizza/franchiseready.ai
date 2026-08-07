import type {
  ConsultantHomeState,
} from "../models/ConsultantHomeState";

export class ConsultantHomeRuntime {
  public build(): ConsultantHomeState {
    return {
      greeting: "Good Morning",

      activeCandidates: 18,

      priorityCandidates: [
        {
          id: "1",

          name: "John Smith",

          priority: "critical",

          reason:
            "Buying confidence decreased during the last Discovery session.",

          recommendedAction:
            "Schedule a follow-up call within 24 hours.",
        },

        {
          id: "2",

          name: "Sarah Williams",

          priority: "high",

          reason:
            "AI confidence reached 97%.",

          recommendedAction:
            "Move into Brand Matching.",
        },
      ],

      meetings: [
        {
          id: "1",

          candidateName:
            "Chris Miller",

          time: "10:00 AM",

          aiFocus:
            "Validate family alignment.",
        },
      ],

      referralPackagesReady: 2,

      weeklyInsight:
        "Average buying confidence increased 14% this week.",
    };
  }
}
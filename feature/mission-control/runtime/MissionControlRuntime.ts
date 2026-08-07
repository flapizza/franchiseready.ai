import type {
  MissionControlState,
} from "../models/MissionControlState";

export class MissionControlRuntime {
  public build(): MissionControlState {
    return {
      greeting: "Good Morning",

      consultant: "Jim",

      activeCandidates: 18,

      discoveryToday: [
        {
          id: "1",

          candidate: "John Smith",

          time: "10:00 AM",

          focus:
            "Validate family alignment.",
        },

        {
          id: "2",

          candidate: "Sarah Williams",

          time: "2:00 PM",

          focus:
            "Present Brand Strategy.",
        },
      ],

      priorities: [
        {
          id: "1",

          priority: "critical",

          title:
            "Buying confidence dropped",

          description:
            "John Smith's buying confidence decreased 8% after the previous Discovery session.",

          action:
            "Schedule follow-up today.",
        },

        {
          id: "2",

          priority: "high",

          title:
            "Ready for Brand Matching",

          description:
            "Sarah Williams reached AI confidence of 97%.",

          action:
            "Prepare Candidate Introduction.",
        },
      ],
    };
  }
}
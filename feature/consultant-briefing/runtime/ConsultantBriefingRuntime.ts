import type {
  ConsultantBriefing,
} from "../models/ConsultantBriefing";

export class ConsultantBriefingRuntime {
  public build(): ConsultantBriefing {
    return {
      candidateName: "John Smith",

      aiConfidence: 96,

      discoveryStage: "Discovery",

      meetingObjective:
        "Validate family alignment before presenting recommended brands.",

      discussionTopics: [
        "Why franchise ownership now?",
        "Exit timeline",
        "Family support",
        "Hiring experience",
      ],

      buyingSignals: [
        "Executive ownership motivation",
        "Recurring revenue preference",
        "Long-term wealth creation",
      ],

      watchFor: [
        "Decision hesitation",
        "Family alignment",
        "Investment expectations",
      ],

      suggestedClosing:
        "If today's conversation confirms family alignment, introduce the candidate to the top recommended brands and schedule the Brand Strategy meeting.",

      nextBestAction:
        "Proceed to Brand Strategy",
    };
  }
}
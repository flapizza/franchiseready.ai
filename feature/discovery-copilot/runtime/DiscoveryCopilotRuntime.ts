import type { DiscoveryCopilotState } from "../models/DiscoveryCopilotState";

export class DiscoveryCopilotRuntime {
  public build(): DiscoveryCopilotState {
    return {
      confidence: 94,

      conversationMomentum: 88,

      buyingSignals: [
        {
          id: "signal-1",
          title: "Executive Leadership",
          explanation:
            "Candidate described leading regional operations and large teams.",
          strength: "high",
          confidence: 96,
        },
        {
          id: "signal-2",
          title: "Ownership Motivation",
          explanation:
            "Candidate expressed a strong desire to build something of their own.",
          strength: "high",
          confidence: 94,
        },
        {
          id: "signal-3",
          title: "Lifestyle Goals",
          explanation:
            "Candidate is seeking greater control over long-term career direction.",
          strength: "medium",
          confidence: 83,
        },
      ],

      risks: [
        {
          id: "risk-1",
          title: "Family Alignment",
          explanation:
            "The conversation has not yet explored family support for franchise ownership.",
          severity: "medium",
          confidence: 81,
        },
        {
          id: "risk-2",
          title: "Decision Timeline",
          explanation:
            "The candidate has not committed to a target investment timeline.",
          severity: "low",
          confidence: 72,
        },
      ],

      insights: [
        {
          id: "insight-1",
          title: "Leadership Evidence",
          summary:
            "Executive leadership experience appears to translate well to franchise ownership.",
          confidence: 95,
        },
        {
          id: "insight-2",
          title: "Ownership Motivation",
          summary:
            "The candidate consistently describes intrinsic reasons for business ownership rather than focusing solely on financial outcomes.",
          confidence: 91,
        },
      ],

      suggestedQuestion: {
        id: "question-1",
        category: "Discovery",

        question:
          "How does your family feel about your interest in business ownership?",

        reason:
          "Family alignment has not yet been validated and represents the largest remaining unknown.",

        confidence: 93,
      },

      recommendedTopic:
        "Validate family alignment before moving into specific brand discussions.",
    };
  }
}
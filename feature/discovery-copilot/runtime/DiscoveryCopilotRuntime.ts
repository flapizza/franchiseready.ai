import type {
  DiscoveryCopilotState,
} from "../models/DiscoveryCopilotState";

export class DiscoveryCopilotRuntime {
  public build(): DiscoveryCopilotState {
    return {
      candidate: "John Smith",

      transcript: [
        {
          id: "1",
          speaker: "candidate",
          timestamp: "10:02",
          text:
            "I've spent the last twenty years leading regional operations.",
        },
        {
          id: "2",
          speaker: "consultant",
          timestamp: "10:03",
          text:
            "What made you begin exploring franchise ownership?",
        },
        {
          id: "3",
          speaker: "candidate",
          timestamp: "10:04",
          text:
            "I want to build something of my own while using my leadership experience.",
        },
      ],

      insights: [
        {
          id: "1",
          title: "Leadership Evidence",
          description:
            "Executive leadership experience detected.",
          severity: "success",
        },
        {
          id: "2",
          title: "Buying Signal",
          description:
            "Candidate expressed strong ownership motivation.",
          severity: "success",
        },
        {
          id: "3",
          title: "Discovery Opportunity",
          description:
            "Family alignment has not yet been discussed.",
          severity: "warning",
        },
      ],

      buyingSignals: [
        "Interested in executive ownership",
        "Plans to leave corporate America",
        "Looking for recurring revenue",
        "Long-term wealth creation",
      ],

      risks: [
        "Family alignment not confirmed",
        "Investment timeline needs validation",
      ],

      liveFeed: [
        {
          id: "1",
          timestamp: "10:04",
          category: "leadership",
          title: "Leadership Evidence Detected",
          description:
            "Candidate described managing more than 300 employees.",
          impact: "Leadership Confidence +4%",
        },
        {
          id: "2",
          timestamp: "10:06",
          category: "buying",
          title: "Buying Signal",
          description:
            "Candidate expressed desire to leave corporate America.",
          impact: "Buying Confidence +6%",
        },
        {
          id: "3",
          timestamp: "10:08",
          category: "risk",
          title: "Discovery Opportunity",
          description:
            "Family alignment has not been discussed.",
          impact: "Discovery Priority Added",
        },
        {
          id: "4",
          timestamp: "10:10",
          category: "brand",
          title: "Brand Match Updated",
          description:
            "Executive consulting brands increased in confidence.",
          impact: "ERA Group +2%",
        },
      ],

      suggestedQuestions: [
        {
          id: "1",
          question:
            "Tell me about the culture you intentionally built as a leader.",
        },
        {
          id: "2",
          question:
            "How involved will your family be in this decision?",
        },
        {
          id: "3",
          question:
            "What would need to happen for you to move forward this year?",
        },
      ],
    };
  }
}
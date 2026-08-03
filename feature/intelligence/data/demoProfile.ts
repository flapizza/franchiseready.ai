import type { CandidateIntelligenceProfile } from "../models/CandidateIntelligenceProfile";

export const demoProfile: CandidateIntelligenceProfile = {
  id: "candidate-demo",

  completedAt: new Date().toISOString(),

  overallReadiness: 87,

  readinessLevel: "Strong",

  timing: {
    decisionWindow: "60–90 Days",
    urgency: 88,
    confidence: 94,
  },

  financial: {
    liquidCapital: 225000,
    investableCapital: 350000,
    investmentRange: "$200k–$500k",
    financingLikelihood: 92,
  },

  behavioral: {
    leadershipStyle: "Executive Builder",
    decisionStyle: "Analytical",
    relationshipStyle: "Consultative",
    systemsOrientation: 85,
    coachability: 94,
    adaptability: 89,
    riskTolerance: 73,
  },

  competencies: {
    leadership: 92,
    sales: 95,
    operations: 79,
    finance: 83,
    hiring: 74,
    networking: 91,
    communication: 96,
    strategicThinking: 93,
  },

  preferredBusinessModels: [
    "Executive Advisory",
    "B2B Services",
    "Professional Services",
  ],

  recommendedCategories: [
    "Business Consulting",
    "Commercial Services",
    "Business Coaching",
  ],

  recommendations: [
    {
      id: "era-group",
      name: "ERA Group",
      overallFit: 96,
      behavioralFit: 95,
      competencyFit: 97,
      financialFit: 100,
      timingFit: 92,
      confidence: 94,
      reasons: [
        "Strong executive leadership background",
        "Excellent consultative selling profile",
        "High coachability",
        "Recurring revenue preference",
      ],
      discussionPoints: [
        "Validate geographic flexibility",
        "Discuss long-term growth goals",
      ],
    },
    {
      id: "schooley-mitchell",
      name: "Schooley Mitchell",
      overallFit: 93,
      behavioralFit: 91,
      competencyFit: 95,
      financialFit: 95,
      timingFit: 90,
      confidence: 91,
      reasons: [
        "Relationship-driven sales experience",
        "Executive communication skills",
      ],
      discussionPoints: [
        "Review networking expectations",
      ],
    },
    {
      id: "actioncoach",
      name: "ActionCOACH",
      overallFit: 90,
      behavioralFit: 90,
      competencyFit: 92,
      financialFit: 88,
      timingFit: 89,
      confidence: 89,
      reasons: [
        "Leadership strengths",
        "Business development experience",
      ],
      discussionPoints: [
        "Assess coaching interest",
      ],
    },
  ],

  discoveryPriorities: [
    "Discuss desired timeline for leaving current role",
    "Validate spouse and family support",
    "Explore hiring and management experience",
    "Confirm preferred lifestyle after transition",
    "Review long-term financial expectations",
  ],

  executiveSummary:
    "The candidate demonstrates strong executive leadership, outstanding consultative selling ability, and high coachability. Financial readiness aligns well with mid-market franchise opportunities. B2B advisory, consulting, and executive service models represent the strongest opportunity based on the current assessment.",
};
export const PlatformEvents = {
  MeetingCompleted: "meeting.completed",

  MeetingAnalyzed: "meeting.analyzed",

  CandidateUpdated: "candidate.updated",

  CandidateDecisionUpdated:
    "candidate.decision.updated",

  BrandRecommendationsUpdated:
    "brand-recommendations.updated",

  WorkspaceUpdated:
    "workspace.updated",

  DiscoveryCopilotUpdated:
    "discovery-copilot.updated",
} as const;

export type PlatformEventType =
  typeof PlatformEvents[
    keyof typeof PlatformEvents
  ];
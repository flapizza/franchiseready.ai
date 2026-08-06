import type { DiscoverySession } from "./DiscoverySession";
import type { DiscoveryCopilot } from "./DiscoveryCopilot";

import type { AIInsight } from "./AIInsight";
import type { DiscoveryQuestion } from "./DiscoveryQuestion";
import type { MeetingSummary } from "./MeetingSummary";
import type { NextBestAction } from "./NextBestAction";

import type { LiveInsight } from "@/feature/intelligence/models/LiveInsight";
import type { CandidateIntelligenceState } from "@/feature/intelligence/runtime/CandidateIntelligenceEngine";

export interface DiscoveryWorkspaceState {
  session: DiscoverySession;

  intelligence: CandidateIntelligenceState;

  copilot: DiscoveryCopilot;

  insights: AIInsight[];

  liveInsights: LiveInsight[];

  suggestedQuestion: DiscoveryQuestion;

  meetingSummary: MeetingSummary;

  nextActions: NextBestAction[];
}
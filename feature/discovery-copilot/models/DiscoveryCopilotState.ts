import type { TranscriptEntry } from "./TranscriptEntry";
import type { LiveIntelligenceEvent } from "./LiveIntelligenceEvent";

export interface AIInsight {
  id: string;

  title: string;

  description: string;

  severity: "success" | "warning" | "info";
}

export interface SuggestedQuestion {
  id: string;

  question: string;
}

export interface DiscoveryCopilotState {
  candidate: string;

  transcript: TranscriptEntry[];

  insights: AIInsight[];

  buyingSignals: string[];

  risks: string[];

  suggestedQuestions: SuggestedQuestion[];

  liveFeed: LiveIntelligenceEvent[];
}
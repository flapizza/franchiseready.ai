import type { BuyingSignal } from "@/feature/discovery-copilot/models/BuyingSignal";
import type { MeetingRisk } from "@/feature/discovery-copilot/models/MeetingRisk";

export interface MeetingAnalysis {
  summary: string;

  confidence: number;

  buyingSignals: BuyingSignal[];

  risks: MeetingRisk[];

  actionItems: string[];

  openQuestions: string[];

  keyMoments: string[];

  sentiment: number;
}
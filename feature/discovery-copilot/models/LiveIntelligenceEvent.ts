export type LiveIntelligenceCategory =
  | "leadership"
  | "buying"
  | "risk"
  | "financial"
  | "lifestyle"
  | "brand"
  | "recommendation";

export interface LiveIntelligenceEvent {
  id: string;

  timestamp: string;

  category: LiveIntelligenceCategory;

  title: string;

  description: string;

  impact?: string;
}
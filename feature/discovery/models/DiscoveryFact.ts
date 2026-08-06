export type DiscoveryFactCategory =
  | "leadership"
  | "financial"
  | "family"
  | "motivation"
  | "operations"
  | "lifestyle"
  | "ownership"
  | "risk";

export interface DiscoveryFact {
  id: string;

  timestamp: string;

  category: DiscoveryFactCategory;

  title: string;

  value: string;

  confidence: number;

  source:
    | "assessment"
    | "consultant"
    | "candidate"
    | "ai";

  affectsReadiness: number;

  affectsAwardProbability: number;
}
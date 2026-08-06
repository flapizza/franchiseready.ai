export interface DiscoveryCopilot {
  readiness: number;

  confidence: number;

  liveInsights: string[];

  buyingSignals: string[];

  risks: string[];

  nextQuestion: string;

  nextAction: string;
}
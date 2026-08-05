import type { NextBestAction } from "./NextBestAction";

export type ExecutiveStatus =
  | "ready"
  | "developing"
  | "high-risk"
  | "not-ready";

export interface ExecutiveEvidence {
  id: string;
  title: string;
  description: string;
  score: number;
}

export interface ExecutiveRisk {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface ExecutiveRecommendation {
  status: ExecutiveStatus;

  confidence: number;

  summary: string;

  recommendation: string;

  evidence: ExecutiveEvidence[];

  risks: ExecutiveRisk[];

  nextActions: NextBestAction[];
}
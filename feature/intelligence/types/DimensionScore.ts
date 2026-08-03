import type { IntelligenceDimension } from "./IntelligenceDimension";

export interface DimensionScore {
  dimension: IntelligenceDimension;

  score: number;

  confidence: number;

  evidence: string[];

  strengths: string[];

  risks: string[];
}
export interface AIConfidence {
  overall: number;

  previous: number;

  trend: "up" | "down" | "stable";

  evidence: string[];

  uncertainty: string[];

  nextMilestone: string;

  predictedConfidence: number;
}
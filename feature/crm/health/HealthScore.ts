import type { HealthFactor } from "./HealthFactor";

export interface HealthScore {
  overall: number;

  trend: "up" | "down" | "stable";

  strengths: string[];

  risks: string[];

  factors: HealthFactor[];
}
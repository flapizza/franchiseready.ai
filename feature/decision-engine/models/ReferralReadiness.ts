export type ReferralReadinessStatus =
  | "not-ready"
  | "needs-validation"
  | "ready";

export interface ReferralReadiness {
  status: ReferralReadinessStatus;

  percentage: number;

  remainingRequirements: string[];
}
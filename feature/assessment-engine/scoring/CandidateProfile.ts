export type PreferredOwnerRole =
  | "owner-operator"
  | "executive-owner"
  | "semi-absentee";

export type CandidateProfile = {
  executiveLeadership: number;

  consultativeSelling: number;

  financialCapacity: number;

  operationalReadiness: number;

  relationshipBuilding: number;

  strategicThinking: number;

  coachability: number;

  growthOrientation: number;

  riskAlignment: number;

  preferredOwnerRole: PreferredOwnerRole;
};
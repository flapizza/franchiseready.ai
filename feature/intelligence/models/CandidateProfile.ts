export interface CandidateProfile {
  id: string;

  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  city: string;

  state: string;

  occupation: string;

  annualIncome: number;

  liquidCapital: number;

  netWorth: number;

  desiredInvestment: number;

  financingNeeded: boolean;

  preferredIndustries: string[];

  preferredBusinessModel:
    | "owner-operator"
    | "executive"
    | "semi-absentee";

  desiredTimeline:
    | "immediately"
    | "30-days"
    | "90-days"
    | "6-months"
    | "1-year";

  businessExperience: number;

  leadershipExperience: number;

  salesExperience: number;

  managementExperience: number;
}
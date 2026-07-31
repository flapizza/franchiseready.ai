export type FranchiseCategory =
  | "B2B Services"
  | "Business Coaching"
  | "Home Services"
  | "Health & Wellness"
  | "Fitness"
  | "Senior Care"
  | "Commercial Services"
  | "Education"
  | "Retail"
  | "Food & Beverage"
  | "Automotive"
  | "Real Estate"
  | "Restoration"
  | "Staffing"
  | "Children's Services"
  | "Other";

export type FranchiseMatch = {
  franchiseId: string;

  brandName: string;

  category: FranchiseCategory;

  score: number;

  confidence: number;

  strengths: string[];

  concerns: string[];

  explanation: string;
};
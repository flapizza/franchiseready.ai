export interface ReferralPackage {
  consultant: {
    companyName: string;
    consultantName: string;
    logoUrl?: string;
    website?: string;
    email?: string;
    phone?: string;
  };

  candidate: {
    fullName: string;
    readiness: number;
    confidence: number;
  };

  brand: {
    name: string;
    overallFit: number;
  };

  executiveSummary: string;

  strengths: string[];

  remainingRisks: string[];

  consultantRecommendation: string;

  generatedAt: string;
}
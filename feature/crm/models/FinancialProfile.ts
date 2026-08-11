export interface FinancialProfile {
  candidateId: string;

  netWorth: number;

  liquidCapital: number;

  availableCash: number;

  investmentRange: string;

  financingNeeded: boolean;

  verified: boolean;
}
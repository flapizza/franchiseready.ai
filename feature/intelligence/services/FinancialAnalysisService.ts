import type {
  FinancialIntelligence,
} from "../models/CandidateIntelligence";

export interface FinancialProfile {
  liquidCapital: number;

  netWorth: number;

  investmentComfort: number;

  financingRequired: boolean;

  creditConfidence: number;
}

export class FinancialAnalysisService {
  public analyze(
    profile: FinancialProfile,
  ): FinancialIntelligence {
    return {
      liquidityScore: this.calculateLiquidity(
        profile.liquidCapital,
      ),

      netWorthScore: this.calculateNetWorth(
        profile.netWorth,
      ),

      financingLikelihood:
        this.calculateFinancingLikelihood(profile),

      investmentCapacity:
        this.calculateInvestmentCapacity(profile),

      financialConfidence:
        profile.creditConfidence,
    };
  }

  private calculateLiquidity(
    liquidCapital: number,
  ): number {
    if (liquidCapital >= 500000) return 100;
    if (liquidCapital >= 350000) return 90;
    if (liquidCapital >= 250000) return 80;
    if (liquidCapital >= 150000) return 70;
    if (liquidCapital >= 100000) return 60;

    return 40;
  }

  private calculateNetWorth(
    netWorth: number,
  ): number {
    if (netWorth >= 2000000) return 100;
    if (netWorth >= 1500000) return 95;
    if (netWorth >= 1000000) return 90;
    if (netWorth >= 750000) return 80;
    if (netWorth >= 500000) return 70;

    return 50;
  }

  private calculateInvestmentCapacity(
    profile: FinancialProfile,
  ): number {
    const liquidity =
      this.calculateLiquidity(
        profile.liquidCapital,
      );

    const netWorth =
      this.calculateNetWorth(
        profile.netWorth,
      );

    return Math.round(
      (liquidity + netWorth) / 2,
    );
  }

  private calculateFinancingLikelihood(
    profile: FinancialProfile,
  ): number {
    let score =
      this.calculateInvestmentCapacity(
        profile,
      );

    if (!profile.financingRequired) {
      score += 10;
    }

    score +=
      Math.round(
        profile.creditConfidence / 10,
      );

    return Math.min(score, 100);
  }
}
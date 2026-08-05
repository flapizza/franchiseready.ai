import type { AIInsight } from "../models/AIInsight";
import type { DiscoveryContext } from "../models/DiscoveryContext";

import type { InsightRule } from "../rules/InsightRule";

import { LeadershipInsightRule } from "../rules/LeadershipInsightRule";
import { CoachabilityInsightRule } from "../rules/CoachabilityInsightRule";
import { FinancialInsightRule } from "../rules/FinancialInsightRule";
import { TimingInsightRule } from "../rules/TimingInsightRule";

export class InsightEngine {
  private readonly rules: InsightRule[] = [
    new LeadershipInsightRule(),
    new CoachabilityInsightRule(),
    new FinancialInsightRule(),
    new TimingInsightRule(),
  ];

  public generate(
    context: DiscoveryContext,
  ): AIInsight[] {
    return this.rules
      .flatMap((rule) => rule.evaluate(context))
      .sort(
        (a, b) => b.confidence - a.confidence,
      );
  }
}
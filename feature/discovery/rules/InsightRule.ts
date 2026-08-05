import type { AIInsight } from "../models/AIInsight";
import type { DiscoveryContext } from "../models/DiscoveryContext";

export interface InsightRule {
  evaluate(
    context: DiscoveryContext,
  ): AIInsight[];
}
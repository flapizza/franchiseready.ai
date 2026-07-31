import type { Recommendation } from "../../types/domain";
import type { FranchiseMatch } from "../FranchiseMatch";

export class RecommendationService {
  public build(
    matches: FranchiseMatch[],
  ): Recommendation[] {
    return matches.slice(0, 3).map((match) => ({
      id: crypto.randomUUID(),
      title: match.brandName,
      description: `${match.brandName} is currently one of the strongest franchise matches based on the candidate's profile.`,
      priority: "high",
    }));
  }
}
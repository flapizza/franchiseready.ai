import type { Recommendation } from "../../types/domain";
import type { FranchiseMatch } from "../FranchiseMatch";

export class RecommendationService {
  public build(
    matches: FranchiseMatch[],
  ): Recommendation[] {
    return matches.slice(0, 3).map((match, index) => ({
      id: crypto.randomUUID(),

      category: "priority",

      topic: "brand",

      title: match.brandName,

      summary: `${match.brandName} is one of the strongest franchise matches based on the candidate's assessment profile.`,

      priority: index + 1,
    }));
  }
}
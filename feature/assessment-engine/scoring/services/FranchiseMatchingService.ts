import type { CandidateProfile } from "../CandidateProfile";
import type {
  FranchiseCategory,
  FranchiseMatch,
} from "../FranchiseMatch";
import { demoBrands } from "@/feature/brand-library/data/demoBrands";

export class FranchiseMatchingService {
  public match(
    candidate: CandidateProfile,
  ): FranchiseMatch[] {
    void candidate;

    const categories: Record<string, FranchiseCategory> = {
      "era-group": "B2B Services",
      "schooley-mitchell": "B2B Services",
      actioncoach: "Business Coaching",
    };

    return demoBrands.map((brand, index) =>
      this.createMatch(
        brand.id,
        brand.name,
        categories[brand.id] ?? "Other",
        96 - index * 2,
      ),
    );
  }

  private createMatch(
    franchiseId: string,
    brandName: string,
    category: FranchiseCategory,
    score: number,
  ): FranchiseMatch {
    return {
      franchiseId,
      brandName,
      category,
      score,
      confidence: 90,
      strengths: [],
      concerns: [],
      explanation: "",
    };
  }
}

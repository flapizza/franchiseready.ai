import type { CandidateProfile } from "../CandidateProfile";
import type {
  FranchiseCategory,
  FranchiseMatch,
} from "../FranchiseMatch";

export class FranchiseMatchingService {
  public match(
    candidate: CandidateProfile,
  ): FranchiseMatch[] {
    void candidate;

    return [
      this.createMatch(
        "era-group",
        "ERA Group",
        "B2B Services",
        96,
      ),
      this.createMatch(
        "schooley-mitchell",
        "Schooley Mitchell",
        "B2B Services",
        94,
      ),
      this.createMatch(
        "actioncoach",
        "ActionCOACH",
        "Business Coaching",
        91,
      ),
    ];
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
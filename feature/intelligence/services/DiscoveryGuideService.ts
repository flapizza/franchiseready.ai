import type { CandidateIntelligence } from "../models/CandidateIntelligence";
import type { DiscoveryGuide } from "../models/DiscoveryGuide";

export class DiscoveryGuideService {
  public build(
    intelligence: CandidateIntelligence,
  ): DiscoveryGuide {
    return {
      strengths: this.buildStrengths(intelligence),

      concerns: this.buildConcerns(intelligence),

      opportunities: this.buildOpportunities(intelligence),

      recommendedQuestions:
        this.buildQuestions(intelligence),

      discussionTopics:
        this.buildTopics(intelligence),

      followUpRecommendations:
        this.buildFollowUps(intelligence),
    };
  }

  private buildStrengths(
    intelligence: CandidateIntelligence,
  ): string[] {
    const strengths: string[] = [];

    if (intelligence.behavioral.coachability >= 85) {
      strengths.push(
        "Highly coachable and likely to follow proven systems.",
      );
    }

    if (
      intelligence.sales.relationshipBuilding >= 85
    ) {
      strengths.push(
        "Strong relationship-building skills.",
      );
    }

    if (
      intelligence.leadership.accountability >= 85
    ) {
      strengths.push(
        "Demonstrates strong leadership accountability.",
      );
    }

    return strengths;
  }

  private buildConcerns(
    intelligence: CandidateIntelligence,
  ): string[] {
    const concerns: string[] = [];

    if (
      intelligence.operations.execution < 60
    ) {
      concerns.push(
        "Operational discipline should be explored.",
      );
    }

    if (
      intelligence.financial.financingLikelihood <
      65
    ) {
      concerns.push(
        "Financial qualification requires additional discussion.",
      );
    }

    return concerns;
  }

  private buildOpportunities(
    intelligence: CandidateIntelligence,
  ): string[] {
    const opportunities: string[] = [];

    if (
      intelligence.sales.businessDevelopment >
      80
    ) {
      opportunities.push(
        "Candidate may thrive in consultative franchise systems.",
      );
    }

    if (
      intelligence.leadership.delegation > 80
    ) {
      opportunities.push(
        "Candidate appears capable of scaling beyond owner-operator.",
      );
    }

    return opportunities;
  }

  private buildQuestions(
    intelligence: CandidateIntelligence,
  ): string[] {
    const questions: string[] = [];

    if (
      intelligence.behavioral.coachability < 70
    ) {
      questions.push(
        "Tell me about a time you adopted a system that wasn't your own.",
      );
    }

    if (
      intelligence.operations.execution < 70
    ) {
      questions.push(
        "Describe how you stay organized while managing multiple priorities.",
      );
    }

    questions.push(
      "What motivated you to begin exploring franchise ownership?",
    );

    questions.push(
      "Describe the best leader you've ever worked for.",
    );

    return questions;
  }

  private buildTopics(
    intelligence: CandidateIntelligence,
  ): string[] {
    const topics = [
      "Franchise ownership goals",
      "Leadership philosophy",
      "Lifestyle expectations",
    ];

    if (
      intelligence.financial.financingLikelihood <
      75
    ) {
      topics.push("Funding strategy");
    }

    return topics;
  }

  private buildFollowUps(
    intelligence: CandidateIntelligence,
  ): string[] {
    const followUps: string[] = [];

    followUps.push(
      "Review recommended franchise brands.",
    );

    followUps.push(
      "Schedule discovery meeting.",
    );

    if (
      intelligence.financial.financingLikelihood <
      75
    ) {
      followUps.push(
        "Discuss financing options.",
      );
    }

    return followUps;
  }
}
import type { PresentationTalkingPoint } from "../models/CandidateBrandPresentationBrief";

/** Deterministic translation boundary for live-conversation prompts. Canonical
 * brand questions pass through unchanged; internal concern labels never do. */
export class PresentationQuestionBuilder {
  build(canonicalQuestions: string[], concerns: string[]): PresentationTalkingPoint[] {
    const questions: PresentationTalkingPoint[] = [
      ...canonicalQuestions.slice(0, 2).map((text) => ({ text, source: "Brand Intelligence" as const })),
      ...concerns.slice(0, 2).map((concern) => ({ text: this.fromConcern(concern), source: "Discovery" as const })),
    ];
    return questions.filter((item, index) => questions.findIndex((candidate) => candidate.text === item.text) === index).slice(0, 4);
  }

  private fromConcern(concern: string): string {
    const value = concern.toLowerCase();
    if (/lifestyle|schedule|work.?life/.test(value)) return "How well does this opportunity fit the lifestyle you're looking for?";
    if (/family|spouse|partner/.test(value)) return "How does your family feel about the time and financial commitments of business ownership?";
    if (/ownership role|owner role|involvement/.test(value)) return "How involved do you want to be in the day-to-day business?";
    if (/motivation|why ownership|reason.*owner/.test(value)) return "What feels most important to you about becoming a business owner now?";
    if (/timeline|timing|decision window/.test(value)) return "What could affect the timing of your decision?";
    if (/network|relationship building/.test(value)) return "How comfortable are you with the amount of networking this business may require?";
    if (/sales|business development|outbound|prospecting/.test(value)) return "How do you feel about personally driving business development?";
    if (/staff|team|employee|hiring/.test(value)) return "Does this staffing model fit how you picture yourself running the business?";
    if (/investment|capital|financial|funding/.test(value)) return "How does this investment level compare with what you had in mind?";
    if (/operations|operational/.test(value)) return "How involved would you like to be in the daily operations?";
    return "What would you need to understand better before deciding whether this opportunity fits?";
  }
}

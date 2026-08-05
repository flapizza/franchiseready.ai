import type { CandidateRecord } from "@/feature/crm/models/CandidateRecord";

import type { AIInsight } from "../models/AIInsight";
import type { DiscoveryContext } from "../models/DiscoveryContext";
import type { DiscoveryQuestion } from "../models/DiscoveryQuestion";
import type { MeetingSummary } from "../models/MeetingSummary";
import type { NextBestAction } from "../models/NextBestAction";

import { InsightEngine } from "./InsightEngine";
import { QuestionEngine } from "./QuestionEngine";
import { SummaryEngine } from "./SummaryEngine";
import { ActionEngine } from "./ActionEngine";

export interface DiscoveryState {
  insights: AIInsight[];

  suggestedQuestion: DiscoveryQuestion;

  meetingSummary: MeetingSummary;

  nextActions: NextBestAction[];
}

export class DiscoveryRuntime {
  constructor(
    private readonly insightEngine = new InsightEngine(),
    private readonly questionEngine = new QuestionEngine(),
    private readonly summaryEngine = new SummaryEngine(),
    private readonly actionEngine = new ActionEngine(),
  ) {}

  public evaluate(
    context: DiscoveryContext,
  ): DiscoveryState {
    const insights =
      this.insightEngine.generate(context);

    const suggestedQuestion =
      this.questionEngine.generate(
        context,
        insights,
      );

    const meetingSummary =
      this.summaryEngine.generate(
        context,
        insights,
      );

    const nextActions =
      this.actionEngine.generate(
        context,
        insights,
      );

    return {
      insights,
      suggestedQuestion,
      meetingSummary,
      nextActions,
    };
  }
}
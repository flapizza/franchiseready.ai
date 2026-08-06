import type { AIInsight } from "../models/AIInsight";
import type { DiscoveryContext } from "../models/DiscoveryContext";
import type { DiscoveryQuestion } from "../models/DiscoveryQuestion";
import type { MeetingSummary } from "../models/MeetingSummary";
import type { NextBestAction } from "../models/NextBestAction";
import type { DiscoveryCopilot } from "../models/DiscoveryCopilot";
import type { DiscoverySession } from "../models/DiscoverySession";

import type { LiveInsight } from "@/feature/intelligence/models/LiveInsight";

import {
  CandidateIntelligenceEngine,
  type CandidateIntelligenceState,
} from "@/feature/intelligence/runtime/CandidateIntelligenceEngine";

import { DiscoveryCopilotEngine } from "./DiscoveryCopilotEngine";
import { DiscoverySessionEngine } from "./DiscoverySessionEngine";
import { InsightEngine } from "./InsightEngine";
import { QuestionEngine } from "./QuestionEngine";
import { SummaryEngine } from "./SummaryEngine";
import { ActionEngine } from "./ActionEngine";

import { LiveInsightEngine } from "@/feature/intelligence/runtime/LiveInsightEngine";

export interface DiscoveryState {
  session: DiscoverySession;

  intelligence: CandidateIntelligenceState;

  copilot: DiscoveryCopilot;

  insights: AIInsight[];

  suggestedQuestion: DiscoveryQuestion;

  meetingSummary: MeetingSummary;

  nextActions: NextBestAction[];

  liveInsights: LiveInsight[];
}

export class DiscoveryRuntime {
  private readonly insightEngine = new InsightEngine();

  private readonly questionEngine = new QuestionEngine();

  private readonly summaryEngine = new SummaryEngine();

  private readonly actionEngine = new ActionEngine();

  private readonly liveInsightEngine = new LiveInsightEngine();

  private readonly sessionEngine = new DiscoverySessionEngine();

  private readonly copilotEngine = new DiscoveryCopilotEngine();

  private readonly candidateIntelligenceEngine =
    new CandidateIntelligenceEngine();

  public evaluate(
    context: DiscoveryContext,
  ): DiscoveryState {
    const session =
      this.sessionEngine.create(context);

    const intelligence =
      this.candidateIntelligenceEngine.evaluate(
        session,
        session.memory,
      );

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

    const liveInsights =
      this.liveInsightEngine.evaluate(
        context,
      );

    const copilot =
      this.copilotEngine.generate(
        context,
      );

    return {
      session,
      intelligence,
      copilot,
      insights,
      suggestedQuestion,
      meetingSummary,
      nextActions,
      liveInsights,
    };
  }
}
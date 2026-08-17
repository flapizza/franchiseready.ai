import { notFound } from "next/navigation";

import { DiscoveryCopilot } from "@/feature/crm/components/DiscoveryCopilot";

import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";

import type {
  ExecutiveRecommendation,
} from "@/feature/intelligence/models/ExecutiveRecommendation";

import {
  AIDiscoveryTimeline,
} from "@/feature/crm/components/AIDiscoveryTimeline";

import {
  TwoColumn,
  WorkspaceLayout,
} from "@/feature/ui";

import { ExecutiveBrief } from "@/feature/crm/components/ExecutiveBrief";
import { DiscoveryHeader } from "@/feature/crm/components/DiscoveryHeader";
import { SessionObjectivesCard } from "@/feature/crm/components/SessionObjectivesCard";
import { LiveNotesPanel } from "@/feature/crm/components/LiveNotesPanel";
import { SuggestedQuestionCard } from "@/feature/crm/components/SuggestedQuestionCard";
import { MeetingActionsBar } from "@/feature/crm/components/MeetingActionsBar";

import { DiscoveryRuntime } from "@/feature/discovery/runtime/DiscoveryRuntime";
import { createDemoCandidateLifecycleService } from "@/feature/crm/services/DemoCandidateLifecycleService";
import { CandidateLifecycleAction } from "@/feature/crm/components/CandidateLifecycleAction";

import type { DiscoveryContext } from "@/feature/discovery/models/DiscoveryContext";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DiscoveryWorkspacePage({
  params,
}: Props) {
  const { id } = await params;

  const repository =
    new SeedCandidateRepository();

  const candidate =
    await repository.getById(id);

  if (!candidate || !candidate.intelligence) {
    notFound();
  }

  const context: DiscoveryContext = {
    candidate,

    intelligence:
      candidate.intelligence,

    notes: candidate.intelligence.executiveSummary,

    stage: "opening",

    completedObjectives: [
      "Validate ownership motivation",
    ],

    activeTopics: candidate.intelligence.discoveryPriorities,

    detectedBuyingSignals: candidate.intelligence.preferredBusinessModels,

    detectedRisks: candidate.intelligence.discoveryPriorities,

    startedAt: new Date(),

    currentTime: new Date(),
  };

  const runtime =
    new DiscoveryRuntime();

  const workspace =
    runtime.evaluate(context);
  const lifecycleAction = createDemoCandidateLifecycleService(repository).getRecommendedAction(candidate);

    const recommendation: ExecutiveRecommendation = {
  status: "ready",

  confidence: 96,

  summary:
    "Candidate demonstrates exceptional executive leadership, strong financial readiness, and a genuine willingness to follow proven systems. Based on the Discovery conversation, the AI believes this candidate is well positioned to move into Brand Matching. The only remaining concern is validating family alignment before introducing specific franchise opportunities.",

  recommendation:
    "Advance the candidate to Brand Matching and schedule a Top 3 Brand Presentation within the next seven days.",

  evidence: [
    {
      id: "1",
      title: "Executive Leadership",

      description:
        "Candidate has extensive leadership experience leading teams and managing organizational growth.",

      score: 96,
    },
    {
      id: "2",
      title: "Financial Capacity",

      description:
        "Financial readiness indicates the candidate is capable of pursuing franchise ownership.",

      score: 91,
    },
    {
      id: "3",
      title: "Buying Motivation",

      description:
        "Candidate repeatedly asked about implementation timeline and ownership process.",

      score: 94,
    },
    {
      id: "4",
      title: "Systems Orientation",

      description:
        "Responses indicate a willingness to follow proven business systems and coaching.",

      score: 93,
    },
  ],

  risks: [
    {
      id: "1",

      title: "Family Alignment",

      description:
        "Confirm spouse or family support before moving into validation and award discussions.",

      severity: "medium",
    },
    {
      id: "2",

      title: "Corporate Transition",

      description:
        "Continue discussing the emotional transition from corporate employment to business ownership.",

      severity: "low",
    },
  ],

  nextActions: [],
};

  return (
    <WorkspaceLayout>

      <DiscoveryHeader
  candidateName={`${candidate.firstName} ${candidate.lastName}`}
  startedAt="11:02 AM"
  duration="08:14"
  intelligence={workspace.intelligence}
/>
      <ExecutiveBrief
  recommendation={recommendation}
/>
            <AIDiscoveryTimeline
  events={workspace.liveInsights.map((insight) => ({
    id: insight.id,
    time: insight.timestamp,
    title: insight.title,
    description: insight.description,
    type: insight.severity,
  }))}
/>
            <TwoColumn
  left={
    <LiveNotesPanel
      notes={context.notes}
    />
  }
  right={
   <DiscoveryCopilot
  copilot={workspace.copilot}
/>
  }
/>
       

      <TwoColumn
  left={
    <SuggestedQuestionCard
      question={
        workspace.suggestedQuestion.question
      }
      reason={
        workspace.suggestedQuestion.reason
      }
      confidence={
        workspace.suggestedQuestion.confidence
      }
    />
  }
  right={
    <SessionObjectivesCard
      objectives={[
        {
          id: "1",
          title: "Validate ownership motivation",
          completed: true,
          priority: "high",
        },
        {
          id: "2",
          title: "Confirm family alignment",
          completed: false,
          priority: "high",
        },
        {
          id: "3",
          title: "Discuss investment expectations",
          completed: false,
          priority: "medium",
        },
        {
          id: "4",
          title: "Establish buying timeline",
          completed: false,
          priority: "medium",
        },
      ]}
    />
  }
/>

      <MeetingActionsBar />

      {lifecycleAction?.kind === "discovery-completed" && (
        <section className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Lifecycle orchestration</p>
          <h2 className="mt-2 text-xl font-black text-slate-900">Discovery is ready to close</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">The canonical lifecycle service will validate the candidate evidence, select Validation or Brand Strategy, and record the transition activity.</p>
          <div className="mt-4 w-fit"><CandidateLifecycleAction candidateId={candidate.id} label={lifecycleAction.label} /></div>
        </section>
      )}
  

    </WorkspaceLayout>
  );
}


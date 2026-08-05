import { notFound } from "next/navigation";

import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { ExecutiveRecommendationPanel } from "@/feature/crm/components/ExecutiveRecommendationPanel";

import type {
  ExecutiveRecommendation,
} from "@/feature/intelligence/models/ExecutiveRecommendation";

import {
  TwoColumn,
  WorkspaceLayout,
} from "@/feature/ui";

import { DiscoveryHeader } from "@/feature/crm/components/DiscoveryHeader";
import { SessionObjectivesCard } from "@/feature/crm/components/SessionObjectivesCard";
import { AIInsightsPanel } from "@/feature/crm/components/AIInsightsPanel";
import { LiveNotesPanel } from "@/feature/crm/components/LiveNotesPanel";
import { SuggestedQuestionCard } from "@/feature/crm/components/SuggestedQuestionCard";
import { MeetingActionsBar } from "@/feature/crm/components/MeetingActionsBar";

import { DiscoveryRuntime } from "@/feature/discovery/runtime/DiscoveryRuntime";

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

  if (!candidate) {
    notFound();
  }

  const context: DiscoveryContext = {
    candidate,

    intelligence:
      candidate.intelligence,

    notes: `Candidate has over 20 years of executive leadership experience.
Interested in long-term wealth creation.
Considering leaving corporate America.
Family has discussed franchise ownership.
Seeking validation before making a final decision.`,

    stage: "opening",

    completedObjectives: [
      "Validate ownership motivation",
    ],

    activeTopics: [
      "Family Alignment",
      "Financial Readiness",
      "Leadership",
    ],

    detectedBuyingSignals: [
      "Asked about next steps",
      "Discussed ownership timeline",
    ],

    detectedRisks: [
      "Family alignment not fully confirmed",
    ],

    startedAt: new Date(),

    currentTime: new Date(),
  };

  const runtime =
    new DiscoveryRuntime();

  const discovery =
    runtime.evaluate(context);

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
        score={
          candidate.intelligence
            .overallReadiness
        }
        confidence={
          candidate.intelligence
            .financial
            .financingLikelihood
        }
      />
      <ExecutiveRecommendationPanel
  recommendation={recommendation}
/>
            <TwoColumn
  left={
    <LiveNotesPanel
      notes={context.notes}
    />
  }
  right={
    <AIInsightsPanel
      insights={discovery.insights}
    />
  }
/>
       

      <TwoColumn
  left={
    <SuggestedQuestionCard
      question={
        discovery.suggestedQuestion.question
      }
      reason={
        discovery.suggestedQuestion.reason
      }
      confidence={
        discovery.suggestedQuestion.confidence
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
  

    </WorkspaceLayout>
  );
}


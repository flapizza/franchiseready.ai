import { notFound } from "next/navigation";

import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";

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
            <TwoColumn
        left={
          <SessionObjectivesCard
            objectives={[
              {
                id: "1",
                title:
                  "Validate ownership motivation",
                completed: true,
                priority: "high",
              },
              {
                id: "2",
                title:
                  "Confirm family alignment",
                completed: false,
                priority: "high",
              },
              {
                id: "3",
                title:
                  "Discuss investment expectations",
                completed: false,
                priority: "medium",
              },
              {
                id: "4",
                title:
                  "Establish buying timeline",
                completed: false,
                priority: "medium",
              },
            ]}
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
          <LiveNotesPanel
            notes={context.notes}
          />
        }
        right={
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
      />

      <MeetingActionsBar />
            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-8 py-6">

          <p className="text-xs font-semibold uppercase tracking-[0.20em] text-blue-600">
            AI Session Summary
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Discovery Progress
          </h2>

        </div>

        <div className="grid gap-8 p-8 xl:grid-cols-3">

          <SummaryCard
            title="Buying Signals"
            items={
              discovery.meetingSummary.buyingSignals
            }
          />

          <SummaryCard
            title="Remaining Concerns"
            items={
              discovery.meetingSummary.concerns
            }
          />

          <SummaryCard
            title="AI Recommendation"
            items={[
              discovery.meetingSummary
                .consultantRecommendation,
              discovery.meetingSummary
                .recommendedNextStep,
            ]}
          />

        </div>

      </section>

    </WorkspaceLayout>
  );
}

type SummaryCardProps = {
  title: string;
  items: string[];
};

function SummaryCard({
  title,
  items,
}: SummaryCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
        {title}
      </h3>

      <div className="mt-5 space-y-4">

        {items.map((item) => (
          <div
            key={item}
            className="flex items-start gap-3"
          >
            <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />

            <p className="leading-7 text-slate-700">
              {item}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}
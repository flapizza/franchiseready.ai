import { notFound } from "next/navigation";

import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";

import {
  Card,
  PageHeader,
  ReadinessGauge,
  Stat,
  TwoColumn,
  WorkspaceLayout,
} from "@/feature/ui";

import { AIMeetingCoach } from "@/feature/crm/components/AIMeetingCoach";
import { IntelligenceProfileCard } from "@/feature/crm/components/IntelligenceProfileCard";
import { BrandMatchMatrix } from "@/feature/crm/components/BrandMatchMatrix";
import { DiscoveryGuidePanel } from "@/feature/crm/components/DiscoveryGuidePanel";
import { ConsultantBriefPanel } from "@/feature/crm/components/ConsultantBriefPanel";
import { ActivityTimeline } from "@/feature/crm/components/ActivityTimeline";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CandidateWorkspacePage({
  params,
}: Props) {
  const { id } = await params;

  const repository = new SeedCandidateRepository();

  const candidate = await repository.getById(id);

  if (!candidate) {
    notFound();
  }

  return (
    <WorkspaceLayout>

      <PageHeader
  eyebrow="Candidate Intelligence Workspace"
  title={`${candidate.firstName} ${candidate.lastName}`}
  description={candidate.intelligence.executiveSummary}
  actions={
    <ReadinessGauge
      score={candidate.intelligence.overallReadiness}
      size={150}
    />
  }
/>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

  <Stat
    label="Readiness"
    value={candidate.intelligence.overallReadiness}
    description="Overall franchise readiness"
    trend="up"
  />

  <Stat
    label="Health"
    value={candidate.healthScore}
    description="Current opportunity health"
    trend="up"
  />

  <Stat
    label="Timeline"
    value={candidate.intelligence.timing.decisionWindow}
    description="Expected buying window"
  />

  <Stat
    label="Investment"
    value={candidate.intelligence.financial.investmentRange}
    description="Qualified investment range"
    trend="up"
  />

</section>

      <section className="grid gap-6 xl:grid-cols-2">

        <Card
  title="Executive Summary"
  subtitle="AI-generated candidate overview"
        >

          <p className="leading-8 text-slate-700">
            {candidate.intelligence.executiveSummary}
          </p>

        </Card>

        <AIMeetingCoach
  objective="Confirm executive leadership fit and validate ownership timeline."
  strategy="Lead with ownership vision before discussing brands. Focus on leadership philosophy, desired lifestyle, and long-term business goals."
  questions={[
    "What motivated you to explore franchise ownership now?",
    "Describe the largest team you've managed.",
    "What role do you hope to play in the business day-to-day?",
  ]}
  concern="Leaving a successful executive career."
  response="Discuss transition planning, proven franchise systems, and how executive experience accelerates business ownership success."
  nextAction="Schedule Discovery Meeting"
  confidence={96}
/>

      </section>

      <section className="grid gap-6 xl:grid-cols-2">

        <IntelligenceProfileCard
          leadership={92}
          sales={88}
          operations={74}
          coachability={
            candidate.intelligence.behavioral.coachability
          }
          financial={91}
        />
        <BrandMatchMatrix
          brands={candidate.intelligence.recommendations.map(
            (brand) => ({
              id: brand.id,
              name: brand.name,
              overallFit: brand.overallFit,

              leadership: 95,
              sales: 90,
              operations: 82,
              financial: 91,

              reasons: brand.reasons,
            }),
          )}
        />

      </section>

      <section className="grid gap-6 xl:grid-cols-2">

        <DiscoveryGuidePanel
          strengths={[
            "High coachability",
            "Strong executive leadership",
            "Financially qualified",
            "Excellent communication",
          ]}
          concerns={candidate.intelligence.discoveryPriorities}
          questions={[
            "What prompted you to explore franchise ownership now?",
            "Describe the largest team you've managed.",
            "What does success look like in five years?",
            "How comfortable are you building a sales organization?",
          ]}
        />

        <ConsultantBriefPanel
          executiveSummary={
            candidate.intelligence.executiveSummary
          }
          recommendedApproach="Lead with an executive-level business discussion. Focus on long-term ownership goals, leadership philosophy, and growth expectations before introducing specific franchise brands."
          objectives={[
            "Validate ownership expectations",
            "Confirm financial readiness",
            "Discuss operational involvement",
            "Understand family support",
            "Confirm buying timeline",
          ]}
          openingQuestions={[
            "Why franchise ownership?",
            "Why now?",
            "What business experience best prepared you for ownership?",
            "What type of legacy are you hoping to build?",
          ]}
          nextActions={[
            "Schedule Discovery Meeting",
            "Review financial qualification",
            "Present top three brands",
            "Invite to validation process",
          ]}
        />

      </section>

      <ActivityTimeline
        activities={[
          {
            id: "1",
            title: "Assessment Completed",
            description:
              "Candidate completed the FranchiseReady Intelligence Assessment.",
            date: "Today",
          },
          {
            id: "2",
            title: "Financial Qualification",
            description:
              "Candidate appears financially qualified based on assessment responses.",
            date: "Today",
          },
          {
            id: "3",
            title: "AI Recommendation",
            description:
              "Proceed to Discovery Meeting within the next two days.",
            date: "Today",
          },
        ]}
      />

    </WorkspaceLayout>
  );
}
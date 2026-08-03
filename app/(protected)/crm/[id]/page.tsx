import { notFound } from "next/navigation";

import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";

import { CandidateHeader } from "@/feature/crm/components/CandidateHeader";
import { MetricCard } from "@/feature/crm/components/MetricCard";
import { SectionCard } from "@/feature/crm/components/SectionCard";

import { NextBestActionPanel } from "@/feature/crm/components/NextBestActionPanel";
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
    <main className="mx-auto max-w-7xl space-y-8 p-8">

      <CandidateHeader
        candidate={candidate}
      />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          title="Overall Readiness"
          value={candidate.intelligence.overallReadiness.toString()}
          subtitle="Franchise ownership readiness"
          trend="up"
        />

        <MetricCard
          title="Health Score"
          value={candidate.healthScore.toString()}
          subtitle="Current opportunity health"
          trend="up"
        />

        <MetricCard
          title="Decision Timeline"
          value={candidate.intelligence.timing.decisionWindow}
          subtitle="Expected buying window"
          trend="neutral"
        />

        <MetricCard
          title="Investment"
          value={candidate.intelligence.financial.investmentRange}
          subtitle="Estimated qualification"
          trend="up"
        />

      </section>

      <section className="grid gap-6 xl:grid-cols-2">

        <SectionCard
          title="Executive Summary"
          subtitle="AI-generated candidate overview"
        >

          <p className="leading-8 text-slate-700">
            {candidate.intelligence.executiveSummary}
          </p>

        </SectionCard>

        <NextBestActionPanel
          title="Schedule Discovery Meeting"
          description="Candidate demonstrates excellent financial readiness, strong coachability, and high franchise ownership potential. Moving into discovery is the recommended next step."
          confidence={96}
          impact={94}
          dueInDays={2}
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

    </main>
  );
}
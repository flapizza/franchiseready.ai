import { notFound } from "next/navigation";

import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";

import {
  PageHeader,
  TwoColumn,
  WorkspaceLayout,
} from "@/feature/ui";

import { KPIRibbon } from "@/feature/ui/components/KPIRibbon";
import { ReadinessGauge } from "@/feature/ui/components/ReadinessGauge";

import { ExecutiveIntelligencePanel } from "@/feature/crm/components/ExecutiveIntelligencePanel";
import { IntelligenceProfileCard } from "@/feature/crm/components/IntelligenceProfileCard";
import { BrandMatchMatrix } from "@/feature/crm/components/BrandMatchMatrix";
import { AIMeetingCoach } from "@/feature/crm/components/AIMeetingCoach";
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

  const repository =
    new SeedCandidateRepository();

  const candidate =
    await repository.getById(id);

  if (!candidate) {
    notFound();
  }

  return (
    <WorkspaceLayout>

      <PageHeader
  eyebrow="Candidate Intelligence Workspace"
  title={`${candidate.firstName} ${candidate.lastName}`}
  description={
    candidate.intelligence.executiveSummary
  }
  actions={
    <ReadinessGauge
      score={candidate.intelligence.overallReadiness}
      confidence={
        candidate.intelligence.financial.financingLikelihood
      }
    />
  }
/>

      <KPIRibbon
  items={[
    {
      label: "Readiness",
      value: candidate.intelligence.overallReadiness,
      description: "Overall franchise readiness",
    },
    {
      label: "Health",
      value: candidate.healthScore,
      description: "Opportunity health",
    },
    {
      label: "Decision Window",
      value: candidate.intelligence.timing.decisionWindow,
      description: "Expected buying timeline",
    },
    {
      label: "Investment",
      value: candidate.intelligence.financial.investmentRange,
      description: "Qualified investment",
    },
  ]}
/>

      <ExecutiveIntelligencePanel
        summary={
          candidate.intelligence
            .executiveSummary
        }
        strengths={[
          "High executive leadership capability",
          "Strong financial readiness",
          "Excellent coachability",
          "Clear long-term ownership motivation",
        ]}
        concerns={
          candidate.intelligence
            .discoveryPriorities
        }
        recommendation="Proceed immediately to Discovery. Candidate demonstrates a strong probability of successful franchise ownership."
        confidence={
          candidate.intelligence.financial
            .financingLikelihood
        }
      />
            <TwoColumn
        left={
          <IntelligenceProfileCard
            leadership={
              candidate.intelligence.competencies
                .leadership
            }
            sales={
              candidate.intelligence.competencies
                .sales
            }
            operations={
              candidate.intelligence.competencies
                .operations
            }
            coachability={
              candidate.intelligence.behavioral
                .coachability
            }
            financial={
              candidate.intelligence.financial
                .financingLikelihood
            }
          />
        }
        right={
          <BrandMatchMatrix
            brands={candidate.intelligence.recommendations.map(
              (brand) => ({
                id: brand.id,
                name: brand.name,
                overallFit: brand.overallFit,
                leadership:
                  candidate.intelligence.competencies
                    .leadership,
                sales:
                  candidate.intelligence.competencies
                    .sales,
                operations:
                  candidate.intelligence.competencies
                    .operations,
                financial:
                  candidate.intelligence.financial
                    .financingLikelihood,
                reasons: brand.reasons,
              }),
            )}
          />
        }
      />

      <TwoColumn
        left={
          <AIMeetingCoach
            objective="Validate executive ownership expectations and confirm readiness to move into the formal discovery process."

            strategy="Lead the discussion around long-term ownership goals before discussing specific brands. Use the assessment results to validate assumptions instead of repeating assessment questions."

            questions={[
              "What motivated you to begin exploring franchise ownership?",
              "Describe the largest team you've led.",
              "How involved do you expect to be during the first year of ownership?",
              "What does success look like five years after opening?",
            ]}

            concern="Transitioning from executive employment into business ownership."

            response="Position franchise ownership as the next step in an executive career while emphasizing proven operating systems, coaching, and scalability."

            nextAction="Schedule Discovery Meeting"

            confidence={
              candidate.intelligence.financial
                .financingLikelihood
            }
          />
        }
        right={
          <DiscoveryGuidePanel
            strengths={[
              "Executive leadership experience",
              "Financially qualified",
              "Strong coachability",
              "Excellent communication",
            ]}

            concerns={
              candidate.intelligence
                .discoveryPriorities
            }

            questions={[
              "Why now?",
              "Why franchising instead of starting your own business?",
              "How would your family describe your decision-making style?",
              "What role do you want to play after the business matures?",
            ]}
          />
        }
      />
            <TwoColumn
        left={
          <ConsultantBriefPanel
            executiveSummary={
              candidate.intelligence
                .executiveSummary
            }

            recommendedApproach="Conduct the conversation as an executive business discussion rather than a franchise sales presentation. Validate long-term ownership goals before presenting specific franchise brands."

            objectives={[
              "Validate ownership expectations",
              "Confirm operational involvement",
              "Confirm financial readiness",
              "Understand family alignment",
              "Establish decision timeline",
            ]}

            openingQuestions={[
              "Why business ownership now?",
              "What attracted you to franchising?",
              "Describe the leadership experience you're most proud of.",
              "What legacy are you hoping to create?",
            ]}

            nextActions={[
              "Schedule Discovery Meeting",
              "Review financial qualification",
              "Present top brand recommendations",
              "Begin validation process",
            ]}
          />
        }

        right={
          <ActivityTimeline
            activities={[
              {
                id: "1",
                title: "Assessment Completed",
                description:
                  "Candidate successfully completed the FranchiseReady Intelligence Assessment.",
                date: "Today",
              },
              {
                id: "2",
                title: "Intelligence Profile Generated",
                description:
                  "Behavioral, financial, competency, and readiness analysis completed.",
                date: "Today",
              },
              {
                id: "3",
                title: "Brand Recommendations Ready",
                description:
                  "The AI Engine identified the strongest franchise opportunities based on the complete intelligence profile.",
                date: "Today",
              },
              {
                id: "4",
                title: "Recommended Next Step",
                description:
                  "Proceed directly into Discovery while engagement and buying momentum remain high.",
                date: "Next",
              },
            ]}
          />
        }
      />

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-8 py-6">

          <p className="text-xs font-semibold uppercase tracking-[0.20em] text-blue-600">
            FranchiseReady Intelligence Summary
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Executive Recommendation
          </h2>

        </div>

        <div className="grid gap-10 p-8 xl:grid-cols-[2fr_1fr]">

          <div>

            <p className="leading-8 text-slate-700">
              Based on the complete behavioral, financial,
              operational, leadership, timing, and competency
              analysis, the Intelligence Engine recommends
              advancing this candidate into the formal
              discovery process. The overall readiness profile,
              combined with strong leadership capability and
              financial qualification, suggests a high
              probability of successful franchise ownership.
            </p>

            <p className="mt-6 leading-8 text-slate-700">
              The remaining discovery conversation should focus
              on validating long-term ownership expectations,
              preferred operating style, family alignment,
              desired lifestyle, and the candidate's preferred
              role after the business reaches maturity.
            </p>

          </div>

          <div className="space-y-5">
                        <SummaryMetric
              label="Overall Readiness"
              value={`${candidate.intelligence.overallReadiness}/100`}
            />

            <SummaryMetric
              label="Health Score"
              value={`${candidate.healthScore}/100`}
            />

            <SummaryMetric
              label="Decision Window"
              value={
                candidate.intelligence.timing
                  .decisionWindow
              }
            />

            <SummaryMetric
              label="Investment Range"
              value={
                candidate.intelligence.financial
                  .investmentRange
              }
            />

          </div>

        </div>

      </section>

    </WorkspaceLayout>
  );
}

type SummaryMetricProps = {
  label: string;
  value: string;
};

function SummaryMetric({
  label,
  value,
}: SummaryMetricProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-2xl font-bold tracking-tight text-blue-600">
        {value}
      </p>

    </div>
  );
}
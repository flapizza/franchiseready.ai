import { AIDecisionCard } from "./AIDecisionCard";
import { CandidateWorkspaceTabs } from "./CandidateWorkspaceTabs";

import { CandidateWorkspaceRuntime } from "../runtime/CandidateWorkspaceRuntime";

import { KPIRibbon } from "@/feature/ui/components/KPIRibbon";
import { PageHeader } from "@/feature/ui/components/PageHeader";
import { ReadinessGauge } from "@/feature/ui/components/ReadinessGauge";

type Props = {
  candidate: {
    id: string;

    firstName: string;

    lastName: string;

    healthScore: number;

    intelligence: {
      overallReadiness: number;

      executiveSummary: string;

      timing: {
        decisionWindow: string;
      };

      financial: {
        financingLikelihood: number;

        investmentRange: string;
      };
    };
  };
};

export function CandidateCommandCenter({
  candidate,
}: Props) {
  const runtime =
    new CandidateWorkspaceRuntime();

  const workspace =
    runtime.build(candidate);

  return (
    <section className="space-y-8">

      <PageHeader
        eyebrow="Candidate Intelligence Workspace"
        title={`${candidate.firstName} ${candidate.lastName}`}
        description={workspace.executiveSummary}
        actions={
          <ReadinessGauge
            score={workspace.readiness}
            confidence={
              workspace.decision.confidence
            }
          />
        }
      />

      <AIDecisionCard
        decision={workspace.decision}
      />

      <CandidateWorkspaceTabs
        candidateId={candidate.id}
        active="Command Center"
      />

      <KPIRibbon
        items={[
          {
            label: "Readiness",
            value: workspace.readiness,
            description:
              "Overall franchise readiness",
          },
          {
            label: "Health",
            value: workspace.health,
            description:
              "Opportunity health",
          },
          {
            label: "Decision Window",
            value:
              workspace.decisionWindow,
            description:
              "Expected buying timeline",
          },
          {
            label: "Investment",
            value:
              workspace.investmentRange,
            description:
              "Qualified investment",
          },
        ]}
      />

    </section>
  );
}
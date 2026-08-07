import type { ConsultantWorkbenchState } from "../runtime/ConsultantWorkbenchRuntime";

import { ConsultantHomeHero } from "./ConsultantHomeHero";

import { AIMissionControl } from "@/feature/crm/components/AIMissionControl";
import { AIOpportunityRadar } from "@/feature/crm/components/AIOpportunityRadar";
import { AIConfidenceCard } from "@/feature/crm/components/AIConfidenceCard";
import { AIReasoningCard } from "@/feature/crm/components/AIReasoningCard";

type Props = {
  state: ConsultantWorkbenchState;
};

export function ConsultantWorkbench({
  state,
}: Props) {
  return (
    <div className="space-y-8">

      <ConsultantHomeHero
        state={state.consultant}
      />

      <div className="grid gap-8 xl:grid-cols-2">

        <AIMissionControl
          missions={[
            {
              priority: "critical",
              title: "John Smith Needs Follow-up",
              description:
                "Buying confidence declined during the previous Discovery session.",
              action:
                "Schedule a Discovery follow-up within 24 hours.",
            },
            {
              priority: "high",
              title: "Sarah Williams Ready",
              description:
                "AI confidence exceeded the Brand Matching threshold.",
              action:
                "Advance to Brand Strategy.",
            },
          ]}
        />

        <AIOpportunityRadar
          items={[
            {
              id: "1",
              type: "opportunity",
              title: "High Executive Leadership",
              description:
                "Candidate consistently demonstrates executive-level leadership.",
            },
            {
              id: "2",
              type: "risk",
              title: "Family Alignment",
              description:
                "Family support has not yet been validated.",
            },
            {
              id: "3",
              type: "pattern",
              title: "Recurring Revenue",
              description:
                "Candidate repeatedly prefers recurring revenue models.",
            },
          ]}
        />

      </div>

      <div className="grid gap-8 xl:grid-cols-2">

        <AIConfidenceCard
          confidence={state.graph.confidence}
        />

        <AIReasoningCard
          reasoning={state.graph.reasoning}
        />

      </div>

    </div>
  );
}